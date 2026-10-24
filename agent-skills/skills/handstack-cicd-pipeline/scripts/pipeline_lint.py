#!/usr/bin/env python3
"""HandStack 빌드·배포 스크립트 정적 점검 (읽기 전용, Python 3.10+, 표준 라이브러리만 사용).

CI 정의(Jenkinsfile, GitHub Actions, GitLab CI), 빌드·배포 스크립트(.bat/.cmd/.ps1/.sh), Dockerfile/compose,
설정 파일(appsettings*.json)에서 배포 사고로 이어지기 쉬운 패턴을 찾는다. 스크립트나 SQL을 실행하지 않고,
비밀 후보는 값을 마스킹해서 위치만 보고한다. 결과는 후보이므로 대상 소스에서 확정한다.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

EXCLUDED_DIRS = {"node_modules", "bin", "obj", ".git", "lib", "libs", "vendor", "dist", "publish", "packages", "_workspace"}
SCRIPT_EXT = {".bat", ".cmd", ".ps1", ".sh"}
CI_NAMES = {"jenkinsfile", ".gitlab-ci.yml", "azure-pipelines.yml", "bitbucket-pipelines.yml", ".drone.yml"}
MAX_BYTES = 1_000_000

RULES = {
    "secret": ("ERROR", "비밀 값으로 보이는 리터럴 — CI 비밀 저장소·환경 변수로 주입하고 이미 노출됐다면 폐기·재발급"),
    "shared-mirror": ("WARN", "공유 폴더(contracts 등)를 미러링/삭제 동기화 — 같은 홈을 쓰는 다른 모듈의 파일이 삭제될 수 있음"),
    "home-delete": ("ERROR", "HANDSTACK_HOME 자체를 삭제 — 하위 폴더 단위로 대상을 한정"),
    "stop-all": ("WARN", "인자 없는 handstack stop — 여러 ack/dotnet 프로세스를 종료할 수 있음(--port 지정)"),
    "purge-contracts": ("INFO", "purgecontracts는 계약 파일을 삭제 — 대상 경로를 출력해 확인한 뒤에만"),
    "publish-shared-home": ("WARN", "publish 스크립트 호출에 HANDSTACK_HOME 격리 없음 — publish는 대상 폴더와 HANDSTACK_HOME/contracts를 삭제"),
    "env-mix": ("WARN", "운영/릴리즈 성격의 파일에서 development 설정 파일을 복사 — 환경 값 혼재 가능"),
    "robocopy-exit": ("INFO", "robocopy 종료 코드 검사 없음 — 0~7은 성공, 8 이상이 실패"),
    "docker-base": ("WARN", "Dockerfile 기반 이미지 .NET 버전이 프로젝트 TargetFramework보다 낮음"),
    "docker-unpinned": ("WARN", "고정되지 않은 이미지/다운로드(latest) — 재현 가능한 빌드를 위해 버전 고정"),
    "docker-pipe-shell": ("WARN", "다운로드 내용을 바로 셸에서 실행(curl | sh) — 체크섬 검증 후 실행"),
    "manage-key-empty": ("WARN", "ManagementKey가 비어 있음 — 배포 호스트 업로드 API가 인증 없이 열림(운영은 키 설정과 네트워크 제한)"),
    "dev-signin": ("WARN", "IsEnabledDevAutoSignIn=true — 개발(D) 환경에서만 허용"),
    "hardcoded-home": ("INFO", "절대 경로 하드코딩 — 환경 변수(HANDSTACK_HOME 등)나 매개변수로 받으면 재사용 가능"),
}

PLACEHOLDER = re.compile(
    r"(change[-_ ]?(this|me)|your[-_ ]|example|placeholder|dummy|xxxx|<[^>]+>|\$\{[^}]*\}|\$\([^)]*\)|%[A-Za-z_][A-Za-z0-9_]*%|"
    r"\$env:|\$\{\{|secrets\.|credentials\(|^\*+$|^$)", re.I)
SECRET_KEYS = (r"api[_-]?token|apitoken|access[_-]?token|auth[_-]?token|password|passwd|pwd|secret|client[_-]?secret|"
               r"access[_-]?key|private[_-]?key|managementkey|management[_-]?key|hostaccessid|connectionstring|encryption\w*key|aes\w*key")
SECRET_ASSIGN = re.compile(rf"(?i)[\"']?({SECRET_KEYS})[\"']?\s*[:=]\s*[\"']([^\"'\r\n]{{8,}})[\"']")
BEARER_LITERAL = re.compile(r"(?i)authorization\s*:\s*bearer\s+([A-Za-z0-9._\-]{16,})")
URL_CREDENTIAL = re.compile(r"(?i)\b[a-z][a-z0-9+.\-]*://([^/\s:@]+):([^/\s@]{3,})@")
KEY_TOKEN = re.compile(r"\b(AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{30,}|glpat-[A-Za-z0-9_\-]{20,}|xox[baprs]-[A-Za-z0-9\-]{10,})\b")
PRIVATE_KEY = re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----")


def line_of(text: str, pos: int) -> int:
    return text.count("\n", 0, pos) + 1


def mask(value: str) -> str:
    return (value[:2] + "***") if len(value) > 2 else "***"


def is_placeholder(value: str) -> bool:
    return bool(PLACEHOLDER.search(value.strip()))


def kind_of(path: Path) -> str:
    name = path.name.lower()
    if name.startswith("dockerfile") or name.endswith(".dockerfile"):
        return "docker"
    if name.startswith("docker-compose") or name in {"compose.yml", "compose.yaml"}:
        return "compose"
    if name in CI_NAMES or "workflows" in {p.lower() for p in path.parts} and path.suffix.lower() in {".yml", ".yaml"}:
        return "ci"
    if name.startswith("jenkinsfile"):
        return "ci"
    if path.suffix.lower() in SCRIPT_EXT:
        return "script"
    if name.startswith("appsettings") and path.suffix.lower() == ".json":
        return "settings"
    if name == ".env" or name.startswith(".env."):
        return "env"
    return ""


def iter_files(paths: list[Path]):
    for p in paths:
        if p.is_file():
            yield p
        elif p.is_dir():
            for f in sorted(p.rglob("*")):
                if f.is_file() and not (set(f.relative_to(p).parts[:-1]) & EXCLUDED_DIRS) and kind_of(f):
                    yield f


def read_text(path: Path) -> str:
    try:
        if path.stat().st_size > MAX_BYTES:
            return ""
        return path.read_bytes().decode("utf-8-sig", errors="replace")
    except OSError:
        return ""


def strip_comments(text: str, kind: str) -> str:
    """주석 줄을 같은 줄 수로 비운다(위치 보존). 문자열 안의 #는 신경 쓰지 않는 근사."""
    out = []
    for line in text.splitlines():
        s = line.lstrip()
        if kind == "script" and (s.startswith("::") or s.lower().startswith("rem ") or s.startswith("#")):
            out.append("")
        elif kind in {"ci", "compose", "docker", "env"} and s.startswith("#"):
            out.append("")
        else:
            out.append(line)
    return "\n".join(out)


def target_framework_major(root_paths: list[Path]) -> int:
    best = 0
    pattern = re.compile(r"<TargetFrameworks?>\s*([^<]+)</TargetFrameworks?>")
    for base in root_paths:
        base = base if base.is_dir() else base.parent
        for f in base.rglob("*.csproj"):
            if set(f.relative_to(base).parts[:-1]) & EXCLUDED_DIRS:
                continue
            m = pattern.search(read_text(f))
            if m:
                for tf in m.group(1).split(";"):
                    n = re.match(r"net(\d+)\.\d+", tf.strip())
                    if n:
                        best = max(best, int(n.group(1)))
    return best


def lint(text: str, path: str, kind: str, disabled: set[str], tfm_major: int = 0) -> list[dict]:
    out: list[dict] = []

    def add(rule: str, pos: int, detail: str = "") -> None:
        if rule in disabled:
            return
        sev, msg = RULES[rule]
        out.append({"file": path, "line": line_of(body, pos), "rule": rule, "severity": sev,
                    "message": msg + (f" ({detail})" if detail else "")})

    body = strip_comments(text, kind)

    # 비밀 후보: 값은 출력하지 않는다
    for m in SECRET_ASSIGN.finditer(body):
        key, value = m.group(1), m.group(2)
        if not is_placeholder(value):
            add("secret", m.start(), f"{key}={mask(value)}")
    for m in BEARER_LITERAL.finditer(body):
        if not is_placeholder(m.group(1)):
            add("secret", m.start(), f"Bearer {mask(m.group(1))}")
    for m in URL_CREDENTIAL.finditer(body):
        if not is_placeholder(m.group(2)):
            add("secret", m.start(), f"URL 계정 {m.group(1)}:{mask(m.group(2))}@")
    for m in KEY_TOKEN.finditer(body):
        add("secret", m.start(), mask(m.group(1)))
    for m in PRIVATE_KEY.finditer(body):
        add("secret", m.start(), "개인 키 블록")

    if kind == "settings":
        for m in re.finditer(r'"ManagementKey"\s*:\s*""', body):
            add("manage-key-empty", m.start())
        for m in re.finditer(r'"IsEnabledDevAutoSignIn"\s*:\s*(true|"true")', body, re.I):
            add("dev-signin", m.start())

    if kind in {"script", "ci"}:
        for m in re.finditer(r"(?i)\brobocopy\b[^\r\n]*", body):
            tokens = [t.strip("\"'") for t in m.group(0).split()[1:]]
            paths = [t for t in tokens if not t.startswith("/")]
            flags = {t.lower() for t in tokens if t.startswith("/")}
            if len(paths) >= 2 and flags & {"/mir", "/purge"}:
                dest = paths[1].replace("\\", "/").rstrip("/").lower()
                if dest.endswith("/contracts") and "/modules/" not in dest:
                    add("shared-mirror", m.start(), "robocopy /mir")
        for m in re.finditer(r"(?i)\brsync\b[^\r\n]*--delete[^\r\n]*", body):
            line = m.group(0)
            if re.search(r"(?i)contracts/?(\s|$)", line):
                add("shared-mirror", m.start(), "rsync --delete")
        for m in re.finditer(r"(?i)(rm\s+-[a-z]*r[a-z]*f?[a-z]*\s+|remove-item\b[^\r\n]*?|rmdir\s+/s\s+(/q\s+)?|rd\s+/s\s+(/q\s+)?)\"?"
                             r"(\$\{?HANDSTACK_HOME\}?|\$env:HANDSTACK_HOME|%HANDSTACK_HOME%)[\\/]?\"?\s*($|[;&|])", body, re.M):
            add("home-delete", m.start())
        for m in re.finditer(r"(?i)\bhandstack(\.exe)?\s+stop\s*($|[|&;])", body, re.M):
            add("stop-all", m.start())
        for m in re.finditer(r"(?i)\bpurgecontracts\b", body):
            add("purge-contracts", m.start())
        publish_calls = list(re.finditer(r"(?i)(?:^|[\s;&|(])(?:\./|\.\\|call\s+|pwsh\s+(?:-\w+\s+)*(?:-File\s+)?)?publish\.(?:ps1|sh|bat)\b", body, re.M))
        if publish_calls and not re.search(r"(?i)HANDSTACK_HOME\s*[=:]|\$env:HANDSTACK_HOME\s*=|set\s+\"?HANDSTACK_HOME=|export\s+HANDSTACK_HOME=", body):
            add("publish-shared-home", publish_calls[0].start())
        if re.search(r"(?i)prod|release", Path(path).name) or re.search(r"(?i)\b(prod(uction)?|release)\b", body[:400]):
            for m in re.finditer(r"(?i)\b(copy|cp|xcopy|robocopy|Copy-Item)\b[^\r\n]*development[^\r\n]*", body):
                add("env-mix", m.start())
        if kind == "script" and path.lower().endswith((".bat", ".cmd")) and re.search(r"(?i)\brobocopy\b", body) \
                and not re.search(r"(?i)errorlevel", body):
            add("robocopy-exit", re.search(r"(?i)\brobocopy\b", body).start())
        for m in re.finditer(r"(?i)[\"']?([A-Z]:[\\/](?:workspace|home|projects|deploy|build)[\\/][^\s\"']*)", body):
            add("hardcoded-home", m.start(), m.group(1)[:40])
            break

    if kind == "docker":
        stages = {s.lower() for s in re.findall(r"(?im)^\s*FROM\s+.*?\s+AS\s+(\S+)", body)}
        for m in re.finditer(r"(?im)^\s*FROM\s+(?:--platform=\S+\s+)?(\S+)", body):
            image = m.group(1)
            if image.lower() == "scratch" or "$" in image or image.lower() in stages:
                continue
            tag = image.split(":", 1)[1] if ":" in image.rsplit("/", 1)[-1] else ""
            if tag in {"", "latest"}:
                add("docker-unpinned", m.start(), image)
            dm = re.search(r"dotnet/(?:aspnet|sdk|runtime):(\d+)\.", image)
            if dm and tfm_major and int(dm.group(1)) < tfm_major:
                add("docker-base", m.start(), f"{image} < net{tfm_major}")
        for m in re.finditer(r"(?i)releases/latest|/latest/download", body):
            add("docker-unpinned", m.start(), "릴리즈 latest 다운로드")
        for m in re.finditer(r"(?i)(curl|wget)[^\r\n]*\|\s*(sudo\s+)?(ba)?sh\b", body):
            add("docker-pipe-shell", m.start())

    if kind == "compose":
        for m in re.finditer(r"(?im)^\s*image:\s*(\S+)", body):
            image = m.group(1)
            if "$" in image:
                continue
            tag = image.split(":", 1)[1] if ":" in image.rsplit("/", 1)[-1] else ""
            if tag in {"", "latest"} and "/" in image.replace("docker.io/", ""):
                add("docker-unpinned", m.start(), image)

    return out


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description="HandStack 빌드·배포 스크립트 점검(읽기 전용)")
    ap.add_argument("paths", nargs="*", type=Path, default=[Path(".")], help="점검할 파일 또는 폴더(기본: 현재 폴더)")
    ap.add_argument("--disable", action="append", default=[], help="끌 규칙 id (여러 번)")
    ap.add_argument("--list-rules", action="store_true")
    ap.add_argument("--min-severity", choices=("INFO", "WARN", "ERROR"), default="WARN")
    ap.add_argument("--fail-on", choices=("ERROR", "WARN", "never"), default="never")
    ap.add_argument("--limit", type=int, default=200)
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args(argv)
    if args.list_rules:
        for rid, (sev, msg) in RULES.items():
            print(f"{rid}\t{sev}\t{msg}")
        return 0
    disabled = set(args.disable)
    unknown = disabled - set(RULES)
    if unknown:
        print("알 수 없는 규칙: " + ", ".join(sorted(unknown)), file=sys.stderr)
        return 2
    order = {"INFO": 0, "WARN": 1, "ERROR": 2}
    tfm = target_framework_major(args.paths)
    findings: list[dict] = []
    count = 0
    for f in iter_files(args.paths):
        kind = kind_of(f)
        if not kind:
            continue
        count += 1
        findings += lint(read_text(f), str(f), kind, disabled, tfm)
    shown = [x for x in findings if order[x["severity"]] >= order[args.min_severity]]
    if args.json:
        print(json.dumps(shown, ensure_ascii=False, indent=2))
    else:
        for x in shown[: args.limit]:
            print(f"{x['file']}:{x['line']}: [{x['severity']}] {x['rule']}: {x['message']}")
        if len(shown) > args.limit:
            print(f"… {len(shown) - args.limit}건 생략(--limit)")
    print(f"# 파일 {count}개, 표시 {len(shown)}건(전체 {len(findings)}건)", file=sys.stderr)
    level = {"ERROR": 2, "WARN": 1, "never": 99}[args.fail_on]
    return 1 if any(order[x["severity"]] >= level for x in findings) else 0


if __name__ == "__main__":
    sys.exit(main())

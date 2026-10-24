#!/usr/bin/env python3
"""배포용 스킬 번들 검증기 (표준 라이브러리만 사용).

- SKILL.md frontmatter(name/description 규칙, 허용 키), 본문 길이, 참조 파일 목차
- 상대 링크와 형제 스킬 스크립트 경로 존재
- guides/ 문서의 상대 링크·앵커 존재와 템플릿 훅 스크립트의 Python 구문
- Codex UI 메타데이터(agents/openai.yaml)
- Python 구문, 캐시 파일 혼입, 비밀 값 패턴
- 금지어: config/banned-terms.txt(기본)의 [all] 패턴은 스킬 번들과 docs 전체에, [skills] 패턴은 스킬 번들에만 적용
  (패턴 뒤 ";except=스킬이름,..."은 그 스킬에서는 허용)
- 선택: --installed-root 의 설치본과 내용 일치
"""
import argparse
import ast
import hashlib
import re
import sys
from pathlib import Path

ALLOWED_KEYS = {"name", "description", "license", "allowed-tools", "metadata"}
TEXT_SUFFIXES = {".md", ".py", ".yaml", ".yml", ".json", ".ps1", ".txt"}
SECRET_PATTERN = re.compile(
    r"""(?ix)(password|pwd|secret|api[_-]?key|appkey|access[_-]?token|connectionstring)\s*[=:]\s*['"]?(?![<{$])[A-Za-z0-9+/=_\-]{16,}""")


def digest_tree(root):
    return {p.relative_to(root).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in root.rglob("*") if p.is_file()}


def read(path):
    return path.read_text(encoding="utf-8").replace("\r\n", "\n")


def parse_frontmatter(text):
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not m:
        return None
    data = {}
    for line in m.group(1).split("\n"):
        kv = re.match(r"^([A-Za-z-]+):\s*(.*)$", line)
        if kv:
            data[kv.group(1)] = kv.group(2).strip()
    return data


def check_skill(folder, skills_root, errors):
    text = read(folder / "SKILL.md")
    front = parse_frontmatter(text)
    if front is None:
        errors.append(f"{folder.name}: frontmatter 없음")
        return
    extra = set(front) - ALLOWED_KEYS
    if extra:
        errors.append(f"{folder.name}: 허용되지 않은 frontmatter 키 {sorted(extra)}")
    name, desc = front.get("name", ""), front.get("description", "")
    if name != folder.name or not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", name) or len(name) > 64:
        errors.append(f"{folder.name}: name이 폴더명/hyphen-case 규칙과 다름")
    if not desc:
        errors.append(f"{folder.name}: description 없음")
    if len(desc) > 1024:
        errors.append(f"{folder.name}: description {len(desc)}자 (최대 1024)")
    if "<" in desc or ">" in desc:
        errors.append(f"{folder.name}: description에 꺾쇠 괄호 사용")
    if text.count("\n") > 500:
        errors.append(f"{folder.name}: SKILL.md가 500줄을 넘음")
    yaml_path = folder / "agents" / "openai.yaml"
    if not yaml_path.is_file():
        errors.append(f"{folder.name}: agents/openai.yaml 없음")
    else:
        y = read(yaml_path)
        for key in ("display_name", "short_description", "default_prompt"):
            if not re.search(rf"^\s+{key}:\s*\".+\"", y, re.M):
                errors.append(f"{folder.name}: openai.yaml에 {key} 없음")
        if f"${name}" not in y:
            errors.append(f"{folder.name}: openai.yaml default_prompt에 ${name} 호출 없음")
    for path in folder.rglob("*"):
        if not path.is_file():
            continue
        if "__pycache__" in path.parts or path.suffix in (".pyc", ".pyo"):
            errors.append(f"{path}: 파이썬 캐시가 번들에 포함됨")
        if path.suffix == ".py":
            try:
                ast.parse(path.read_text(encoding="utf-8"))
            except SyntaxError as exc:
                errors.append(f"{path}:{exc.lineno}: Python 구문 오류")
        if path.suffix == ".md":
            content = read(path)
            if re.search(r"\bTODO\b", content):
                errors.append(f"{path}: 미완성 표시")
            if path != folder / "SKILL.md" and content.count("\n") > 300 and "목차" not in content:
                errors.append(f"{path}: 300줄 초과 참조 문서에 목차가 없음")
            for target in re.findall(r"\[[^\]]+\]\(([^)]+)\)", content):
                if re.match(r"^[a-z]+://", target) or target.startswith("#"):
                    continue
                resolved = (path.parent / target.split("#", 1)[0]).resolve()
                if not resolved.is_file() or not resolved.is_relative_to(folder.resolve()):
                    errors.append(f"{path}: 존재하지 않거나 이식 불가한 링크 {target}")
            for sibling in re.findall(r"\.\./(handstack-[a-z-]+/[A-Za-z0-9_./-]+)", content):
                if not (skills_root / sibling).is_file():
                    errors.append(f"{path}: 형제 스킬 경로 없음 {sibling}")


def load_banned(path):
    """금지어 파일을 {"all": [...], "skills": [...]}로 읽는다. 항목은 (정규식, 예외 스킬 집합).

    `[all]`/`[skills]` 구역 표시가 없는 앞부분(과 구역 없는 파일)은 `[skills]`로 취급한다.
    """
    banned = {"all": [], "skills": []}
    scope = "skills"
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        section = re.fullmatch(r"\[(all|skills)\]", line)
        if section:
            scope = section.group(1)
            continue
        pattern, _, excepted = line.partition(";except=")
        banned[scope].append((re.compile(pattern.strip(), re.I),
                              {name.strip() for name in excepted.split(",") if name.strip()}))
    return banned


def skill_of(path, skills_root):
    try:
        return path.resolve().relative_to(skills_root.resolve()).parts[0]
    except (ValueError, IndexError):
        return None


def check_text_files(files, banned, errors, skills_root=None):
    for path in files:
        if path.suffix not in TEXT_SUFFIXES or not path.is_file():
            continue
        content = path.read_text(encoding="utf-8", errors="replace")
        owner = skill_of(path, skills_root) if skills_root else None
        for pattern, excepted in banned:
            if owner in excepted:
                continue
            m = pattern.search(content)
            if m:
                errors.append(f"{path}: 금지어 발견 '{m.group(0)}'")
        m = SECRET_PATTERN.search(content)
        if m:
            errors.append(f"{path}: 비밀 값처럼 보이는 문자열 '{m.group(0)[:30]}…'")


LINK = re.compile(r"(?<!\!)\[[^\]]*\]\(([^)\s]+)\)")
FENCE = re.compile(r"```.*?```", re.S)


def slug(heading):
    """GitHub식 앵커: 소문자, 구두점 제거(하이픈·밑줄 유지), 공백은 하이픈."""
    text = re.sub(r"`", "", heading.strip().lower())
    text = re.sub(r"[^\w\- 가-힣]", "", text)
    return text.replace(" ", "-")


def anchors_of(path):
    body = FENCE.sub("", read(path))
    return {slug(m.group(1)) for m in re.finditer(r"^#{1,6}\s+(.+?)\s*$", body, re.M)}


def check_guides(guides_root, errors):
    if not guides_root.is_dir():
        return
    for path in sorted(guides_root.rglob("*.md")):
        body = FENCE.sub("", read(path))
        for m in LINK.finditer(body):
            target = m.group(1)
            if re.match(r"[a-z]+://|mailto:", target):
                continue
            file_part, _, anchor = target.partition("#")
            dest = (path.parent / file_part) if file_part else path
            if file_part and not dest.exists():
                errors.append(f"{path}: 링크 대상 없음 {target}")
            elif anchor and dest.suffix == ".md" and slug(anchor) not in anchors_of(dest):
                errors.append(f"{path}: 앵커 없음 {target}")
    for script in sorted(guides_root.rglob("*.py")):
        try:
            ast.parse(read(script))
        except SyntaxError as exc:
            errors.append(f"{script}: 구문 오류 {exc}")


def check_docs(docs_root, banned, errors):
    """공개 문서에서 비공개 전용 표현([all] 패턴)이 없는지 확인한다. 일반 도구 예제의 비밀 값 패턴은 보지 않는다."""
    for path in sorted(docs_root.rglob("*")):
        if path.suffix not in (".md", ".mdx") or not path.is_file():
            continue
        content = path.read_text(encoding="utf-8", errors="replace")
        for pattern, _ in banned:
            m = pattern.search(content)
            if m:
                errors.append(f"{path}: 금지어 발견 '{m.group(0)}'")


def validate(skills_root, extra_files=(), banned=(), installed_roots=(), guides_root=None,
             docs_root=None, docs_banned=()):
    errors = []
    folders = sorted(p.parent for p in skills_root.glob("*/SKILL.md"))
    if not folders:
        errors.append("스킬이 없음")
    names = [f.name for f in folders]
    if len(names) != len(set(names)):
        errors.append("중복된 스킬 이름")
    for folder in folders:
        check_skill(folder, skills_root, errors)
        for installed in installed_roots:
            target = installed / folder.name
            if not target.is_dir() or digest_tree(folder) != digest_tree(target):
                errors.append(f"{target}: 설치본 내용이 다름")
    files = [p for p in skills_root.rglob("*") if p.is_file()] + list(extra_files)
    check_text_files(files, banned, errors, skills_root)
    if guides_root is not None:
        check_guides(guides_root, errors)
    if docs_root is not None:
        check_docs(docs_root, docs_banned, errors)
    return folders, errors


def main(argv=None):
    base = Path(__file__).resolve().parents[1]
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--skills-root", type=Path, default=base / "skills")
    ap.add_argument("--installed-root", action="append", type=Path, default=[])
    ap.add_argument("--banned-terms-file", type=Path, default=base / "config" / "banned-terms.txt",
                    help="금지어 정규식 목록([all]/[skills] 구역, 한 줄에 하나, # 주석). 번들에 포함하지 않는 파일")
    ap.add_argument("--docs-root", type=Path, default=base.parent / "docs",
                    help="공개 문서 폴더. [all] 금지어만 검사한다. 없으면 건너뜀")
    args = ap.parse_args(argv)
    banned, docs_banned = [], []
    if args.banned_terms_file.is_file():
        loaded = load_banned(args.banned_terms_file)
        banned = loaded["all"] + loaded["skills"]
        docs_banned = loaded["all"]
    extra = sorted(base.glob("*.md")) + [p for p in (base / "Install-Skills.ps1",) if p.is_file()]
    for folder in ("scripts", "tests", "guides"):
        if (base / folder).is_dir():
            extra += [p for p in (base / folder).rglob("*") if p.is_file() and "__pycache__" not in p.parts]
    docs_root = args.docs_root if args.docs_root.is_dir() else None
    folders, errors = validate(args.skills_root, extra, banned, args.installed_root, base / "guides",
                               docs_root, docs_banned)
    for error in errors:
        print("ERROR:", error)
    print(f"스킬 {len(folders)}개; 오류 {len(errors)}개; 금지어 패턴 {len(banned)}개(docs {len(docs_banned)}개"
          f"{'' if docs_root else ', docs 없음'}); 설치본 {len(args.installed_root)}곳 비교")
    return 1 if errors else 0


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    raise SystemExit(main())

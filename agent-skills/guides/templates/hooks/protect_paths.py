#!/usr/bin/env python3
"""Claude Code PreToolUse 훅: 에이전트가 편집하면 안 되는 경로를 차단한다 (Python 3.10+, 표준 라이브러리만 사용).

표준 입력으로 훅 JSON(`tool_input.file_path` 또는 `tool_input.path`)을 받는다.
보호 대상이면 사유를 표준 오류로 출력하고 종료 코드 2로 끝내 편집을 막는다(메시지는 에이전트에게 전달된다).

프로젝트별 추가 규칙: `.claude/protected-paths.txt`에 한 줄에 glob 하나(# 주석). 저장소 루트 기준 상대 경로.
"""
from __future__ import annotations

import fnmatch
import json
import os
import sys
from pathlib import Path

DEFAULT_PATTERNS = [
    # 비밀·키·환경 파일
    (".env", "비밀 값 파일 — 환경 변수/비밀 저장소로 주입한다"),
    (".env.*", "비밀 값 파일 — 환경 변수/비밀 저장소로 주입한다"),
    ("*.pfx", "인증서/키 파일"), ("*.pem", "인증서/키 파일"), ("*.key", "인증서/키 파일"),
    ("*/secrets/*", "비밀 폴더"),
    # 운영 환경 설정
    ("*appsettings.production.json", "운영 설정 — 담당자와 승인 절차로만 변경"),
    ("*appsettings.p.json", "운영 설정 — 담당자와 승인 절차로만 변경"),
    # 생성물·외부 라이브러리
    ("*/bin/*", "빌드 산출물"), ("*/obj/*", "빌드 산출물"), ("*/node_modules/*", "외부 패키지"),
    ("*/publish/*", "배포 산출물"),
    ("*.staticwebassets.*.json", "생성 파일"),
    ("*/wwwroot/*/lib/*", "외부 라이브러리(벤더) — 수정하지 않고 교체한다"),
    ("*/.git/*", "Git 내부 파일"),
]


def load_extra(root: Path) -> list[tuple[str, str]]:
    extra = []
    path = root / ".claude" / "protected-paths.txt"
    if path.is_file():
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#"):
                extra.append((line.replace("\\", "/").lower(), "프로젝트 보호 경로(.claude/protected-paths.txt)"))
    return extra


def check(file_path: str, root: Path) -> str | None:
    """보호 대상이면 사유 문자열, 아니면 None."""
    p = Path(file_path)
    try:
        rel = p.resolve().relative_to(root.resolve()).as_posix() if p.is_absolute() else p.as_posix()
    except ValueError:
        rel = p.as_posix()
    rel = rel.replace("\\", "/").lower()
    candidates = [rel, "/" + rel]
    name = rel.rsplit("/", 1)[-1]
    for pattern, reason in DEFAULT_PATTERNS + load_extra(root):
        pat = pattern.lower()
        if any(fnmatch.fnmatch(c, pat) for c in candidates) or fnmatch.fnmatch(name, pat):
            return reason
    return None


def main() -> int:
    for stream in (sys.stdin, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8")  # Windows 기본 코드페이지와 무관하게 UTF-8로 입출력
        except (AttributeError, ValueError):
            pass
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        return 0  # 입력을 해석하지 못하면 막지 않는다(훅 오류로 작업이 멈추지 않게)
    tool_input = payload.get("tool_input") or {}
    file_path = tool_input.get("file_path") or tool_input.get("path") or ""
    if not file_path:
        return 0
    root = Path(os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd())
    reason = check(file_path, root)
    if reason:
        print(f"편집 차단: {file_path} — {reason}. 필요하면 담당자에게 요청하세요.", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())

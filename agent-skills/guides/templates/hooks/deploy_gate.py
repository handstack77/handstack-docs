#!/usr/bin/env python3
"""Claude Code PreToolUse 훅(Bash): 운영에 영향을 주는 명령을 릴리즈 승인 없이는 막는다 (Python 3.10+, 표준 라이브러리만).

표준 입력으로 훅 JSON(`tool_input.command`)을 받는다. 아래 위험 패턴에 해당하고 환경 변수 `RELEASE_APPROVAL`이
비어 있으면 사유를 표준 오류로 출력하고 종료 코드 2로 끝낸다(에이전트에게 사유가 전달되고 명령은 실행되지 않는다).
`RELEASE_APPROVAL`에는 승인 번호/릴리즈 식별자를 사람이 설정한다. 에이전트가 스스로 설정하지 못하도록
세션을 시작하기 전에 운영 담당자가 환경에 지정하거나, 관리형 설정에서 이 훅을 비활성화할 수 없게 둔다.

이 훅은 안전망이다. 운영 서버에는 에이전트에게 쓰기 자격 증명을 주지 않는 것이 우선이다.
"""
from __future__ import annotations

import json
import os
import re
import sys

RULES = [
    (r"(?i)(^|[\s;&|(])(\./|\.\\|call\s+)?publish\.(ps1|sh|bat)\b", "publish 스크립트는 대상 폴더와 HANDSTACK_HOME/contracts를 삭제한다"),
    (r"(?i)\bhandstack(\.exe)?\s+purgecontracts\b", "purgecontracts는 계약 파일을 삭제한다"),
    (r"(?i)\bhandstack(\.exe)?\s+stop\s*($|[|&;])", "인자 없는 handstack stop은 여러 ack/dotnet 프로세스를 종료할 수 있다(--port 지정)"),
    (r"(?i)(rm\s+-[a-z]*r[a-z]*f?[a-z]*|remove-item\b[^\r\n]*-recurse|rmdir\s+/s|rd\s+/s)[^\r\n]*HANDSTACK_HOME", "HANDSTACK_HOME 하위 삭제"),
    (r"(?i)\brobocopy\b[^\r\n]*/(mir|purge)\b", "robocopy /mir·/purge는 대상 폴더의 다른 파일을 삭제한다"),
    (r"(?i)\brsync\b[^\r\n]*--delete\b", "rsync --delete는 대상 폴더의 다른 파일을 삭제한다"),
    (r"(?i)/api/update-packages\b", "업데이트 패키지를 배포 호스트에 업로드"),
    (r"(?i)\bupdater(\.exe)?\b[^\r\n]*--manifest-url", "updater가 서버 파일을 교체한다"),
    (r"(?i)\bdocker\s+(compose\s+)?(down|rm|rmi)\b", "컨테이너/이미지 삭제"),
    (r"(?i)\bdocker\s+compose\b[^\r\n]*\bup\b[^\r\n]*--build", "운영 컨테이너 재빌드·재기동"),
]


def check(command: str) -> str | None:
    for pattern, reason in RULES:
        if re.search(pattern, command):
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
        return 0
    command = ((payload.get("tool_input") or {}).get("command")) or ""
    reason = check(command)
    if reason and not os.environ.get("RELEASE_APPROVAL", "").strip():
        print(f"운영 관문: {reason}. 릴리즈 승인(RELEASE_APPROVAL) 없이는 실행할 수 없습니다. "
              "승인 담당자에게 요청하거나 비운영(격리) 환경에서 실행하세요.", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())

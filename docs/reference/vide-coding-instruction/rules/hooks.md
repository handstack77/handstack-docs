# hooks

훅(Hooks) 시스템

## 훅 유형

- **PreToolUse**: 도구 실행 전 (유효성 검사, 파라미터 수정)
- **PostToolUse**: 도구 실행 후 (자동 포맷팅, 검사)
- **Stop**: 세션 종료 시 (최종 검증)

## 현재 훅 (~/.claude/settings.json 내)

### PreToolUse
- **tmux reminder**: 장기 실행 명령어(npm, pnpm, yarn, cargo 등)에 대해 tmux 제안
- **git push review**: 푸시 전 검토를 위해 Zed 열기
- **doc blocker**: 불필요한 .md/.txt 파일 생성 차단

### PostToolUse
- **PR creation**: PR URL 및 GitHub Actions 상태 기록
- **Prettier**: 편집 후 JS/TS 파일 자동 포맷팅
- **TypeScript check**: .ts/.tsx 파일 편집 후 tsc 실행
- **console.log warning**: 편집된 파일 내 console.log 경고

### Stop
- **console.log audit**: 세션 종료 전 수정된 모든 파일에서 console.log 확인

## 권한 자동 수락 (Auto-Accept Permissions)

주의해서 사용하세요:
- 신뢰할 수 있고 명확히 정의된 계획에만 활성화
- 탐색적 작업에는 비활성화
- dangerously-skip-permissions 플래그는 절대 사용 금지
- 대신 `~/.claude.json`의 `allowedTools` 설정 사용

## TodoWrite 모범 사례

TodoWrite 도구 사용 목적:
- 다단계 작업의 진행 상황 추적
- 지시 사항 이해도 검증
- 실시간 방향 조정 활성화
- 세부 구현 단계 표시

할 일 목록(Todo list)이 드러내는 것:
- 순서가 잘못된 단계
- 누락된 항목
- 불필요한 추가 항목
- 잘못된 세분화 수준
- 요구사항 오해

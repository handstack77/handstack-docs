# handstack-dev-hooks

Handstack 개발 훅 (Hooks for Handstack Dev)

이 문서는 Claude Code의 훅 시스템을 사용하여 Handstack 개발 생산성을 높이는 방법을 설명합니다. (`hooks/hooks.json` 설정 가이드)

## 추천 훅 설정

### 1. XML 유효성 검사 (Pre-Save)
XML 파일을 수정할 때 구문 오류나 누락된 태그를 확인합니다.

```json
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"src/Contracts/.*\\.xml$\"",
  "hooks": [{
    "type": "command",
    "command": "xmllint --noout \"$file_path\" || echo '[Warn] Invalid XML syntax' >&2"
  }]
}
```

### 2. JS/XML ID 일치 확인 (Post-Save)
JS 파일을 수정했을 때, 해당 파일 내의 `transaction` ID들이 XML 파일에 존재하는지 확인하는 스크립트를 실행할 수 있습니다.

```json
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"src/view/.*\\.js$\"",
  "hooks": [{
    "type": "command",
    "command": "node scripts/check-transaction-ids.js \"$file_path\""
  }]
}
```

### 3. 스캐폴딩 후 자동 열기
`/handstack-scaffold` 명령어 실행 후 생성된 파일들을 자동으로 에디터에서 엽니다. (예: `code` 명령어 사용)

## Handstack 런타임 훅 (JS 내 `hook` 객체)

Handstack 프레임워크 자체의 훅(`src/view/.../CDM010.js` 내의 `hook` 객체)은 다음 생명주기를 가집니다:

1. **pageLoad()**: 페이지 로드 직후 실행. 초기 조회(`LD01`)에 사용.
2. **pageResizing(dimension)**: 브라우저 창 크기 변경 시 실행. 그리드 높이 조절에 사용.
3. **beforeTrigger(elID, action)**: 그리드 행 추가/삭제 전 실행. 유효성 검사에 사용.
4. **beforeTransaction(config)**: 트랜잭션 전송 직전 실행. 파라미터 조작에 사용.
5. **afterTransaction(error, funcID, response)**: 서버 응답 후 실행. 결과 알림 및 UI 갱신.

**주의**: 이 파일은 개발 도구 훅이 아닌, 프레임워크 런타임 훅에 대한 설명을 포함합니다.

```
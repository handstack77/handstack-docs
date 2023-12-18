---
title: Markdown page example
---

# Markdown page example

You don't need React to write simple standalone pages.

```mermaid
sequenceDiagram
    사용자->>프록시 서버: 페이지 요청
    정적빌드 결과물 -->>프록시 서버: 원본 HTML 전달
    프록시 서버-->>프록시 서버 :원본 HTML 수정
    프록시 서버-)사용자: 수정된 HTML 반환
		사용자 -->> 사용자 : JS로 페이지 생성
```


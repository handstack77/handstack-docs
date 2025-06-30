---
marp: true
theme: gaia
_class: lead
footer: QCN
paginate: true
backgroundColor: #fff
---

<style>
:root {
  font-family: Pretendard;
  --border-color: #303030;
  --text-color: #0a0a0a;
  --bg-color-alt: #dadada;
  --mark-background: #ffef92;
}

h1 {
  border-bottom: none;
  font-size: 1.6em;
}

h2 {
  border-bottom: none;
  font-size: 1.3em;
}

h3 {
  font-size: 1.1em;
}

h4 {
  font-size: 1.05em;
}

h5 {
  font-size: 1em;
}

h6 {
  font-size: 0.9em;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  color: var(--text-color);
}

code:not([class*="language-"]) {
  font-family: D2Coding;
  color: #000;
  vertical-align: text-bottom;
  background-color: rgba(100, 100, 100, 0.2);
}

section {
  background-image: linear-gradient(to bottom right, #f7f7f7 0%, #d3d3d3 100%);
}

section table {
    margin: auto;
    font-size: 28px;
}

section::after {
  font-size: 0.75em;
  content: attr(data-marpit-pagination) " / " attr(data-marpit-pagination-total);
}

img[alt~="center"] {
  display: block;
  margin: 0 auto;
}

blockquote {
  font-size: 26px;
  border-left: 8px solid var(--border-color);
  background: var(--bg-color-alt);
  margin: 0.5em;
  padding: 0.5em;
}

blockquote::before,
blockquote::after {
    content: '';
}

mark {
  background-color: var(--mark-background);
  padding: 0 2px 2px;
  border-radius: 4px;
  margin: 0 2px;
}

section.tinytext>p,
section.tinytext>ul,
section.tinytext>blockquote {
  font-size: 0.65em;
}
</style>

# HandStack 라우팅의 마법
### URL과 페이지의 연결

---

## 라우팅이란 무엇일까요?

- 사용자가 웹 브라우저 주소창에 URL을 입력했을 때, 서버가 어떤 페이지나 데이터를 보여줄지 결정하는 과정입니다.

- 마치 집 주소를 보고 우편물을 배달하는 길잡이와 같습니다.

- HandStack은 이 과정을 매우 편리하게 자동화합니다.
  - URL을 `kebab-case` (대시로 구분된 소문자) 형태로 자동 변환하여 가독성과 검색 엔진 최적화(SEO)를 높입니다.

---

## Controller 라우팅: C# 코드가 URL로

- HandStack은 C# Controller의 이름과 메서드(Action) 이름을 조합하여 API 주소를 자동으로 만듭니다.

- 예시:
  - Controller 클래스 이름: `UserManagementController`
  - Action 메서드 이름: `GetUserProfile`
  - 변환된 URL: `/user-management/get-user-profile`

- 코드에서는 다음과 같은 속성(Attribute)으로 정의됩니다.
  ```csharp
  [Area("[모듈 ID]")]
  [Route("[area]/api/[controller]")]
  public class UserManagementController : Controller
  {
      [HttpGet("[action]")]
      public async Task<object> GetUserProfile()
      {
          // ... 로직 ...
      }
  }
  ```

---

## Razor Pages 라우팅: 파일 경로가 URL로

- 웹 페이지를 만드는 Razor Pages의 경우, 파일과 폴더의 경로가 그대로 URL 주소가 됩니다.

- 예시:
  - 파일 경로: `Pages/UserProfile/EditProfile.cshtml`
  - 변환된 URL: `/user-profile/edit-profile`

- 페이지 상단에는 어떤 모듈에 속하는지 명시합니다.
  ```csharp
  @page
  @model [모듈 ID].Areas.[모듈 ID].Pages.UserProfile.EditProfileModel
  @{
      // ... 페이지 내용 ...
  }
  ```

---

## 직접 확인해볼까요? (핸즈온)

- 실제 프로젝트 파일이 어떻게 URL로 연결되는지 직접 눈으로 확인해 보세요.

- 아래 경로로 이동하여 파일을 열어보세요.
  `$(HANDSTACK_SRC)/2.Modules/[모듈 ID]/Areas`

- `*Controller.cs` 파일을 열어 Controller 이름과 Action 이름을 확인하고 URL을 유추해 보세요.
- `Pages` 폴더 안의 `.cshtml` 파일 경로를 보고 URL이 어떻게 될지 생각해 보세요.

---

## 라우팅 규칙을 직접 바꿀 수도 있나요?

- 네, 가능합니다.
- HandStack은 자동 `kebab-case` 라우팅을 기본으로 제공하지만, 필요에 따라 URL을 직접 지정할 수도 있습니다.

- Controller Action에 `[Route]` 속성을 사용하면 원하는 주소로 변경할 수 있습니다.
  ```csharp
  [HttpGet]
  [Route("get-my-special-user")] // URL을 직접 지정
  public async Task<object> GetUserProfile()
  {
      // ... 로직 ...
  }
  ```
- 이렇게 하면 `/user-management/get-my-special-user` 와 같이 고정된 주소를 사용할 수 있습니다.

---

## HandStack 라우팅의 장점

> HandStack은 Controllers 와 Pages 라우팅을 미리 설정해 줘서, 개발자가 직접 복잡한 라우팅 규칙을 일일이 설정할 필요 없이 SEO 친화적이고 읽기 쉬운 URL을 생성할 수 있습니다.

- 규칙 기반 자동화로 개발 생산성 향상
- 일관성 있는 URL 구조 유지
- 별도 설정 없이 바로 개발에 집중 가능

---

## 요약 정리 및 Q&A

- 라우팅은 URL과 실제 처리 로직(Controller) 또는 페이지(Razor Page)를 연결하는 규칙입니다.
- HandStack Controller: `클래스명` + `메서드명` -> `/클래스명/메서드명` (kebab-case)
- HandStack Razor Page: `폴더/파일명` -> `/폴더/파일명` (kebab-case)
- 이 자동화된 방식 덕분에 개발자는 라우팅 설정의 부담 없이 핵심 기능 개발에만 집중할 수 있습니다.
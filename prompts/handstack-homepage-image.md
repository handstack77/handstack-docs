# HandStack 메인 소개 이미지

- 생성 방식: ImageGen 스킬의 내장 이미지 생성 도구
- 현재 이미지 경로: `static/img/handstack-ecosystem-flat-v2.png`
- 이전 플랫 이미지 보관: `static/img/handstack-ecosystem-flat.png`
- 원본 이미지 보관: `static/img/handstack-ecosystem.png`
- 용도: 메인 페이지의 브라우저 → HandStack 서버 → 실행 모듈 소개
- 연동 기술은 예시이며, 기본 설치 여부나 기술 제공자의 보증을 뜻하지 않습니다.
- 확인 근거: `handstack/2.Modules/wwwroot/libman.json`, 각 모듈의 `.csproj`, `docs/reference/api/modules/` 문서.

## command 아이콘 배경색 편집 프롬프트

내장 ImageGen 도구로 `command` 왼쪽 터미널 아이콘의 배경을 다른 실행 모듈의 파란색과 맞춥니다. 흰색 기호와 나머지 구성은 유지합니다.

### 1차 색상 변경

```text
Use case: precise-object-edit
Input image 1 is the edit target: the existing HandStack architecture image, 1774 x 887.
Make exactly ONE tiny color correction. In the RIGHT section titled "EXECUTION MODULES", find the "command" row (second row). Change only the rounded-square BACKGROUND of the SMALL LEFT terminal icon (approximately x=1224..1299, y=278..357) from dark navy to the same saturated blue background/blue gradient as the small left icons in the dbclient, prompter, function and graphclient rows. Match the dbclient icon background above it as closely as possible, including hue, brightness, subtle shading and corner rounding.
Keep the white terminal ">_" glyph exactly unchanged, with its current size, position and stroke. Do NOT change the separate 3D terminal illustration on the RIGHT end of the command row.
Preserve everything else exactly: all text, all other icons, every card, the central flat HandStack panel, left browser and badges, connecting arrows, background, spacing, canvas size and aspect ratio. No new elements, no typography changes, no additional restyling. Only recolor the background of that one small command icon to match the other four blue module icons.
```

### 최종 색조·명암 보정

```text
Use case: precise-object-edit
Input image 1 is the current edit target. Make only a precise palette correction inside the small rounded-square icon immediately LEFT of the word "command", second row of EXECUTION MODULES.
Its current background is too desaturated/cyan and too uniform. Match the dbclient icon directly above: use the SAME vivid cobalt/royal blue background and vertical tonal gradient, approximately #0068D9 at the top, transitioning to #0254B1 at the bottom. Keep red near zero and blue highly saturated. The result should blend perfectly with the dbclient, prompter, function, graphclient left icon tiles rather than look like a different shade. Copy their exact blue family and bottom darkening.
Preserve the white terminal >_ symbol and every other pixel/element, including the command right-hand 3D terminal illustration. Preserve all text, size, position, corner radius, spacing, central flat server, left browser and arrows. Do not add glow, change the glyph, adjust other icons, change typography, crop or resize. Keep 1774x887. Only change the background color/gradient within that one left command icon.
```

## 플랫 스타일 편집 프롬프트

내장 ImageGen 도구로 원본의 가운데 서버만 편집합니다. 좌우 구성, 텍스트, 설명은 유지합니다.

```text
Use case: precise-object-edit
Input image 1: edit target, the existing HandStack ecosystem homepage illustration.
Primary request: Change ONLY the CENTER HandStack server and its module panels into a simple, clean, flat 2D design. Preserve all other parts of the image.
Edit region: only the central physical server tower and its platform (roughly x=635..1115, y=75..800 in the 1774x887 reference). Remove its 3D perspective, top and side faces, vents, pedestal, bevels, gloss, lighting effects, gradients and cast shadows.
Replacement: a restrained front-facing flat architecture panel within the same central area, with generous padding. A solid navy header contains the existing white three-layer stack symbol, the exact title "HandStack", and the exact subtitle "OPEN SOURCE SERVER". Below it, a near-white flat body has three simple aligned horizontal module rows labeled exactly "ack", "wwwroot", "transact", with small single-color outline folder/globe/gear icons. The flat footer is labeled exactly "ASP.NET Core". Use solid navy, pale blue and white fills, thin clean blue borders, modest corner rounding, consistent spacing. Make the center feel like a clear software architecture card, not a physical computer or rack. No shadows or dimensional effects anywhere on the new central panel.
Preserve exactly: the entire left WEB BROWSER section, its browser illustration, chart and six technology badges; the entire right EXECUTION MODULES section, all five cards and icons, and every existing word; the light background; the left-to-right composition and canvas aspect ratio. Preserve the blue arrows including HTTP and the five module branches, reconnecting their center endpoints neatly to the replacement panel if necessary. Do not restyle or regenerate the left or right sections.
Text invariants: HandStack; OPEN SOURCE SERVER; ack; wwwroot; transact; ASP.NET Core. All center labels horizontal and easily readable, same spelling/case. No extra labels, no duplicates, no watermark. Keep the existing outer margins and approximately the same image dimensions.
```

## 원본 생성 프롬프트

```text
Use case: infographic-diagram
Asset type: premium architecture illustration for the HandStack developer documentation homepage, a single landscape bitmap, approximately 2400 by 1200, 2:1 aspect ratio.
Primary request: Show how HandStack connects a browser-based business application to its open-source server and modular execution ecosystem. Clear left-to-right composition in THREE sections, all connected. Beautiful restrained technical editorial illustration, subtle dimensional/isometric hardware and cards, crisp type, generous whitespace. Not a generic cloud diagram, not a screenshot of a web page.
Scene/backdrop: clean very pale blue-white background, deep navy (#082d52), blue (#0054a6), restrained cyan and teal details, soft short shadows. Fine connection lines, no dark background, no visual clutter.
LEFT (about 25%): heading "WEB BROWSER". A large polished browser window showing a simple business app: search input, data table, tiny bar chart, no illegible filler prose. Below the browser, readable neatly aligned technology badges "HTML", "CSS", "JavaScript", plus related open-source badges "Tabler", "jQuery", "ECharts". Small generic UI/chart/code symbols are welcome; do not fabricate official brand logos.
CENTER (about 30%): a dominant navy modular server sculpture with a clean white three-layer stack symbol and large exact title "HandStack". Immediately below: "OPEN SOURCE SERVER". Distinct connected plates labeled "ack", "wwwroot", "transact", and small foundation badge "ASP.NET Core". An arrow connects browser to server; a branching line connects transact to the right-hand execution modules. Make it visually clear the right-hand modules belong to the same HandStack system, not unrelated external server products.
RIGHT (about 45%): heading "EXECUTION MODULES". Exactly five well-separated, aligned horizontal module cards, each with a generic icon, a large exact lowercase module name, and its relevant integration names in a second line. These are:
"dbclient" — "PostgreSQL · MySQL · SQLite" (database icon)
"command" — "CLI · HTTP · cURL" (terminal icon)
"prompter" — "Semantic Kernel · Ollama" (prompt/chat icon)
"function" — ".NET · Node.js · Python" (code/function icon)
"graphclient" — "Neo4j · Memgraph" (graph nodes icon)
Use these exact spellings, especially lowercase dbclient, command, prompter, function, graphclient. No repeated module cards, no additional module names. Integrations are examples, not endorsements. Do not use closed-source LLM brands.
Typography: clean modern sans serif, strong hierarchy, all English text exactly as specified above, highly readable. All headings and labels remain horizontal (not perspective-distorted), separate from the subtle dimensional objects. No Korean text, no tiny pseudo-text. No slogan, no watermark, no outer title banner, no decorative people, no unrelated objects. Content safely inset on all edges. Keep arrows calm and clean with no crossing lines. This should communicate a practical open-source business application platform, approachable and credible.
```

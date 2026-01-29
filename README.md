# HandStack 의 목표는 개발자가 좋아하고 기업이 신뢰하는 비즈니스 앱 '시스템'을 제공 하는 것입니다.

## 디지털 전환 시대에 HandStack을 사용 해야 하는 이유에 대해 알아보세요

```bash
`npm start`
개발 서버를 시작합니다.

`npm run build`
문서를 웹 사이트 프로덕션용 정적 파일로 번들링합니다.

`npm run serve`
번들링된 웹 사이트를 로컬로 서비스합니다.
```

HandStack 문서 웹 사이트는 최신 정적 웹사이트 생성기인 [다큐사우루스](https://docusaurus.io/)를 사용하여 제작되었습니다.

---

## Marp로 HTML 생성 후 포함하기

Marp를 사용하여 HTML 슬라이드를 생성하고, 이를 HandStack 문서에 포함할 수 있습니다. 다음은 그 방법입니다.

```txt
handstack-docs/
└── static/
    └── slides/
        └── XXXX.md
```

```bash
npm install -g @marp-team/marp-cli
```

```bash
cd $(handstack-docs)\static\slides\
node marp-slide.js
pm2 start marp-slide.js --name "marp-watcher"
```

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
  padding: 1rem;
  border-bottom: 1px solid #000;
  background-image: linear-gradient(to bottom right, #f7f7f7 0%, #d3d3d3 100%);
}

section > h2 {
  border-bottom: 4px solid #17344f;
}

section table {
    margin: auto;
    margin-top: 1rem;
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

# Jenkins를 활용한 CI/CD 파이프라인 구축하기

---

## CI/CD 와 Jenkins

- CI/CD (Continuous Integration/Continuous Deployment)
  - 빌드, 테스트, 배포 과정을 자동화하여 개발 생산성을 높이고 오류를 줄이는 핵심 방법론입니다.

- Jenkins란?
  - Java 기반의 가장 널리 사용되는 오픈소스 자동화 서버입니다.
  - 웹 인터페이스를 통해 파이프라인을 시각적으로 구성하고 관리할 수 있습니다.
  - 방대한 플러그인을 통해 거의 모든 종류의 자동화 및 통합을 지원합니다.

---

## Jenkins 파이프라인과 Jenkinsfile

Jenkins는 `Jenkinsfile`이라는 스크립트 파일을 사용하여 파이프라인을 정의합니다.

- Groovy 문법 기반의 스크립트
- 일반적으로 프로젝트의 루트 디렉토리에 위치
- GitHub Actions의 `.yml` 파일과 유사하게 파이프라인의 각 단계를 코드로 관리
- 소스 코드와 함께 파이프라인을 버전 관리할 수 있는 장점

---

## 간단한 Jenkinsfile 작성 예시

HandStack 프로젝트를 빌드하는 간단한 `Jenkinsfile` 입니다.

```groovy
pipeline {
    agent any // 파이프라인을 실행할 에이전트 지정

    stages {
        stage('Checkout') { // Git 저장소에서 코드 가져오기
            steps {
                git 'https://github.com/your-username/HandStack-project.git'
            }
        }

        stage('Build') { // HandStack 프로젝트 빌드
            steps {
                echo 'HandStack 프로젝트 빌드 시작...'
                sh 'npm install' // Node.js 프로젝트 의존성 설치
                sh 'handstack build' // HandStack 프로젝트 빌드 명령어
                echo 'HandStack 프로젝트 빌드 완료!'
            }
        }

        stage('Test') { // (선택 사항) 테스트 실행
            steps {
                echo '테스트는 이 단계에서 실행될 수 있습니다.'
                // sh 'npm test' // 예시: 테스트 명령어
            }
        }
    }
}
```

---

## Jenkinsfile 구조 분석

- `pipeline`
  - Jenkins 파이프라인의 최상위 블록입니다.

- `agent any`
  - 파이프라인을 실행할 Jenkins 에이전트(실행 환경)를 지정합니다. `any`는 가용한 아무 에이전트나 사용함을 의미합니다.

- `stages`
  - 파이프라인을 구성하는 논리적인 단계들의 집합입니다. (예: 빌드, 테스트, 배포)

- `stage('이름')`
  - `Checkout`, `Build`, `Test` 와 같이 각 단계를 정의합니다.

- `steps`
  - 해당 단계에서 실행될 실제 명령어들의 목록입니다.

---

## 파이프라인 실행 및 결과 확인

1. Jenkins 설치 (Docker 활용)
   - 아래 명령어로 Jenkins를 간편하게 설치하고 실행할 수 있습니다.
     ```bash
     docker run -p 8080:8080 -p 50000:50000 --name jenkins_server jenkins/jenkins:lts
     ```
   - `http://localhost:8080` 으로 접속하여 초기 설정을 완료합니다.

2. Jenkins Item 생성 및 설정
   - Jenkins 대시보드에서 '새로운 Item' > 'Pipeline' 유형을 선택합니다.
   - 설정의 'Pipeline' 섹션에서 'Pipeline script from SCM'을 선택합니다.
   - HandStack 프로젝트의 Git 저장소 URL과 `Jenkinsfile` 경로를 지정합니다.

3. 결과 확인
   - Jenkins Item 페이지의 'Build History'에서 파이프라인 실행 상태를 확인합니다.
   - 각 빌드의 'Console Output'을 통해 상세 로그와 성공/실패 여부를 검토합니다.

---

## 핸즈온 활동 (실습)

1. GitHub/GitLab에 HandStack 프로젝트를 푸시합니다.
2. 프로젝트 루트에 앞서 작성한 간단한 `Jenkinsfile`을 생성하고 커밋/푸시합니다.
3. 로컬에 Jenkins를 설치하고, HandStack 프로젝트를 위한 새로운 파이프라인 Item을 생성합니다.
4. Git 저장소와 Jenkins를 연동한 후, 수동 또는 Git 푸시를 통해 파이프라인을 실행합니다.
5. Jenkins 웹 UI에서 파이프라인 실행 결과를 확인하고 빌드 성공/실패를 검토합니다.

---

## HandStack과 Jenkins의 시너지

> HandStack 프로젝트는 표준 Node.js/ASP.NET Core 빌드 프로세스를 따릅니다.

- 이는 Jenkins와 같은 강력한 CI/CD 도구와 쉽게 연동할 수 있음을 의미합니다.
- `handstack build` 와 같은 명확한 CLI 명령어를 통해 자동화된 빌드 및 배포 파이프라인을 간단하게 구축할 수 있습니다.
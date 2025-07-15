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

# HandStack 파일 처리 심화

### repository 모듈을 이용한 파일 업로드, 다운로드

---

## 학습 목표

- HandStack의 `repository` 모듈과 `$fileclient`, `$htmleditor` 컨트롤을 사용하여 다양한 파일 처리 방법을 학습합니다.
- 파일 업로드, 다운로드, 삭제, 정보 조회 및 수정 기능을 익힙니다.
- 대용량 서비스의 기반이 되는 클라우드 스토리지 연동 개념을 이해합니다.

---

## 다양한 파일 업로드 시나리오

웹 애플리케이션에서는 다양한 형태의 파일 업로드가 필요합니다.

- 프로필 이미지 업로드 (단일 이미지)
- 게시판 첨부 파일 (단일 또는 다중 파일)
- 문서 또는 이미지 에디터 내 이미지 링크 (에디터 연동)

HandStack은 이러한 모든 시나리오를 효율적으로 지원합니다.

---

## 로컬 파일 저장의 한계

"서버에 파일을 그냥 저장하면 안 될까요?" 물론 가능하지만, 서비스가 성장하면 문제가 발생합니다.

- <mark>서버 용량 제한 및 고가용성</mark>: 서버의 디스크 공간은 한정적이며, 서버 장애 시 파일 유실 위험이 있고, 안정적인 서비스가 어렵습니다.

- <mark>서버 확장 시 문제</mark>: 여러 서버로 확장(Scale-out)할 때 파일 동기화가 복잡해집니다.

- <mark>파일 관리 시나리오</mark>: 업무에 맞게 파일을 관리하는 업로드, 다운로드, 삭제, 변경등 관리 시나리오를 고려해야 합니다.

---

## 대규모 서비스를 위한 현대적인 파일 저장 솔루션

- 클라우드 스토리지 AWS S3, Azure Blob Storage, Google Cloud Storage 등이 대표적입니다.
- HandStack은 이러한 클라우드 스토리지와 유연하게 연동될 수 있도록 설계되었습니다.

---

## 클라우드 스토리지의 장점

- <mark>사실상 무제한의 저장 공간</mark>
  - 용량 걱정 없이 파일을 저장할 수 있습니다.

- <mark>높은 내구성과 가용성</mark>
  - 데이터가 여러 곳에 자동 복제되어 유실 위험이 거의 없습니다.

- <mark>CDN 연동 용이성</mark>
  - 전 세계 사용자에게 파일을 빠르고 안정적으로 전송할 수 있습니다.

- <mark>비용 효율성</mark>
  - 사용한 만큼만 비용을 지불하여 초기 투자 비용이 적습니다.

---

## Azure Blob Storage 개념 살짝 맛보기

HandStack이 연동할 수 있는 대표적인 클라우드 스토리지입니다.

- <mark>스토리지 계정 (Storage Account)</mark>
  - 모든 Azure Storage 데이터 개체에 대한 고유한 네임스페이스입니다.

- <mark>컨테이너 (Container)</mark>
  - 파일 시스템의 '폴더'와 유사한 개념으로, Blob(파일)들을 그룹화합니다.

- <mark>Blob (객체)</mark>
  - 이미지, 문서 등 실제 '파일'을 의미합니다.

- <mark>권한 설정</mark>
  - 컨테이너나 개별 Blob에 대해 접근 권한을 세밀하게 제어할 수 있습니다.

---

## HandStack과 클라우드 스토리지 연동

HandStack은 복잡한 과정을 단순화합니다.

- 개발자는 파일 저장 위치가 로컬 디스크인지, 클라우드 스토리지인지 신경 쓸 필요가 없습니다.
- `repository` 모듈이 이 모든 것을 추상화하여 처리합니다.
- `storage.json` 설정 변경만으로 로컬 저장소와 클라우드 저장소 간 선택이 가능합니다.
- 클라우드 스토리지 서비스(Azure Blob, AWS S3, Google Cloud Storage)에 파일 업로드를 연동하기 위해 필요한 각 항목 별로 설정을 해야합니다.

---

## Azure Blob Storage 연동 정보

| 항목 | 설명 | 얻는 위치/방법 |
|---|---|---|
| BlobContainerID | Blob 컨테이너 이름 | Azure Portal > Storage Account > Blob containers > 원하는 컨테이너 이름 |
| BlobConnectionString | Storage Account 연결 문자열 | Azure Portal > Storage Account > Access keys > Connection string 복사 |
| BlobItemUrl | 업로드한 Blob 파일의 접근 URL | 업로드 후: `https://<storage-account-name>.blob.core.windows.net/<container-name>/<blob-name>` |

---

## AWS S3 연동 정보

| 항목 | 설명 | 얻는 위치/방법 |
|---|---|---|
| AwsBucketName | S3 버킷 이름 | AWS Management Console > S3 > Buckets 리스트에서 해당 버킷 이름 |
| AwsRegion | S3 버킷이 위치한 리전 | AWS Management Console > S3 > 버킷 상세 > 버킷 리전 |
| AwsAccessKey | AWS 접근 키(Access Key ID) | AWS Management Console > IAM > Users > (사용자 선택) > Security credentials > Create access key |
| AwsSecretKey | AWS 비밀 접근 키(Secret Access Key) | 위와 동일. Access key 생성 시 함께 제공됨 (반드시 복사 후 안전하게 보관!) |
| AwsServiceUrl | S3 서비스 엔드포인트 URL (일반적으로 기본값 사용) | 일반적으로 생략 가능. 필요 시: `https://s3.<region>.amazonaws.com` (예: `https://s3.ap-northeast-2.amazonaws.com`) |

---

## Google Cloud Storage (GCS) 연동 정보

| 항목 | 설명 | 얻는 위치/방법 |
|---|---|---|
| GcsBucketName | GCS 버킷 이름 | Google Cloud Console > Storage > Browser > 버킷 이름 |
| GcsCredentialFile | 서비스 계정 키(JSON) 파일 경로 | Google Cloud Console > IAM & Admin > Service accounts > (서비스 계정 선택) > Keys > Add key > Create new key로 생성 |
| BlobItemUrl (GCS) | 업로드한 객체의 공개 URL | 업로드 후: `https://storage.googleapis.com/<bucket-name>/<object-name>` |

---

## storage.json 내 저장소 설정

StorageType(FileSystem, AzureBlob, AwsS3, GoogleCloudStorage) 항목에 따라 파일 저장소가 설정됩니다.

```json
{
    "ApplicationID": "HDS",
    "RepositoryID": "TSTLE01",
    "RepositoryName": "에디터내 이미지 파일",
    "StorageType": "FileSystem",
    "PhysicalPath": "../storage/HDS/TSTLE01",
    "BlobContainerID": "",
    "BlobConnectionString": "",
    "BlobItemUrl": "",
    "GcsBucketName": "",
    "GcsCredentialFile": "",
    "AwsBucketName": "",
    "AwsRegion": "",
    "AwsAccessKey": "",
    "AwsSecretKey": "",
    "AwsServiceUrl": "",
    ...
}
```

---

## 파일 정보 테이블 스키마

<style scoped>
  table { font-size: 16px; }
</style>

| 컬럼 ID | 컬럼명 | 데이터 타입 | 길이 | Null유무 |
|---|---|---|---|---|
| ItemID | 항목ID | String | 36 | NO |
| RepositoryID | 저장소ID | String | 36 | NO |
| DependencyID | 의존성ID | String | 36 | YES |
| FileName | 파일명 | String | 256 | NO |
| PhysicalPath | 물리경로 | String | 1000 | YES |
| AbsolutePath | 절대경로 | String | 1000 | YES |
| RelativePath | 상대경로 | String | 1000 | YES |
| Extension | 확장자 | String | 50 | YES |
| Size | 파일크기 | Number | -1 | YES |
| MD5 | MD5 | String | 50 | YES |
| CustomPath1 | 사용자경로1 | String | 50 | YES |
| CustomPath2 | 사용자경로2 | String | 50 | YES |
| CustomPath3 | 사용자경로3 | String | 50 | YES |
| PolicyPath | 정책경로여부 | String | 1 | YES |
| SortingNo | 정렬번호 | Number | -1 | YES |
| Comment | 비고 | String | 200 | YES |
| CreatedMemberNo | 생성자회원번호 | String | 36 | YES |
| CreatedAt | 생성일시 | DateTime | -1 | YES |

---

## 파일 정보 관리 쿼리 및 거래 ID

> $(HANDSTACK_SRC)/2.Modules/repository/Contracts/dbclient/HDS/STR

<style scoped>
  li { font-size: 20px; }
</style>

- MYS010.xml: MySQL / MariaDB
- ORA010.xml: Oracle
- PGS010.xml: PostgreSQL
- SLT010.xml: SQLite
- SQS010.xml: SQL Server

```json
{
  "TransactionGetItem": "HDS|STR|SLT010|GD01",
  "TransactionGetItems": "HDS|STR|SLT010|LD01",
  "TransactionDeleteItem": "HDS|STR|SLT010|DD01",
  "TransactionUpsertItem": "HDS|STR|SLT010|MD01",
  "TransactionUpdateDependencyID": "HDS|STR|SLT010|UD01",
  "TransactionUpdateFileName": "HDS|STR|SLT010|UD02",
}
```

---

## `$fileclient` 컨트롤 살펴보기

HandStack은 파일 처리를 위한 강력한 UI 컨트롤 `$fileclient`를 제공합니다.

- `$fileclient`는 파일 업로드, 다운로드, 삭제 등의 기능을 UI 상에서 쉽게 구현할 수 있도록 돕습니다.
- 내부적으로 `repository` 모듈과 통신하여 실제 파일 작업을 수행합니다.
- 모든 과정은 `repository` 모듈을 통해 서버와 통신하며 이루어집니다.

http://localhost:8421/sample/uicontrol/files.html

---

## 다음의 경우 파일 관리 기능을 직접 개발이 필요합니다

- 이미지 업로드 후 파일 크기 조정, 압축, 변환 필요.
- 파일 업로드 후 업무에 필요한 파일 이동이 필요.
- 내부 시스템의 파일 관리와 통합이 필요한 경우

---

## 요약 정리 및 Q&A

> 화면 개발에 필요한 파일 제어를 <mark>repository 모듈</mark>을 이용하여 간단하게 처리하세요.

- 로컬 파일 저장은 간단하지만 확장성에 한계가 있습니다.
- 클라우드 스토리지는 대규모 서비스를 위한 표준 파일 저장 방식입니다.
- HandStack은 `$fileclient`와 `repository` 모듈을 통해 파일 처리를 추상화하여, 개발자가 비즈니스 로직에만 집중할 수 있도록 돕습니다.

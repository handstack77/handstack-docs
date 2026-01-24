# system-architecture-example

견고하고 확장 가능한 시스템 아키텍처를 담고 있습니다. 이 구조를 기반으로 한 시스템 설계 설명서를 정리 합니다.

---

## 시스템 아키텍처 설계 설명서

이 아키텍처는 고가용성, 확장성 및 낮은 지연 시간을 목표로 하는 **마이크로서비스 기반 분산 시스템**입니다. 크게 사용자 요청 처리, 메타데이터 관리, 미디어 처리, 그리고 데이터 분석 계층으로 나뉩니다.

---

### 1. 진입점 및 트래픽 제어 (Entry Layer)

* **Client & CDN:** 사용자는 클라이언트를 통해 접속하며, 정적 콘텐츠(이미지, 썸네일 등)는 **CDN**을 통해 캐싱되어 지연 시간을 최소화합니다.
* **Load Balancer (LB):** 들어오는 트래픽을 여러 API 게이트웨이로 분산하여 시스템 부하를 관리합니다.
* **API Gateways:** 서비스의 "대문" 역할을 하며 인증, 권한 부여, 속도 제한(Rate Limiting), 로깅 및 요청 변환을 수행합니다.

### 2. 핵심 서비스 계층 (Core Services)

이 시스템은 제어 흐름과 데이터 흐름을 명확히 분리합니다.

* **Metadata Server:** 사용자 정보, 파일 정보, 권한 등 제어 관련 로직을 담당합니다.
* **Block Server:** 실제 대용량 데이터(이미지, 비디오 등)의 업로드 및 스트리밍을 관리합니다.

### 3. 메타데이터 및 스토리지 관리 (Storage Layer)

데이터의 일관성과 빠른 조회를 위한 다층 구조를 가집니다.

* **Metadata Cache (Redis/Memcached):** 빈번하게 액세스되는 메타데이터를 메모리에 저장하여 DB 부하를 줄입니다.
* **Partitioning & Sharding:** 데이터가 방대해질 것에 대비해 **Shard Manager**와 **Directory-based partitioning**을 통해 데이터를 여러 DB 노드에 분산 저장합니다.
* **Metadata DB Cluster:** 실제 관계형 또는 비정형 데이터를 저장하는 클러스터입니다.

### 4. 미디어 및 검색 시스템 (Media & Search)

* **Video Processing Pipeline:** 비디오 업로드 시 **Video Queue**를 거쳐 **Worker**들이 인코딩, 압축, 해상도별 변환 작업을 수행한 후 최종 저장소(**VidStore**)에 저장합니다.
* **Search System (ElasticSearch):** **Search Results Aggregator**를 통해 대량의 메타데이터 속에서 사용자가 원하는 콘텐츠를 빠르게 검색할 수 있도록 인덱싱을 제공합니다.

### 5. 메시징 및 비동기 처리 (Async Systems)

* **Notification System:** 서비스 내 이벤트를 실시간으로 사용자에게 알립니다.
* **Feed System:** 사용자의 활동이나 구독 정보를 기반으로 피드를 생성하여 제공합니다.
* **Queues (NotifQ, FeedQ):** 서비스 간 결합도를 낮추고 비동기 처리를 통해 시스템 안정성을 높입니다.

### 6. 인프라 유틸리티 및 데이터 분석 (Infra & Analytics)

* **Zookeeper:** 분산 환경에서 노드 간의 상태 동기화 및 코디네이션을 담당합니다.
* **Distributed Logging/Tracing:** 시스템 전반의 오류를 추적하고 모니터링합니다.
* **Data Warehouse (Hadoop/Spark):** DB의 원천 데이터를 추출하여 대규모 분석을 수행하고, 그 결과를 **Report DB**에 저장하여 관리자 대시보드(**Analytics View**)에 시각화합니다.

---

## 시스템 주요 특징 요약

| 특징 | 적용 기술 | 비고 |
| --- | --- | --- |
| **확장성** | Sharding, Load Balancer, Workers | 트래픽 증가 시 유연한 확장 가능 |
| **가용성** | DB Cluster, Replica, CDN | 일부 장애 시에도 서비스 연속성 유지 |
| **성능** | Redis Cache, ElasticSearch | 빠른 데이터 검색 및 조회 속도 보장 |
| **비동기성** | Message Queues (VidQ, NotifQ) | 무거운 작업(비디오 처리 등)이 메인 흐름을 방해하지 않음 |

---

```.plantuml
@startuml

' --- Top Layer ---
actor "Client" as client
node "Load Balancer" as LB
node "CDN" as CDN

' --- Gateway Layer ---
package "API Gateways" {
    rectangle "API Gateway 1" as APIG1
    rectangle "API Gateway 2" as APIG2
}
note right of APIG2
  Authentication
  Authorization
  Caching
  Transformation
  Rate Limiting
  Reverse Proxy
  Monitoring
  Logging
  Serverless Functions
end note

' --- Core Services ---
rectangle "Metadata Server" as MetaServer
rectangle "Block Server" as BlockServer

' --- Notification System ---
queue "Notification\nQueue" as NotifQ
rectangle "Notification\nService" as NotifSvc

' --- Search System ---
package "Search System" {
    rectangle "Search Results\nAggregators" as SearchAgg
    package "Search Index (ElasticSearch)" {
        rectangle "Search Index" as ES_Index
        rectangle "Cache" as ES_Cache
        rectangle "Storage" as ES_Storage
    }
}

' --- Feed System ---
queue "Feed Generation\nQueue" as FeedQ
rectangle "Feed Generation\nService" as FeedSvc

' --- Metadata Storage Layer ---
package "Metadata Storage" {
    database "Cache\n(Redis/Memcached)" as MetaCache
    rectangle "Directory based\npartitioning" as DirPart
    rectangle "Shard Manager" as ShardMgr
    
    package "Metadata DB Cluster" {
        database "Metadata DB 1" as MDB1
        database "Metadata DB 2" as MDB2
        database "Metadata DB 3" as MDB3
    }
}

' --- Infrastructure Utils ---
rectangle "Coordination\nService\n(Zookeeper)" as ZK
rectangle "Distributed\nLogging" as DistLog
rectangle "Distributed\nTracing" as DistTrace

' --- Media & Storage System ---
package "Distributed File Storage" {
    database "Image/Thumbnail\nStorage" as ImgStore
    database "Video\nStorage" as VidStore
}

queue "Video Processing\nQueue" as VidQ
rectangle "Video Processing\nService" as VidSvc
package "Workers" {
    rectangle "Worker 1" as W1
    rectangle "Worker 2" as W2
    rectangle "Worker 3" as W3
}

' --- Data Analytics ---
package "Data Warehouse" {
    rectangle "Data Processing Systems\n(Hadoop/MapReduce, Spark)" as DataProc
    rectangle "Distributed Scheduler" as DistSched
    rectangle "Workers" as DataWorkers
}
database "Database" as ReportDB
rectangle "Reports Viewing\n& Data analysis" as AnalyticsView


' ================= CONNECTIONS =================

' Client & Entry
client --> LB
client --> CDN
client <-- NotifSvc
CDN --> ImgStore : Static Content

' LB to Gateway
LB --> APIG1
LB --> APIG2

' Gateway to Services
APIG1 --> MetaServer : Control
APIG2 --> BlockServer : Data

' Metadata Server Connections
MetaServer --> NotifQ
MetaServer --> SearchAgg : Search query
MetaServer --> FeedQ
MetaServer --> MetaCache : Read/write metadata
MetaServer <--> MDB2 : Read/write

' Notification Flow
NotifQ --> NotifSvc

' Search Flow
SearchAgg <--> ES_Index
ES_Index -[hidden]- ES_Cache
ES_Cache -[hidden]- ES_Storage

' Feed Flow
FeedQ --> FeedSvc
FeedSvc --> MDB1

' Metadata Logic
MetaCache --> DirPart
DirPart --> ShardMgr
ShardMgr --> MDB1

' DB Replication
MDB2 <--> MetaCache : Replication and\nPartitioning
MDB1 -[hidden]- MDB2
MDB2 -[hidden]- MDB3

' Block Server & Media
BlockServer --> ImgStore
BlockServer --> VidQ : Video processing task
VidQ --> VidSvc
VidSvc --> W1
VidSvc --> W2
VidSvc --> W3
W3 --> VidStore

' Analytics Flow
MDB2 --> DataProc : Data
DataProc --> ReportDB : Output\n(Metrics, Reports, etc)
ReportDB --> AnalyticsView

' Layout helps
ZK -[hidden]- DistLog
DistLog -[hidden]- DistTrace

@enduml
```
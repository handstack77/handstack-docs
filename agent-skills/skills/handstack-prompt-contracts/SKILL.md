---
name: handstack-prompt-contracts
description: HandStack prompter 계약(.pmt, 문서 예제는 .xml)과 LLM 연동(CommandType P)을 개발·수정한다. 프롬프트 statement(role·temperature·maxtokens), ${Param} 치환, message 요소 역할 구성, media 요소 이미지·오디오 입력, outputmeta/PromptResult 해석, LLMSource(OpenAI·Claude·Gemini·Ollama·LM Studio) 모델 설정, Jev·Ollama decision 판단 계약(Choice/Score/Noul), 모델 allowlist, 프롬프트를 호출하는 화면·거래 연결 요청이면 반드시 사용한다.
---

# HandStack 프롬프트(prompter) 계약

`prompter`는 XML 프롬프트 계약을 읽어 LLM 제공자를 호출하고 결과를 거래 응답 형식으로 돌려준다. `transact`에서는 `CommandType: "P"`로 라우팅한다. 일반 프롬프트 실행과 `<decision>` 판단 계약은 입력·출력·검증 규칙이 다르므로 **먼저 어느 쪽인지 정한다.**

## 먼저 확인

1. 대응하는 `.txn` 서비스(`CommandType P`), 호출 화면/함수, 계약의 `<datasource>`(= 서버 `LLMSource`의 `DataSourceID`)를 읽는다. `LLMSource`의 제공자·모델·엔드포인트는 서버 설정이며 값(특히 ApiKey)은 읽거나 복사하지 않는다.
2. 계약 위치 `Contracts/prompter/{App}/{Project}/{TransactionID}.pmt`(IDE) 또는 `.xml`(문서). 프롬프트 ID = `ApplicationID|ProjectID|TransactionID|PromptID`(`id`+`seq` 두 자리, 예 `GP0100`).
3. IDE의 prompter 편집기는 `.pmt`만 열고 저장한다. 같은 형식의 `.xml`을 이 편집기로 열 수 있다고 가정하지 않는다.

## 일반 프롬프트 계약

```xml
<mapper xmlns="contract.xsd">
    <header>
        <application>HDS</application><project>LLM</project><transaction>CLS010</transaction>
        <datasource>LLM1</datasource><use>Y</use><desc>문장 의도 분류</desc>
    </header>
    <prompts>
        <statement id="GP01" seq="0" use="Y" timeout="30" role="system" desc="의도 분류"
                   maxtokens="1000" temperature="0.2" topp="1.0" presence="0.0" frequency="0.0">
            <![CDATA[
# INSTRUCTIONS
- 한국어로 한 단어로만 답하세요.
USER: ${UserMessage}
            ]]>
            <param id="@UserMessage" type="String" length="-1" value="" />
            <outputmeta value="PromptResult:string" />
        </statement>
    </prompts>
</mapper>
```

- 본문의 `${이름}`은 요청 파라미터로 치환된다. `authorization`/`headers`/`body` 속성처럼 값 **전체**를 받을 때는 `@이름`을 쓴다. 사용자 입력은 지시문과 분리해 파라미터로만 넣는다.
- `role` 기본값은 `user`. 시스템 지시문으로 보낼 계약만 `role="system"`. `<message role="…">`를 여러 개 두면 역할별 메시지로 구성하고, role을 생략하면 statement의 role을 상속한다. Ollama의 일부 모델은 비어 있지 않은 `user` 메시지를 요구한다.
- 이미지·오디오: `<media id="@Image1" type="Image" mimeType="image/png" required="N" />`. 값은 접두사 없는 순수 Base64. `<param>`과 id가 겹치면 안 되고 제공자/모델이 해당 modality를 지원해야 한다.
- 출력은 보통 `PromptResult` 문자열 한 컬럼이다. `outputmeta`가 응답 JSON의 내부 경로를 개별 컬럼으로 풀어 주지는 않는다. 구조화 결과가 필요하면 프롬프트가 JSON을 출력하게 하고 호출 쪽(화면/함수)이 파싱·스키마 검증한다.
- 모델 이름·API 키·엔드포인트는 계약이 아닌 서버 설정(`LLMSource`)에서 정한다. 문서 예제의 모델 ID를 코드/계약 기본값으로 박지 않는다. 사용 가능한 모델은 제공자 공식 목록과 서버 설정으로 확인한다.
- 기본값: `maxtokens` 4000, `temperature` 1.0, `topp` 1.0, `presence`/`frequency` 0.0, `timeout` 0(서버 기본). `transactionlog="Y"`(또는 `log`)로 이 프롬프트의 요청·응답을 거래 로그에 남긴다.
- 도구 호출: `<tools mode="auto|required|none" maxrounds="10">` 안에 `<kernel name functions/>`, `<mcp name functions/>`, `<cli name command args timeout/>`, `<builtin name/>`을 선언한다. 선언은 서버 `module.json`의 allowlist(`AllowedKernelPlugins`, `AllowedMcpServers`, `AllowedCliTools`)와 **모두** 일치할 때만 허용된다. 계약만 고쳐서 권한을 넓히려 하지 않는다.
- 외부 HTTP형 제공자 호출을 직접 구성하는 계약은 `<headers><header name value/></headers>`, `<authorization type value username password name location/>`, `<body type><field|part|file …/></body>`를 쓰며 값 전체를 `@파라미터`로 받는다. 키·토큰은 계약에 고정하지 않는다. body 파일 경로는 `AllowedBodyFileBasePaths` 안에 있어야 한다.

## 판단 계약 `<decision>`

```xml
<statement id="GP02" seq="0" use="Y" datasource="DECISION_SOURCE" timeout="60">
  <decision state="@UserMessage"><![CDATA[
  {"refund":{"type":"noul","instructions":"Does the customer request a refund?"}}
  ]]></decision>
  <param id="@UserMessage" type="String" length="-1" required="Y" value="" />
  <outputmeta value="PromptResult:string" />
</statement>
```

- `state`는 선언된 입력 파라미터를 가리킨다. 입력은 독립 JSON 문자열로 직렬화되고, 질문 기준(CDATA JSON)에는 **문자열 치환을 하지 않는다**. 사용자 입력을 기준 JSON에 끼워 넣지 않는다.
- 질문 JSON(CDATA): 최상위 키가 질문 이름(`^[A-Za-z0-9_.-]{1,100}$`, 한 판단에 **1~64개**, 중복 이름 오류)이고 값은 `{ "type": "choice|score|noul", "instructions": "비어 있지 않은 문자열", "criteria": … }`다. `criteria` — choice: `{선택지이름: 설명}` 객체 2~26개, score: 단계 설명 문자열 배열 2~10개, noul: 생략하거나 `{ "true": 설명, "false": 설명 }` 정확히 둘. `<decision>`은 statement당 하나만 둔다.
- 질문 유형: Choice(선택지 2~26개), Score(순서 있는 기준 2~10개), Noul(참일 확률; 별도 confidence 필드 없음).
- 텍스트 전용이다. `message`/`media`/`tools`/`body`/`headers`/`authorization`과 함께 선언할 수 없고 `Think`/`Stream`은 `false`. `timeout`은 1~300초(0·생략은 30초).
- 제공자: TypeSafe Jev(엔드포인트·키는 서버 설정/환경변수), 로컬 Ollama(`/v1/systemone`, 루프백 주소만 허용, Authorization 헤더 없음). Ollama 모델은 `ModuleConfig.AllowedOllamaDecisionModels`에 **전체 문자열**(대소문자 구분, 와일드카드 없음, 태그 포함)로 등록돼야 하며 누락·빈 배열이면 호출이 차단된다. 코드에 고정 목록을 두지 않는다. 변경 반영은 `IsConfigurationWatching` 여부에 따라 즉시 또는 재시작 후이다.
- 응답 해석: 직접 prompter API는 `Acknowledge=1`과 빈 `ExceptionText`를 확인한 뒤 `ResultJson[0].Value.PromptResult`(JSON 문자열)를 파싱한다. transact 경로는 `acknowledge`, `result.dataSet[0].value.PromptResult`다. 두 envelope는 다르다.
- 확률 범위·합, 선택지 일치 등은 서버가 검증하고 429/500/타임아웃/잘못된 응답은 **거래 실패**다. 실패를 임의 점수나 일반 채팅 응답으로 대체하지 않는다. 사람이 검토해야 하는 상태는 호출 앱의 정책으로 남긴다.
- 규칙은 서버 모듈의 `DecisionContract`가 기준이다. 이 스킬의 요약이 오래됐을 수 있으니 판단 계약을 만들거나 바꿀 때 MCP `reference/api/modules/prompter`의 "Jev·Ollama 판단 계약" 절과 소스를 대조한다.

## 화면·거래 연결

- `.txn` 서비스 `CommandType: "P"`, `ReturnType: "Json"`. 서버 `RoutingCommandUri`에 `P` 라우팅이 등록돼 있어야 한다.
- 화면은 보통 `Row` 입력(`UserMessage` 등) + `Form`/`Grid` 출력(`PromptResult`)으로 호출한다. 응답 지연이 크므로 진행 표시, 중복 클릭 방지, 오류 알림을 화면에서 처리한다.
- 개인정보가 프롬프트로 가므로 어떤 필드가 외부 제공자로 전송되는지 확인하고, transact·프록시 거래 로그의 마스킹 정책(`IsDataMasking`)을 점검한다. prompter 로그는 decision state와 media를 가리지만 앞단 로그는 별도다.

## IDE 편집기를 고칠 때

IDE의 prompter 화면 파서·직렬화기가 모르는 statement 하위 요소는 **저장 때 사라진다.** 새 요소를 지원하면 parse와 serialize를 함께 고치고 "원문 읽기 → 무변경 저장 → 수정 저장"의 왕복 결과를 비교한다. 판단 계약 편집기의 검증 로직은 서버 `DecisionContract` 규칙을 거울처럼 따르므로 같이 갱신한다. 판단 전용 제공자(TypeSafe)는 일반 채팅 제공자 목록에 추가하지 않는다. → `handstack-ide-development`.

## 검증

정적: XML 파싱, `${}`/`@` 치환 이름 ↔ `<param>`, `outputmeta` ↔ 화면 출력, 판단 계약 제약. 실행: 승인된 환경에서 정상·잘못된 입력·제공자 오류(타임아웃/429)를 확인한다. 실제 모델 품질은 별도 평가 데이터로 측정해야 하며 모의 서버 결과는 "모의 검증"으로 표시한다.

## 문서

MCP `reference/api/modules/prompter`, `reference/api/modules/transact`(P 라우팅), `ide/reference/파일과-저장-규칙`, `information/resource/LLM-성능을-끌어올리는-프롬프트-엔지니어링`. 없으면 `https://handstack.kr/docs/<id>`.

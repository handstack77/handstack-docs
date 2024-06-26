---
slug: 알아두면-써먹을-게-많은-프롬프트-엔지니어링
title: 알아두면 써먹을 게 많은 프롬프트 엔지니어링
authors: [handstack77]
tags: [handstack]
---

작년부터 개발을 하면서 ChatGPT 도움을 많이 받다 보니 프롬프트 엔지니어링에 대한 관심이 생겨 최근에 마이크로소프트의 Semantic Kernel을 사용해서 HandStack 프로그램에서 생산성에 도움이 될 만한 다양한 문법을 테스트 해보고 있습니다.

몇 년 전에 머신러닝을 기초 레벨에서부터 학습을 해본 적이 있습니다. 회귀, 분류, 군집, 예측, 추천 기능을 활용해서 업무 프로그램에 적용해야 하는 미션을 부여받아 진행했는데, 그 당시 고생한 거에 비하면 의미 있는 성과를 내지는 못했습니다.

머신러닝은 기본적으로 적용하려는 수학적 알고리즘에 의한 매개변수 값에 따라 의도한 결과가 달라지다 보니 만족할 만한 학습 모델을 만들기 까지 반복되는 살짝 지겨운 (?) 학습 과정을 많이 거쳐야 하는데, 이렇게 만들어진 학습 모델을 운영 서비스에 적용해서 클라이언트에서 확인하기 위한 자동화된 MLOps 프로세스와 그에 필요한 인력이 필요합니다. 지금에서 생각해보니 크게 2개의 이슈가 있었네요.

1. 업무 시나리오에 따라 필요한 학습 데이터의 수량이 부족하거나 불균형하게 되어 있으면 학습 모델의 성능이 떨어지게 되어 실제 운영 환경에서는 예측한 결과가 실제 결과와 다르게 나타나는 경우가 종종 발생합니다. 학습 모델은 학습 시점의 과거 데이터를 기반으로 하기 때문에 정기적으로 최신 데이터를 추가한 학습 데이터의 재학습이 필요하게 되는데 이 부분을 얼마나 자동화 할 수 있는지가 중요합니다.

2. 그렇게 고생하며 얻은 지식이 1년도 안 되어 Auto ML로 불리는 학습 데이터의 크기와 그에 적절한 학습 시간만 넣으면 알아서 최적의 수학 알고리즘과 매개변수의 재학습을 통해 결과로 만들어주는 솔루션이 나왔습니다. Auto ML의 학습 모델 성능이 좋다는 것을 보고 그 당시에 AI의 발전 속도가 개인이 기초 분야에서 학습하는 속도보다 빠르다는 것에 놀랐습니다.

그동안 딥러닝 기반의 AI로 음성인식, 영상 객체 인식, 자율주행, 상담원 챗봇 등 사람이 하는 업무 보조 역할을 대체하는 기술들로 발전하고 일반사람들이 쉽게 접근하지 못하는 스며드는 방식으로 도입이 되었었다고 한다면, 최근에는 다양한 좋은 품질의 학습 모델을 내려받거나 API로 호출할 수 있는 서비스를 제공하는 허깅페이스(https://huggingface.co) 를 보며 이전보다 초기 접근성이 좋아졌다는 것을 새삼 느꼈습니다.

그 중에서 LLM(Large Language Model)은 기존의 AI와는 다르게 상상할 수 없는 대규모의 데이터를 학습하여 텍스트 생성, 번역, 요약 등 다양한 언어 처리 작업을 수행하는 데 사용됩니다. 큰 변화의 핵심은 수요자가 필요한 업무에 따라 활용 용도에 따라 학습 곡선의 선택지가 생겼다는 것인데, 접근성이 좋아진 만큼 더 많은 사람이 쉽게 AI 기술을 활용하고 있습니다.

예를 들어 최근 Meta에서 ChatGPT 4 와 유사한 성능을 보여줄 것으로 보이는 Llama3 학습 모델을 오픈소스로 공개했습니다. 당연히 영어로 학습된 모델을 발 빠르게 야놀자에서 한국어로 파인 튜닝해서 공개를 해주었고, 이제 AVX2 명령어를 지원하는 최신 CPU를 탑재하고 NVIDIA의 RTX 3060+ 또는 AMD 의 RX 7800+ 그래픽 카드를 가지고 있는 개인 PC에서도 파이썬이나 랭체인 같은 기술을 모르더라도 LM Studio (https://lmstudio.ai) 와 같은 도구를 활용하거나 랭서브(https://www.langchain.com/langserve) 를 이용해서 셀프 호스트로 ChatGPT 서비스를 실행할 수 있습니다.

Open AI에서 제공하는 ChatGPT API를 사용하려면 유료 API 키를 발급받아야 하는데, 셀프 호스트로 동일한 품질의 서비스를 운영하고 ChatGPT 질문과 결과값을 벡터 값으로 임베딩하여 저장하고 검색할 수 있는 벡터 DB들을 사용 가능하면 기업에서는 물론 개인이나 학생들도 쉽게 AI 기술을 활용할 수 있을 것입니다.

그런 의미에서 학생, 직장인에 상관없이 누구나 프롬프트에 필요한 문법을 정리하고 이를 활용해서 ChatGPT를 사용하는 방법을 알아두면 앞으로 써먹을 게 많을 거로 보여집니다.

문법을 학습하기 위한 참고 웹 사이트로 랭스미스 (https://smith.langchain.com/hub) 를 추천드립니다. 예를 들어 데이터베이스 쿼리를 생성하기 위한 프롬프트에 대한 예로 https://smith.langchain.com/hub/rlm/text-to-sql/playground 를 참고하시면 괜찮을 것 같네요. 굳이 Open AI의 유로 API 키가 없더라도 여기에 있는 문법을 ChatGPT에 그대로 적용해도 됩니다.

> 영어로 되어 있지만 DeepL로 번역해서 얻은 프롬프트를 ChatGPT에 붙여서 사용해 보면 확실히 기존보다 좀 더 나은 답변을 얻으실 수 있으실 겁니다.

랭스미스와 유사한 방식으로 기업 또는 개인이 프롬프트에 대한 문법을 정리하고 이를 테스트 하기 위한 셀프 호스트 가능한 오픈소스로 랭퓨즈 (https://github.com/langfuse/langfuse) 를 추천드립니다.

---

한 주간의 여정 (2024-04-22 ~ 2024-04-26)

- arm64 빌드 ack 프로그램 삭제
- Http 응답 상태 코드 표준화 정리
- 환경변수 비밀키 로드 및 조회 기능 개선
- 환경변수, 포함 리소스 조회 기능 개선
- 배포 스크립트 개선
- HandStack 개발 환경 설치가 완료 후 실행 방법 개선
- checkup.sln 솔루션 파일 삭제
- C# 함수 반환 결과가 Task 일 경우 대응 수정
- WordWrap 확장 메서드 추가
- Semantic Kernel 기본 패키지 추가
- CLI list 에 명령 인수가 출력되도록 개선
# Leagto Backend Project : Venus

> A backend server for sensibility-oriented chatbot based on Express and DialogFlow for Korean

**고민이나 스트레스로 괴로운 사람들이 속 시원히 털어놓을 수 있는 챗봇 서비스**의
백엔드 프로젝트입니다. 코드네임은 *Venus*로, 어두운 밤하늘 속에 갇혀 있는
사람들에게 샛별처럼 가장 일찍 다가와 반짝이며 위안을 주겠다는 상징적인 의미를
담고 있습니다.

Venus는 NodeJS 기반의 [Express 프레임워크](https://expressjs.com/ko/)를
사용하여 개발한 웹 서버로, 아래 서비스들과 연동되어 있습니다.

* [DialogFlow](https://dialogflow.com)
  - Google에서 제공하는 대화형 인터페이스 설계를 위한
  자연어 이해(Natural Language Understanding) 플랫폼입니다.
  [공식 문서](https://cloud.google.com/dialogflow/docs/)를 참고하였습니다.
* [Facebook Messenger](https://developers.facebook.com/docs/messenger-platform/)
  - 대표적인 인스턴트 메신저인 페이스북 메신저에서 제공하는 API를 활용하여
  페이스북 페이지로 접속할 수 있는 챗봇을 구현 중에 있습니다.
* [Legato NLP Project Thoth](https://git.swmgit.org/root/p1048_legato)
  - 우리 프로젝트에서 추가로 필요한 NLP 모듈은 다른 프로젝트에서 구축 중에 있습니다.

## Developers

> **우리는 날마다 모든 면에서, 점점 더 좋아지고 있다.**
> *- SW Maestro 10기 Team Legato*

* 이정민(imleejm@gmail.com) : **Venus Project 총괄**
* 김건우(sowhat443@gmail.com)
* 박상준(psj8252@naver.com)

## Installing

[KoalaNLP](https://github.com/koalanlp/koalanlp) 모듈을 사용하려면 Java 8 이상이 필요합니다.

## Open Source LICENSE

* [Express & ES6 REST API Boilerplate](https://github.com/developit/express-es6-rest-api)
  - Copyright (c) 2016 Jason Miller, MIT License

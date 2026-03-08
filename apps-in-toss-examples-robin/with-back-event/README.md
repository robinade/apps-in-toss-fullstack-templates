# with-back-event

AppsInToss SDK 2.0.1 뒤로가기 이벤트 예제

## SDK API

- `BackEvent.addEventListener(callback)` - 뒤로가기 이벤트 리스너 등록 (cleanup 함수 반환)
- `BackEvent.addEventListener.isSupported()` - 지원 여부 확인

## Features

- **뒤로가기 가로채기** - 뒤로가기 버튼 이벤트를 가로채서 커스텀 처리
- **확인 모달** - 뒤로가기 시 "나가시겠습니까?" 확인 다이얼로그 표시
- **감지 횟수 카운트** - 뒤로가기 감지 횟수 실시간 표시
- 웹 환경에서는 `popstate` 이벤트 기반 폴백 제공

## Run

```bash
npm install
npm run dev
```

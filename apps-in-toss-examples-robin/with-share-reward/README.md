# with-share-reward

> 연락처 공유로 리워드를 받는 예제

## 사용된 SDK API
- `contactsViral()` — 연락처 바이럴 공유 모달
- `getOperationalEnvironment()` — 환경 감지

## 주요 기능
- 연락처 공유 모달 호출
- 일일 공유 한도 (10회)
- 리워드 콜백 처리
- 웹 환경 mock 동작

## 실행 방법
```
npm install
npm run dev
```

## 핵심 코드
- `src/hooks/useShareReward.ts` — 공유 리워드 훅 + Zustand 스토어

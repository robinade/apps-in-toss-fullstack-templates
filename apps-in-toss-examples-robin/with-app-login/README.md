# with-app-login

> 토스 appLogin → 서버 토큰 교환 흐름 예제

## 사용된 SDK API
- `appLogin()` — 토스 인증 → `{ authorizationCode, referrer }` 반환
  - `authorizationCode`: 서버 토큰 교환용 인증 코드
  - `referrer`: `'DEFAULT'` | `'SANDBOX'` (실행 환경 구분)

## 주요 기능
- appLogin() SDK 호출
- authCode → 서버 토큰 교환
- 웹 환경 mock 로그인
- Express.js 서버 포함

## 실행 방법
```
# 클라이언트
npm install && npm run dev

# 서버 (별도 터미널)
cd server && npm install && npm run dev
```

## 핵심 코드
- `src/hooks/useAuth.ts` — 인증 훅
- `server/src/index.ts` — 토큰 교환 서버

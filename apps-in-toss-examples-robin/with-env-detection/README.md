# with-env-detection

> 현재 실행 환경(web/toss/sandbox)을 감지하는 예제

## 사용된 SDK API
- `getOperationalEnvironment()` — 실행 환경 반환 ('web' | 'toss' | 'sandbox')

## 실행 방법
```
npm install
npm run dev
```

## 핵심 코드
- `src/hooks/useEnvironment.ts` — 환경 감지 훅
- `src/lib/environment.ts` — SDK 래퍼 + 캐싱

## 참고
- [공식 문서](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/)

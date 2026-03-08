# with-rewarded-ad

> 보상형 광고 (load → show → reward) 패턴 예제

## 사용된 SDK API
- `loadFullScreenAd()` — 광고 로드
- `showFullScreenAd()` — 광고 표시 + 이벤트 수신

## 주요 기능
- 지수 백오프 리트라이 (최대 3회)
- 일일 시청 한도 관리 (80회)
- 로드 타임아웃 (15초)
- 웹 환경 mock 동작
- 전체 이벤트 로그

## 실행 방법
```
npm install
npm run dev
```

## 핵심 코드
- `src/hooks/useRewardedAd.ts` — 보상형 광고 훅
- `src/lib/constants.ts` — 광고 설정 상수

# with-interstitial-ad

> 화면 전환 전 전면 광고를 노출하는 예제

## 사용된 SDK API
- `loadFullScreenAd()` — 전면 광고 로드
- `showFullScreenAd()` — 전면 광고 표시

## 주요 기능
- load → show → onCompleted 패턴
- 화면 전환 전 광고 노출
- 지수 백오프 리트라이
- 웹 환경 mock 동작

## 실행 방법
```
npm install
npm run dev
```

## 핵심 코드
- `src/hooks/useInterstitialAd.ts` — 전면 광고 훅
- `src/lib/constants.ts` — 광고 설정 상수

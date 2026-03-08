# with-banner-ad

> TossAds v2 배너 광고 (고정형 + 인라인) 예제

## 사용된 SDK API
- `TossAds.initialize()` — SDK 초기화
- `TossAds.attachBanner()` — 배너 광고 부착

## 주요 기능
- 고정형 배너 (96px 하단 고정)
- 인라인 네이티브 이미지 배너
- SDK 초기화 싱글톤 패턴
- 웹 환경 mock 배너

## 실행 방법
```
npm install
npm run dev
```

## 핵심 코드
- `src/hooks/useBannerAd.ts` — TossAds 초기화 + 배너 부착 훅
- `src/components/BannerAd.tsx` — 배너 광고 컴포넌트

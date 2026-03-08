# with-in-app-purchase

AppsInToss SDK 2.0.1 인앱 결제(In-App Purchase) 예제

## 사용 SDK API

| API | 설명 |
|-----|------|
| `getProductItemList` | 등록된 상품 목록 조회 (productId, title, description, price, currency) |
| `createOneTimePurchaseOrder` | 1회성 상품 구매 주문 생성 (orderId, productId, purchaseTime 반환) |
| `getOperationalEnvironment` | 실행 환경 감지 (web / toss / sandbox) |

## 주요 기능

- **상품 목록 조회**: 앱 로드 시 자동으로 등록된 상품 목록을 불러옴
- **1회성 구매**: 상품별 구매 버튼 클릭으로 결제 프로세스 실행
- **환경 분기**: 토스 앱 내부에서는 실제 SDK 호출, 웹 브라우저에서는 Mock 데이터로 동작
- **이벤트 로그**: 모든 IAP 관련 이벤트를 실시간 로그로 표시

## Mock 상품 (웹 환경)

| 상품 ID | 이름 | 가격 |
|---------|------|------|
| `gem_100` | 보석 100개 | 1,100원 |
| `gem_500` | 보석 500개 | 4,900원 |
| `premium` | 프리미엄 구독 | 9,900원 |

## 실행 방법

```bash
npm install
npm run dev
```

## 프로젝트 구조

```
src/
  hooks/useIAP.ts          # 인앱 결제 커스텀 훅
  components/DemoLayout.tsx # 공통 데모 레이아웃
  stores/eventLogStore.ts   # 이벤트 로그 Zustand 스토어
  lib/environment.ts        # 환경 감지 유틸
  lib/sdk.ts                # SDK 재시도 유틸
  lib/utils.ts              # Tailwind cn 유틸
  App.tsx                   # 메인 앱 컴포넌트
  main.tsx                  # 엔트리포인트
```

# with-contacts-viral

AppsInToss SDK 2.0.1 연락처 바이럴(친구 초대) 예제

## SDK API

- `contactsViral(options)` - 연락처 기반 친구 초대 모달을 열고 바이럴 이벤트를 수신합니다.

### 주요 파라미터

```typescript
contactsViral({
  options: { moduleId: string },
  onEvent: (event: { type: string; data: any }) => void,
  onError: (error: unknown) => void,
})
```

### 이벤트 타입

| 이벤트 | 설명 |
|--------|------|
| `sendViral` | 초대 전송 완료 시 (rewardAmount 포함) |
| `close` | 초대 모달 닫힘 (sentRewardsCount 포함) |

## Features

- **친구 초대**: `contactsViral` API로 연락처 기반 초대 모달 표시
- **초대 현황 추적**: 보낸 초대 수, 수락 수, 리워드 총액 실시간 표시
- **리워드 콜백**: `sendViral` 이벤트로 리워드 금액 수신 및 합산
- **Mock 모드**: 웹 환경에서는 2초 후 mock 데이터로 시뮬레이션
- **이벤트 로그**: 모든 SDK 이벤트를 타임스탬프와 함께 기록

## 실행 방법

```bash
# 의존성 설치
yarn install

# 개발 서버 실행
yarn dev

# 빌드
yarn build
```

## 환경 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `VITE_VIRAL_MODULE_ID` | 바이럴 모듈 ID | `<YOUR_MODULE_ID>` |

## 파일 구조

```
src/
├── App.tsx                    # 메인 앱 (초대 UI + 현황 대시보드)
├── hooks/useContactsViral.ts  # contactsViral SDK 래퍼 훅
├── stores/eventLogStore.ts    # 이벤트 로그 Zustand 스토어
├── components/DemoLayout.tsx  # 공통 레이아웃
├── lib/environment.ts         # 환경 감지 (toss/web)
├── lib/sdk.ts                 # SDK 유틸리티
└── lib/utils.ts               # cn() 유틸리티
```

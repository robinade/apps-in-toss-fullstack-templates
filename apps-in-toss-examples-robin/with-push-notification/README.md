# with-push-notification

서버 API를 통한 푸시 알림 발송 예제입니다.

## 주요 기능

- 푸시 알림 제목/내용/대상 유저 입력 폼
- 테스트 푸시 알림 발송
- Express 서버를 통한 Push API 엔드포인트
- 발송 결과 및 이벤트 로그 표시
- 서버 미연결 시 Mock 응답 fallback

## 실행 방법

### 클라이언트

```bash
cd with-push-notification
npm install
npm run dev
```

### 서버

```bash
cd with-push-notification/server
npm install
npm run dev
```

클라이언트는 `http://localhost:5173`, 서버는 `http://localhost:3002`에서 실행됩니다.

## 프로젝트 구조

```
with-push-notification/
├── src/
│   ├── App.tsx                    # 메인 UI (입력 폼 + 발송 버튼)
│   ├── hooks/
│   │   └── usePushNotification.ts # 푸시 발송 훅 (mock fallback 포함)
│   ├── components/
│   │   └── DemoLayout.tsx         # 공통 레이아웃
│   ├── stores/
│   │   └── eventLogStore.ts       # 이벤트 로그 상태
│   └── lib/
│       ├── sdk.ts                 # SDK 초기화
│       ├── environment.ts         # 환경 감지
│       └── utils.ts               # 유틸리티
├── server/
│   ├── package.json               # 서버 의존성
│   └── src/
│       └── index.ts               # Express 서버 (Push API)
├── granite.config.ts
├── package.json
└── README.md
```

## 프로덕션 참고

실제 프로덕션에서는 서버에서 AppsInToss Push API를 호출합니다:

```
POST https://api-gateway.apps-in-toss.com/push/v1/messages
```

mTLS 인증이 필요하며, 서버 인증서 설정이 필요합니다.

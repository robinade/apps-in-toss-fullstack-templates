# 문제 해결 가이드

## 일반

### `ait` 명령어를 찾을 수 없어요
```bash
npm install @apps-in-toss/web-framework@2.0.1
npx ait dev  # npx로 실행
```

### 웹 브라우저에서 SDK가 동작하지 않아요
정상입니다. 웹 환경에서는 mock 동작이 실행됩니다.
`getOperationalEnvironment()`이 `'web'`을 반환하면 SDK API 대신 mock 데이터를 사용합니다.

### TypeScript 에러: Cannot find module '@apps-in-toss/web-framework'
```bash
npm install @apps-in-toss/web-framework@2.0.1
```

## 광고 관련

### 광고가 로드되지 않아요
- 토스 앱 내에서만 동작합니다 (웹 브라우저 X)
- 샌드박스 환경에서 테스트 광고 ID를 사용하세요
- `loadFullScreenAd.isSupported()`가 `true`인지 확인
- 공식 가이드: https://developers-apps-in-toss.toss.im/ads/develop.html

### TossAds 배너가 표시되지 않아요
- `TossAds.initialize()`를 먼저 호출했는지 확인
- 배너 컨테이너 div에 고정 높이(96px)가 설정되어 있는지 확인
- 공식 가이드: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/광고/BannerAd.html

## 시나리오 예제

### 서버가 실행되지 않아요
```bash
cd server && npm install  # 서버 의존성 별도 설치
npm run dev              # 서버만 실행 (포트 3001)
```

### SQLite 에러: better-sqlite3 빌드 실패
```bash
npm rebuild better-sqlite3
# 또는 Node.js 버전 확인 (20+ 권장)
```

### 포트 충돌 (EADDRINUSE)
다른 시나리오 예제가 이미 실행 중일 수 있습니다. 해당 프로세스를 종료하거나 포트를 변경하세요:
```bash
# 서버 포트 변경
PORT=3002 npm run dev:server
```

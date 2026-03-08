# with-network-status

네트워크 연결 상태를 실시간으로 감지하는 AppsInToss SDK 2.0.1 예제입니다.

## SDK API

### getNetworkStatus()

현재 네트워크 연결 상태를 조회합니다.

```typescript
import { getNetworkStatus } from '@apps-in-toss/web-framework';

if (getNetworkStatus.isSupported()) {
  const status = await getNetworkStatus();
  // status.isConnected: boolean
  // status.type: string ('wifi' | 'cellular' | 'ethernet' | 'unknown')
}
```

### 브라우저 이벤트 기반 감지

네트워크 상태 변경을 실시간으로 감지합니다.

```typescript
// 브라우저 표준 이벤트 기반 감지
window.addEventListener('online', () => { /* 온라인 전환 */ });
window.addEventListener('offline', () => { /* 오프라인 전환 */ });
```

## 주요 기능

- 온/오프라인 상태 실시간 표시
- 네트워크 타입 감지 (WiFi, Cellular 등)
- 수동 새로고침 버튼
- 이벤트 로그로 상태 변화 추적
- 웹/토스 환경 자동 분기

## 실행

```bash
cd with-network-status
npm install
npm run dev
```

`http://localhost:5173` 에서 확인할 수 있습니다.

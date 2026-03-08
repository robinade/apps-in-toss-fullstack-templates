# with-haptic-feedback

AppsInToss SDK 2.0.1 햅틱 피드백 예제

## SDK API

- `generateHapticFeedback({ type })` - 햅틱 피드백 트리거
- `generateHapticFeedback.isSupported()` - 지원 여부 확인

## Features

- **Light** - 가벼운 터치 피드백 (10ms)
- **Medium** - 보통 강도 피드백 (30ms)
- **Heavy** - 강한 터치 피드백 (50ms)
- **Selection** - 선택 피드백 (5ms)
- 웹 환경에서는 `navigator.vibrate()` API 폴백 제공

## Run

```bash
npm install
npm run dev
```

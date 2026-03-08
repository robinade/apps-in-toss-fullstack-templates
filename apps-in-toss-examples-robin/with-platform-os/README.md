# with-platform-os

AppsInToss SDK 2.0.1 — 플랫폼(OS) 감지 예제

## SDK API

- `getPlatformOS()` — 현재 디바이스의 OS를 반환 (`'ios'` | `'android'` | `'unknown'`)
- `getPlatformOS.isSupported()` — 현재 환경에서 지원 여부 확인

## Features

- iOS / Android 플랫폼 자동 감지
- 플랫폼별 조건부 UI 렌더링 (아이콘, 색상, 스타일 안내)
- 웹 브라우저 폴백 (User-Agent 기반 감지)
- 다시 감지 버튼으로 수동 재감지

## Run

```bash
npm install
npm run dev
```

`http://localhost:5173` 에서 확인하세요.

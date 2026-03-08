# with-camera

AppsInToss SDK 2.0.1 카메라 촬영 예제

## SDK API

- `openCamera()` — 카메라를 열어 사진을 촬영하고 `{ uri: string }` 반환
- `openCamera.isSupported()` — 현재 환경에서 카메라 촬영 지원 여부 확인

## Features

- 카메라 촬영 (토스 앱 내 네이티브 / 웹 fallback)
- 촬영된 이미지 프리뷰
- 이미지 삭제 및 재촬영
- 이벤트 로그 표시

## Run

```bash
npm install
npm run dev
```

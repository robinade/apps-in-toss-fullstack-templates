# with-clipboard-text

클립보드 텍스트 복사/붙여넣기 예제 (AppsInToss SDK 2.0.1)

## SDK API

### `setClipboardText(text: string): Promise<void>`
- 텍스트를 클립보드에 복사합니다.
- `setClipboardText.isSupported()` 로 지원 여부를 확인할 수 있습니다.

### `getClipboardText(): Promise<string>`
- 클립보드에서 텍스트를 읽어옵니다.
- `getClipboardText.isSupported()` 로 지원 여부를 확인할 수 있습니다.

## Features

- 텍스트 입력 후 클립보드에 복사
- 클립보드에서 텍스트 붙여넣기 (읽기)
- 웹 환경에서는 `navigator.clipboard` API 폴백
- 토스 앱 환경에서는 SDK의 `setClipboardText` / `getClipboardText` API 사용
- 이벤트 로그로 동작 확인

## Run

```bash
npm install
npm run dev
```

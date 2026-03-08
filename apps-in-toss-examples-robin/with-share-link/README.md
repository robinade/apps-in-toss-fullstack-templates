# with-share-link

토스 딥링크를 생성하고 공유하는 AppsInToss SDK 2.0.1 예제입니다.

## SDK API

### `getTossShareLink(url: string, ogImageUrl?: string): Promise<string>`

토스 앱 내에서 공유 링크를 생성합니다.

```typescript
import { getTossShareLink } from '@apps-in-toss/web-framework';

const shareUrl = await getTossShareLink('intoss://my-app/invite?ref=abc123');
console.log(shareUrl); // 생성된 공유 링크 URL 문자열
```

- `url` — 딥링크 경로 (예: `'intoss://my-app/invite?ref=abc123'`)
- `ogImageUrl` — (선택) 소셜 미디어 미리보기용 OG 이미지 URL
- 반환값: `Promise<string>` — 공유 링크 URL 문자열

## Features

- 딥링크 경로 및 파라미터 입력
- 토스 딥링크 URL 생성
- 클립보드 복사 기능
- 웹 환경에서 모의(mock) 딥링크 생성
- 이벤트 로그를 통한 동작 확인

## Run

```bash
npm install
npm run dev
```

`http://localhost:5173`에서 확인할 수 있습니다.

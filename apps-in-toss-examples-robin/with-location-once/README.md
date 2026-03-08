# with-location-once

현재 위치를 1회 가져오는 AppsInToss SDK 2.0.1 예제입니다.

## SDK API

### `getCurrentLocation(options?)`

현재 위치를 1회 조회합니다.

```typescript
import { getCurrentLocation } from '@apps-in-toss/web-framework';

// 지원 여부 확인
if (getCurrentLocation.isSupported()) {
  const position = await getCurrentLocation({
    enableHighAccuracy: true,
  });

  console.log(position.coords.latitude);
  console.log(position.coords.longitude);
  console.log(position.coords.accuracy);
  console.log(position.timestamp);
}
```

**Options:**
| 옵션 | 타입 | 설명 |
|------|------|------|
| `enableHighAccuracy` | `boolean` | GPS 기반 고정밀 위치 사용 여부 |

**Response:**
| 필드 | 타입 | 설명 |
|------|------|------|
| `coords.latitude` | `number` | 위도 |
| `coords.longitude` | `number` | 경도 |
| `coords.accuracy` | `number` | 정확도 (미터) |
| `timestamp` | `number` | 측정 시각 (Unix ms) |

## Features

- 버튼 클릭으로 현재 위치 1회 조회
- 토스 앱: `getCurrentLocation` SDK API 사용
- 웹 브라우저: `navigator.geolocation.getCurrentPosition` 폴백
- 위도, 경도, 정확도 표시
- 이벤트 로그로 요청/성공/실패 추적

## Run

```bash
cd REFERENCE/apps-in-toss-examples-robin/with-location-once
npm install
npm run dev
```

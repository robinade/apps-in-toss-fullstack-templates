# AppsInToss Fullscreen Ad API Reference

InApp Ad 2.0 ver2 — Toss Ads + Google AdMob integrated SDK.
Both interstitial and rewarded ads use the same API. Ad type is determined by `adGroupId`.

## SDK Requirements

| Platform | Package | Min Version |
|---|---|---|
| WebView | `@apps-in-toss/web-framework` | 1.6.0 |
| React Native | `@apps-in-toss/framework` | 1.6.0 |

## Toss App Version Support

| Toss App Version | Support | Description |
|---|---|---|
| 5.244.1+ | v2 | Toss Ads priority + AdMob fallback |
| 5.227.0 ~ 5.244.0 | v1 | AdMob only |
| < 5.227.0 | None | Not supported |

## Test Ad Group IDs

| Ad Type | Test ID |
|---|---|
| 보상형 (Rewarded) | `ait-ad-test-rewarded-id` |
| 전면형 (Interstitial) | `ait-ad-test-interstitial-id` |

> **WARNING**: 개발 단계에서는 반드시 테스트 ID 사용. 운영 ID로 테스트하면 정책 위반으로 제재 가능.

---

## loadFullScreenAd

```typescript
function loadFullScreenAd(params: LoadFullScreenAdParams): () => void;
```

Returns cleanup function (unregister callbacks).

### LoadFullScreenAdParams

```typescript
interface LoadFullScreenAdParams {
  options: { adGroupId: string };
  onEvent: (data: LoadFullScreenAdEvent) => void;
  onError: (err: unknown) => void;
}
```

### LoadFullScreenAdEvent

```typescript
interface LoadFullScreenAdEvent {
  type: 'loaded';
}
```

### isSupported

```typescript
loadFullScreenAd.isSupported(): boolean
```

### Operating Rules

- `load → show → load` 순서 강제
- `loaded` 이벤트 수신 후 `showFullScreenAd` 호출
- 한 번에 하나의 광고만 로드 가능
- show 후 다음 광고 미리 로드 권장 (`load → show → load → show`)
- iOS ATT(앱 추적 투명성) 미허용 시 로드 실패 가능

---

## showFullScreenAd

```typescript
function showFullScreenAd(params: ShowFullScreenAdParams): () => void;
```

`adGroupId`는 `loadFullScreenAd`에서 사용한 것과 동일해야 함.

### ShowFullScreenAdParams

```typescript
interface ShowFullScreenAdParams {
  options: { adGroupId: string };
  onEvent: (data: ShowFullScreenAdEvent) => void;
  onError: (err: unknown) => void;
}
```

### ShowFullScreenAdEvent

```typescript
type ShowFullScreenAdEvent =
  | { type: 'requested' }
  | { type: 'show' }
  | { type: 'impression' }
  | { type: 'clicked' }
  | { type: 'dismissed' }
  | { type: 'failedToShow' }
  | { type: 'userEarnedReward'; data: { unitType: string; unitAmount: number } };
```

### isSupported

```typescript
showFullScreenAd.isSupported(): boolean
```

---

## Event Flow

### Interstitial

```
load → loaded → show → requested → show → impression → clicked/dismissed
```

### Rewarded

```
load → loaded → show → requested → show → impression
  → [시청 완료] → userEarnedReward → dismissed
```

## Key Rules

- **보상 지급**: `userEarnedReward`에서만. `dismissed`에서 지급 금지.
- **Reload**: `dismissed` 또는 `failedToShow` 후 반드시 `loadAd()` 재호출.
- **Cleanup**: 반환된 해제 함수를 컴포넌트 언마운트 시 호출.
- **Load timing**: 컴포넌트 마운트 시, 이전 광고 닫힌 직후, 화면 전환 전.
- **Anti-pattern**: 버튼 클릭 시 load+show 동시 호출 (사용자 대기 시간 발생).

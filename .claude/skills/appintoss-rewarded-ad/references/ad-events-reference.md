# Fullscreen Ad Event Reference

## Load Events (`loadFullScreenAd` onEvent)

| Event | When | Data | Action |
|-------|------|------|--------|
| `loaded` | 광고 로드 완료 | - | `isReady = true`, show 가능 |

## Show Events (`showFullScreenAd` onEvent)

| Event | When | Data | Action |
|-------|------|------|--------|
| `requested` | show 호출 직후 | - | 로딩 UI 표시 |
| `show` | 광고 화면 표시 | - | 앱 사운드 일시정지 |
| `impression` | 노출 기록 (수익 발생) | - | 노출 카운트 증가 |
| `clicked` | 사용자 광고 클릭 | - | - |
| `dismissed` | 광고 닫힘 | - | 사운드 재개 + `loadAd()` 재호출 |
| `failedToShow` | 표시 실패 | - | 사운드 재개 + 에러 처리 + `loadAd()` |
| `userEarnedReward` | 보상 획득 (보상형만) | `{ unitType, unitAmount }` | 보상 지급 |

## TypeScript Type

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

## Event Flow

### Rewarded

```
requested → show → impression → [시청 완료] → userEarnedReward → dismissed
```

### Interstitial

```
requested → show → impression → clicked/dismissed
```

## Key Rules

- **보상 지급**: `userEarnedReward`에서만. `dismissed`에서 지급 금지.
- **Reload**: `dismissed` 또는 `failedToShow` 후 반드시 `loadAd()`.
- **Sound**: `show` 시 앱 사운드 정지, `dismissed`/`failedToShow` 시 재개.
- **Cleanup**: 반환된 해제 함수를 컴포넌트 언마운트 시 호출.
- **adGroupId 일치**: `showFullScreenAd`의 adGroupId는 `loadFullScreenAd`와 동일해야 함.

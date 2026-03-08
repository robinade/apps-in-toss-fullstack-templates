---
name: appintoss-rewarded-ad
description: >
  Guides implementation of rewarded and interstitial fullscreen ads in AppsInToss WebView
  mini-apps using loadFullScreenAd and showFullScreenAd APIs (InApp Ad 2.0 ver2, integrated
  Toss Ads + AdMob SDK). Covers console setup (business registration, settlement, ad group
  creation), ad group ID issuance, SDK integration with dynamic import pattern, web mock
  fallback, load-show-reload cycle, event handling, retry with backoff, ad policy compliance,
  QA checklist, and troubleshooting.
  Use when implementing rewarded ads, interstitial ads, fullscreen ads, ad monetization,
  or loadFullScreenAd/showFullScreenAd in AppsInToss projects.
  Triggers: "보상형 광고", "rewarded ad", "전면형 광고", "interstitial ad", "fullscreen ad",
  "loadFullScreenAd", "showFullScreenAd", "광고 구현", "ad monetization", "리워드 광고",
  "광고 로드", "광고 보여주기", "인앱 광고 2.0", "인앱 광고", "인앱광고".
---

# AppsInToss Fullscreen Ad Implementation (Rewarded + Interstitial)

Implement fullscreen ads in AppsInToss WebView mini-apps using InApp Ad 2.0 ver2 (integrated SDK).
Both ad types share the same API — the type is determined by the adGroupId from the console.

## Quick Reference

| Item | Value |
|------|-------|
| SDK (WebView) | `@apps-in-toss/web-framework` >= **1.6.0** |
| SDK (React Native) | `@apps-in-toss/framework` >= **1.6.0** |
| Test ID (보상형) | `ait-ad-test-rewarded-id` |
| Test ID (전면형) | `ait-ad-test-interstitial-id` |
| Min Toss (v2, Toss Ads+AdMob) | 5.244.1 |
| Min Toss (v1, AdMob only) | 5.227.0 |
| Load API | `loadFullScreenAd(params)` → cleanup fn |
| Show API | `showFullScreenAd(params)` → cleanup fn |

> **Sandbox does NOT support ads.** Test via console QR code on a real device.

For full API types, see [references/official-api-docs.md](references/official-api-docs.md).

---

## Step 0: Onboarding

Use AskUserQuestion to determine starting point:

**Question:** "보상형/전면형 광고 구현 단계를 선택해주세요"
**Options:**
- A) 처음부터 — 콘솔 설정 + 광고 그룹 ID 발급부터
- B) 광고 ID 있음 — 코드 구현만
- C) 구현 완료 — 광고가 안 나옴 (트러블슈팅)

### If A: Console Setup

1. **사업자 정보 등록**: 개발자 콘솔 → 워크스페이스 → 사업자 정보 등록
2. **정산 정보 입력**: 워크스페이스 '정보' 탭 → 정산 정보 → 검토 요청 (영업일 2~3일 소요)
3. **광고 그룹 생성**: 미니앱 선택 → 광고 관리 → 광고 그룹 생성
   - **광고 유형** 선택: 전면 광고 / 리워드 광고
   - **리워드 광고 시 보상 설정**: 보상 단위명(예: "기회", "코인")과 수량 입력
   - **미디에이션**: 카테고리 자동 설정, 광고 네트워크 자동 배정
4. 광고 그룹 ID 발급 (구글 등록까지 **최대 2시간** 소요)
5. 그동안 테스트 ID로 먼저 구현 → 승인 후 실제 ID로 교체

> Console URL: `https://developers-apps-in-toss.toss.im`

### If B: → 구현 워크플로로 이동
### If C: → 트러블슈팅 섹션으로 이동

---

## Implementation Workflow

```
- [ ] Step 1: 환경변수에 adGroupId 설정 (보상형/전면형 구분)
- [ ] Step 2: useRewardedAd 훅 생성 (dynamic import 패턴)
- [ ] Step 3: 광고 버튼/트리거 컴포넌트에 훅 연결
- [ ] Step 4: 앱 사운드 일시정지/재개 처리
- [ ] Step 5: 웹 환경 mock 동작 확인
- [ ] Step 6: 실기기에서 QR 코드로 광고 테스트 (QA)
```

### Step 1: Ad Group ID Setup

```typescript
// .env
VITE_REWARDED_AD_GROUP_ID=ait-ad-test-rewarded-id
VITE_INTERSTITIAL_AD_GROUP_ID=ait-ad-test-interstitial-id
```

Use AskUserQuestion: "보상형 광고, 전면형 광고, 또는 둘 다 구현하시나요?"

### Step 2: Create Hook

Use AskUserQuestion to offer choice:
- **기본 훅** — 심플한 load/show/reload → See [references/useRewardedAd-basic.ts](references/useRewardedAd-basic.ts)
- **프로덕션 훅** — 로드 큐, 재시도, 타임아웃, 일일 제한 → See [references/useRewardedAd-production.ts](references/useRewardedAd-production.ts)

Constants: See [references/constants.ts](references/constants.ts)

### Step 3: Connect to UI

**보상형 (Rewarded)** — 사용자가 자발적으로 선택:
```tsx
<button onClick={handleShowAd} disabled={!isReady}>
  광고 보고 보상 받기
</button>
```

**전면형 (Interstitial)** — 화면 전환 시점에 노출:
```tsx
// 스테이지 클리어, 탭 전환 등 흐름이 끊기는 구간에서
if (isReady) showAd({ onDismiss: () => navigateNext() });
```

### Step 4: Sound Management

```typescript
// 광고 show 시 앱 사운드 일시정지
onEvent: (event) => {
  if (event.type === 'show') pauseAppSound();
  if (event.type === 'dismissed' || event.type === 'failedToShow') resumeAppSound();
}
```

### Step 5-6: Test

- **웹**: `npm run dev` → mock으로 flow 확인
- **실기기**: `npx granite dev` → 콘솔 QR 코드로 연결 → 실제 광고 테스트
- **QA 체크리스트**: See [references/qa-checklist.md](references/qa-checklist.md)

---

## Core Patterns

### SDK Safety Pattern (MUST follow)

```typescript
const { loadFullScreenAd } = await import('@apps-in-toss/web-framework');
if (loadFullScreenAd.isSupported() !== true) {
  // mock or unsupported fallback
  return;
}
```

### Load-Show-Reload Cycle

```
load(adGroupId) → onEvent: 'loaded' → show(adGroupId)
  → 'userEarnedReward' (보상형만) → grant reward
  → 'dismissed' → load(adGroupId)  // preload next
```

**Rules:**
- `load → show → load` 순서 강제
- 한 번에 하나의 광고만 로드 가능
- `dismissed`/`failedToShow` 후 반드시 reload
- `showFullScreenAd`의 adGroupId는 `loadFullScreenAd`와 동일해야 함

### Reward Handling

```typescript
// ONLY grant on userEarnedReward, NEVER on dismissed alone
if (event.type === 'userEarnedReward') {
  grantReward(event.data.unitType, event.data.unitAmount);
}
```

### Cleanup

```typescript
const unregister = loadFullScreenAd({ ... });
return () => unregister(); // on unmount
```

---

## Ad Policy Compliance

| Rule | Detail |
|------|--------|
| 서비스 진입 직후 전면 광고 금지 | 예상치 못한 시점 노출 불가 |
| 결제/인증/로그인 중 광고 금지 | 핵심 플로우 차단 불가 |
| 클릭 보상 문구 금지 | "광고 클릭 시 포인트 지급" 등 불가 |
| 광고 UI 임의 수정 금지 | SDK 기본 이벤트 구조 변조 불가 |
| 앱 사운드 관리 | 광고 중 음소거, 종료 후 재개 |
| 과도한 노출 방지 | 빈도 제한/쿨다운 적용 |
| 테스트 시 운영 ID 사용 금지 | 제재 대상 — 반드시 테스트 ID 사용 |

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| 광고 로드 안 됨 | `isSupported()` false | 토스 앱 5.227.0+ 필요 |
| iOS에서만 안 됨 | ATT 미허용 | 설정 → 개인정보 → 추적 허용 |
| `loaded` 이벤트 안 옴 | adGroupId 오류 또는 미등록 | 콘솔에서 ID 확인 (등록 2시간 소요) |
| show 후 보상 안 옴 | `userEarnedReward` 핸들러 누락 | onEvent에서 event.type 체크 |
| 두 번째 광고 안 나옴 | reload 안 함 | `dismissed` 후 `loadAd()` 재호출 |
| `loadFullScreenAd is not a function` | Static import | Dynamic import로 변경 |
| 샌드박스에서 안 됨 | 샌드박스 미지원 | 콘솔 QR 코드로 실기기 테스트 |
| 웹에서 크래시 | SDK 직접 호출 | `isSupported()` 체크 또는 환경 분기 |
| "not supported" 에러 | SDK 버전 낮음 | `@apps-in-toss/web-framework` >= 1.6.0 확인 |

---

## References

- **API types & signatures**: [references/official-api-docs.md](references/official-api-docs.md)
- **Basic hook**: [references/useRewardedAd-basic.ts](references/useRewardedAd-basic.ts)
- **Production hook**: [references/useRewardedAd-production.ts](references/useRewardedAd-production.ts)
- **Constants & backoff**: [references/constants.ts](references/constants.ts)
- **Show event types**: [references/ad-events-reference.md](references/ad-events-reference.md)
- **QA checklist**: [references/qa-checklist.md](references/qa-checklist.md)

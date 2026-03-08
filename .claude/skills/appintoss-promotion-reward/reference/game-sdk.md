# Game App SDK Approach

Guide for implementing Toss Points promotion rewards in **game** mini-apps. Game apps use a client-side SDK function — no server-side API integration is needed.

---

## Overview

Game mini-apps use the `grantPromotionRewardForGame` SDK function to grant Toss Points directly from the client. This is simpler than the non-game 3-step server API, but comes with specific constraints.

**Key differences from non-game:**
- No server required — SDK handles the entire flow
- No mTLS certificates needed
- No round-robin code distribution (single code per call)
- Duplicate call prevention is critical (SDK does not deduplicate)

---

## Prerequisites

1. **Toss app version 5.232.0+** — `grantPromotionRewardForGame` is not available in older versions
2. **Promotion registered** in AppsInToss Console as a game promotion
3. **Promotion review approved** (~2-3 business days)
4. **Test code activated** — at least 1 successful test API call with `TEST_` prefix code
5. **Toss Login integrated** — need `userKey` for the grant call

---

## SDK Function

### grantPromotionRewardForGame

```typescript
import { grantPromotionRewardForGame } from '@apps-in-toss/sdk';

const result = await grantPromotionRewardForGame({
  promotionCode: '01JPPJ6SB66BQXXDAKRQZ6SZD7',
  amount: 10,
});
```

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `promotionCode` | string | Y | Promotion code from console |
| `amount` | number | Y | Points to grant (max 5,000 per person total) |

### Response

```typescript
interface GrantResult {
  resultType: 'SUCCESS' | 'FAIL';
  success?: { key: string };
  error?: { code: number; message: string };
}
```

On success, `resultType` is `SUCCESS`. On failure, check `error.code` — same error codes as the server API (4100, 4109, 4110, 4112, 4113, 4114, 4116). See [error-codes.md](error-codes.md) for details.

---

## Critical: Duplicate Prevention

The SDK does **not** deduplicate calls automatically. If you call `grantPromotionRewardForGame` twice with different keys, the user gets double points. You must implement your own deduplication:

```typescript
let isGranting = false;

async function grantReward(promotionCode: string, amount: number) {
  if (isGranting) return; // Prevent concurrent calls
  isGranting = true;

  try {
    const result = await grantPromotionRewardForGame({
      promotionCode,
      amount,
    });

    if (result.resultType === 'SUCCESS') {
      // Mark this grant as completed in your state/DB
      // Prevent re-granting for this trigger event
    }

    return result;
  } finally {
    isGranting = false;
  }
}
```

### Additional safeguards

- Disable the trigger button after first click
- Track granted events in local storage or your database
- Validate on your server that the user hasn't already been granted for this event

---

## Test Code Activation

Same as non-game apps — you must activate at least 1 test code before the promotion review can be approved.

1. Get a test promotion code from the console (click "테스트" button)
2. The test code has `TEST_` prefix: e.g., `TEST_01KHXFH8DYGH5R146ZATFDTNWJ`
3. Call `grantPromotionRewardForGame` with the test code
4. Verify `resultType: SUCCESS`
5. No real points are deducted or issued during testing

```typescript
// Test call
const testResult = await grantPromotionRewardForGame({
  promotionCode: 'TEST_01KHXFH8DYGH5R146ZATFDTNWJ',
  amount: 1,
});
console.log('Test result:', testResult);
// Expected: { resultType: 'SUCCESS', success: { key: '...' } }
```

---

## Promotion Types for Games

### Allowed

- **Sign-up/access rewards**: Points for first-time login or app access
- **Transaction incentives**: Points for in-game purchases (clear conditions required)
- **Event participation**: Surveys, quizzes, simple missions
- **Friend referral**: Both inviter and invitee rewarded

### Prohibited

- **Probability/random rewards** (roulette, gacha, random draw)
- **Game result-based rewards** (score, rank, win/loss)
- **Asset-to-points conversion** (in-game currency to Toss Points)
- **Over 5,000 points per person**

Game promotions with probability elements are strictly prohibited — this is classified as gambling (사행행위) under Korean law.

---

## Constraints

| Constraint | Value |
|-----------|-------|
| Max points per person (all promotions) | 5,000 |
| Min Toss app version | 5.232.0 |
| Test code prefix | `TEST_` |
| Budget alert email | At 80% consumption |
| Promotion review period | 2-3 business days |

---

## When to Use Server API Instead

If your game app needs any of the following, use the non-game server-side 3-step API approach instead:

- Round-robin distribution across multiple promotion codes
- Server-side grant amount calculation
- Complex anti-abuse logic on the server
- Integration with rewarded ads (requires ad token verification)
- Lottery/random reward amount determination on server

For the server-side approach, return to the main [SKILL.md](../SKILL.md) and follow the non-game path.

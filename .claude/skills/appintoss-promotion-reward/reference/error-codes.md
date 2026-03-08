# Error Code Reference

Complete error code reference with resolution steps for the Toss Promotion API.

---

## Response Format

All three Toss Promotion APIs (getKey, executePromotion, getExecutionResult) return a top-level `resultType` field.

### ResultType Values

| resultType | Description | Action |
|------------|-------------|--------|
| `SUCCESS` | Request succeeded | Process the `success` field |
| `FAIL` | Business logic error | Check `error.code` and `error.message` |
| `HTTP_TIMEOUT` | HTTP request timed out | Retry with backoff |
| `NETWORK_ERROR` | Network-level failure | Check connectivity, retry |
| `EXECUTION_FAIL` | Execution failed internally | Retry, then escalate |
| `INTERRUPTED` | Request was interrupted | Retry |
| `INTERNAL_ERROR` | Toss internal server error | Retry, then escalate |

### Success Response

```json
{
  "resultType": "SUCCESS",
  "success": {
    "key": "3oBpxjUgl5r66edcVi7ynHGIjhzr9KOka6FfEKikev0="
  }
}
```

### Error Response

When `resultType` is `FAIL`, the response includes an `error` object:

```json
{
  "resultType": "FAIL",
  "error": {
    "code": 4109,
    "message": "프로모션이 실행중이 아니에요"
  }
}
```

---

## Error Codes

### 4100 - Promotion Not Found

**Message:** 프로모션 정보를 찾을 수 없어요

**Cause:** The `promotionCode` is not registered in the console.

**Resolution:**
1. Verify the promotion code in the AppsInToss Console
2. Check for typos (codes are case-sensitive)
3. Ensure TEST_ prefix for test codes
4. Confirm promotion has been registered and reviewed

---

### 4109 - Promotion Not Running

**Message:** 프로모션이 실행중이 아니에요

**Cause:** Either:
- Promotion has not been started in the console
- Budget has been exhausted and promotion auto-terminated

**Resolution:**
1. Check console: is the promotion in "운영중" status?
2. Check budget: has it been fully consumed?
3. If budget exhausted: increase budget or top up Biz Wallet
4. **Failover strategy:** Try the next promotion code in the round-robin list

**Important:** An email alert is sent when 80% of budget is consumed. Monitor proactively.

---

### 4110 - Cannot Grant/Revoke Reward

**Message:** 리워드를 지급/회수할 수 없어요. 다시 시도해주세요.

**Cause:** Internal Toss system error (transient).

**Resolution:**
- **Retry automatically** — this is a transient error
- Retry up to 2-3 times with 200-500ms delay
- If still failing after retries, return error to client with "try again" option

```typescript
// Retry pattern for error 4110
if (errorCode === 4110 && retryCount < 2) {
  await sleep(300);
  return retryOperation();
}
```

---

### 4111 - Grant History Not Found

**Message:** 리워드 지급내역을 찾을 수 없어요

**Cause:** Queried a non-existent grant record (wrong promotionCode + key combination).

**Resolution:**
1. Verify the promotionCode and key match the original grant request
2. Ensure the key was actually used in a successful executePromotion call
3. Check logs for the original transaction

---

### 4112 - Insufficient Promotion Funds

**Message:** 프로모션 머니가 부족해요

**Cause:** The promotion's budget is depleted but hasn't auto-terminated yet.

**Resolution:**
1. Increase budget in the console (Modify Promotion)
2. Top up Biz Wallet if needed
3. **Failover strategy:** Same as 4109 — try next promotion code

---

### 4113 - Already Granted/Revoked

**Message:** 이미 지급/회수된 내역이에요

**Cause:** Attempted to grant using a key that was already used.

**Resolution:**
1. Issue a new key via getKey API
2. Use the new key for the next grant attempt
3. This is expected behavior when preventing duplicate grants

**Note:** Each key can only be used for one successful grant. This is by design.

---

### 4114 - Single Grant Amount Exceeded

**Message:** 1회 지급 금액을 초과했어요

**Cause:** The `amount` parameter exceeds the per-grant limit configured for this promotion.

**Resolution:**
1. Reduce the amount in the request
2. Check console for the promotion's per-grant limit setting
3. If you need larger grants, modify the promotion configuration

---

### 4116 - Max Grant Amount Exceeds Budget

**Message:** 최대 지급 금액이 예산을 초과했어요

**Cause:** The requested grant would push the total beyond the remaining budget.

**Resolution:**
1. Reduce the amount to fit within remaining budget
2. Increase budget in the console
3. Top up Biz Wallet if needed

---

## Error Handling Strategy

### By Severity

**Retry (transient):**
- 4110 — Auto-retry up to 2-3 times

**Failover (budget):**
- 4109 — Try next promotion code, then error
- 4112 — Try next promotion code, then error

**Client-side fix:**
- 4113 — Get new key and retry
- 4114, 4116 — Reduce amount

**Configuration fix:**
- 4100 — Check console registration
- 4111 — Check promotion code and key

### By ResultType

**Retry (non-FAIL resultTypes):**
- HTTP_TIMEOUT — Retry with exponential backoff (500ms, 1s, 2s)
- NETWORK_ERROR — Check connectivity, retry up to 3 times
- EXECUTION_FAIL — Retry once, then return error
- INTERRUPTED — Retry once
- INTERNAL_ERROR — Retry with backoff, then return error

### Recommended Implementation

```typescript
async function handlePromotionError(errorCode: number, context: GrantContext) {
  switch (errorCode) {
    case 4110:
      // Transient — retry
      if (context.retryCount < 2) {
        await sleep(300);
        return retry(context);
      }
      return { error: 'Service temporarily unavailable' };

    case 4109:
    case 4112:
      // Budget exhausted — try next code
      if (context.hasMoreCodes()) {
        return tryNextCode(context);
      }
      return { error: 'Promotion temporarily unavailable' };

    case 4113:
      // Key reused — get fresh key
      const newKey = await getPromotionKey(context.userKey);
      return retryWithNewKey(context, newKey);

    case 4114:
    case 4116:
      return { error: 'Grant amount exceeds limit' };

    case 4100:
      return { error: 'Invalid promotion configuration' };

    default:
      return { error: 'Unknown error' };
  }
}

function handleResultType(resultType: string, retryCount: number) {
  switch (resultType) {
    case 'SUCCESS':
      return { retry: false };
    case 'FAIL':
      return { retry: false }; // Handle via error code
    case 'HTTP_TIMEOUT':
    case 'NETWORK_ERROR':
    case 'EXECUTION_FAIL':
    case 'INTERRUPTED':
    case 'INTERNAL_ERROR':
      return { retry: retryCount < 3, delay: Math.min(500 * 2 ** retryCount, 4000) };
    default:
      return { retry: false };
  }
}
```

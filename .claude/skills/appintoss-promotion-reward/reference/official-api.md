# Official Toss Promotion API Reference

Source of truth from AppsInToss Developer Center documentation. All content verified against official docs as of 2026-03-02.

## Contents
- [API Base URL](#api-base-url)
- [API 1: Get Promotion Key (getKey)](#api-1-get-promotion-key)
- [API 2: Execute Promotion (executePromotion)](#api-2-execute-promotion)
- [API 3: Get Execution Result (getExecutionResult)](#api-3-get-execution-result)
- [Response ResultType Values](#response-resulttype-values)
- [Error Codes](#error-codes)
- [Console Guide](#console-guide)
- [Promotion Types (Allowed / Prohibited)](#promotion-types)
- [Registration Fields](#registration-fields)
- [Performance Dashboard](#performance-dashboard)
- [Mandatory User Disclosure](#mandatory-user-disclosure)
- [Pre-Launch Checklist](#pre-launch-checklist)
- [Naming Restrictions](#naming-restrictions)
- [Budget and Limits](#budget-and-limits)
- [FAQ](#faq)

---

## API Base URL

```
https://apps-in-toss-api.toss.im
```

All API calls require mTLS (mutual TLS) client certificates.

---

## API 1: Get Promotion Key

Generates a key for issuing promotion rewards. Key is valid for **1 hour**.

- **Method:** POST
- **URL:** `/api-partner/v1/apps-in-toss/promotion/execute-promotion/get-key`
- **Content-Type:** `application/json`

### Request Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `x-toss-user-key` | string | Y | userKey from Toss Login |

### Response

```json
{
  "resultType": "SUCCESS",
  "success": {
    "key": "3oBpxjUgl5r66edcVi7ynHGIjhzr9KOka6FfEKikev0="
  }
}
```

### Key Constraints
- Valid for **1 hour** from issuance
- Using an already-used key returns error **4113**
- The partner controls grant frequency — Toss does not enforce "1 key = 1 grant" automatically
- To allow only 1 grant per key, the partner must track this independently

---

## API 2: Execute Promotion

Execute the promotion reward grant. Budget is deducted at call time; actual issuance may have slight delay.

- **Method:** POST
- **URL:** `/api-partner/v1/apps-in-toss/promotion/execute-promotion`
- **Content-Type:** `application/json`

### Request Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `x-toss-user-key` | string | Y | userKey from Toss Login |

### Request Body

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `promotionCode` | String | Y | Promotion code from console |
| `key` | String | Y | Key from getKey API |
| `amount` | Integer | Y | Points to grant |

```json
{
  "promotionCode": "01JPPJ6SB66BQXXDAKRQZ6SZD7",
  "key": "3oBpxjUgl5r66edcVi7ynHGIjhzr9KOka6FfEKikev0=",
  "amount": 10
}
```

### Response

```json
{
  "resultType": "SUCCESS",
  "success": {
    "key": "3oBpxjUgl5r66edcVi7ynHGIjhzr9KOka6FfEKikev0="
  }
}
```

---

## API 3: Get Execution Result

Query the promotion grant status. May return PENDING — **poll until SUCCESS or FAILED**.

- **Method:** POST
- **URL:** `/api-partner/v1/apps-in-toss/promotion/execution-result`
- **Content-Type:** `application/json`

### Request Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `x-toss-user-key` | string | Y | userKey from Toss Login |

### Request Body

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `promotionCode` | String | Y | Promotion code from console |
| `key` | String | Y | Key from getKey/executePromotion |

### Response

```json
{
  "resultType": "SUCCESS",
  "success": "PENDING"
}
```

Possible `success` values: `SUCCESS`, `PENDING`, `FAILED`

### Polling Strategy
- Poll up to **10 times** with **500ms intervals**
- If still PENDING after all attempts, return pending status to client
- Client can retry or show "points will arrive shortly" message

---

## Response ResultType Values

All three APIs return a top-level `resultType` field. Possible values:

| resultType | Description |
|------------|-------------|
| `SUCCESS` | Request succeeded |
| `FAIL` | Business logic error (see `error.code` for details) |
| `HTTP_TIMEOUT` | HTTP request timed out |
| `NETWORK_ERROR` | Network-level failure |
| `EXECUTION_FAIL` | Execution failed internally |
| `INTERRUPTED` | Request was interrupted |
| `INTERNAL_ERROR` | Toss internal server error |

When `resultType` is `FAIL`, the response includes:
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

| Code | Message | Cause | Resolution |
|------|---------|-------|------------|
| `4100` | 프로모션 정보를 찾을 수 없어요 | Unregistered promotion code | Verify code in console |
| `4109` | 프로모션이 실행중이 아니에요 | Not started, or budget exhausted | Start promotion or increase budget |
| `4110` | 리워드를 지급/회수할 수 없어요 | Internal system error | **Apply retry logic** (up to 2-3 retries) |
| `4111` | 리워드 지급내역을 찾을 수 없어요 | Queried non-existent record | Check promotion code and key |
| `4112` | 프로모션 머니가 부족해요 | Budget depleted | Increase budget or top up Biz Wallet |
| `4113` | 이미 지급/회수된 내역이에요 | Duplicate grant with same key | Issue a new key via getKey |
| `4114` | 1회 지급 금액을 초과했어요 | Amount too large for one grant | Reduce amount per call |
| `4116` | 최대 지급 금액이 예산을 초과했어요 | Total would exceed remaining budget | Reduce amount or increase budget |

### Error 4109 Special Handling
- Email alert sent when **80% of budget** consumed
- Budget exhaustion = auto-termination + removal from Benefits Tab
- **Must** monitor budget and top up proactively

### Error 4110 Retry Logic
This is a transient internal error. Implement automatic retry:
- Retry up to 2-3 times with brief delay (200-500ms)
- If still failing, return error to client with retry option

---

## Console Guide

### Registration Flow
1. Register business info (1-2 business days for review)
2. Register settlement info (2-3 business days for review)
   - 예금주명 must match 통장 사본 exactly
   - 업태/업종: enter as text, not code numbers
3. Charge Biz Wallet (min 300K KRW, max 30M KRW)
   - Credit card payment (인증/비인증)
   - 하나카드 비인증: daily limit 1M KRW
4. Integrate Toss Login
5. Register promotion in console
6. Submit for review (2-3 business days)
7. Test with TEST_ prefixed codes (**minimum 1 successful API test required**)
8. Start promotion

---

## Promotion Types

### Allowed Types (all max 5,000 points per person)

- **Sign-up/access rewards**: e.g., 2,000 points for new sign-up
- **Transaction/purchase incentives**: clear conditions required (e.g., 500 points for 5,000 KRW+ purchase)
  - Once granted, Toss Points cannot be revoked — design conditions carefully
- **Event participation**: surveys, quizzes, simple missions (no excessive time/labor)
- **Friend referral**: both inviter and invitee rewarded; anti-abuse logic required
- **Non-game random/probability rewards**: promotional period must be **within 1 week**, for new user acquisition only. Not allowed if registered as non-game but classified as game content.

### Prohibited Types

- Game app probability/random rewards (roulette, gacha)
- Game result-based rewards (score, rank, win/loss)
- Asset-to-points conversion (gift cards → Toss Points)
- Guaranteed cash / Ponzi-like schemes
- Over 5,000 points per person (lottery exceptions require separate review)

---

## Registration Fields

1. **Promotion Name**: Describe the condition (e.g., "서비스 로그인 시 10포인트 지급")
2. **End Date**: May end early if budget exhausted
3. **Benefits Tab Exposure**:
   - Exposed: shown in Toss Benefits (혜택 → 새로운 서비스 써보고)
   - Not Exposed: direct access only
   - **CANNOT change from "not exposed" to "exposed"** after registration — must create new promotion
4. **Mission Name** (if Benefits Tab exposed): Must end in "~하기", max 12 characters
5. **Reward Method**: Fixed amount or maximum amount (random within range)
6. **Navigation URL** (if Benefits Tab exposed): `intoss://{{appName}}/ScreenName`
7. **Budget**: Cannot exceed Biz Wallet balance. Can increase later via promotion modification.

---

## Performance Dashboard

Available for Benefits Tab exposed promotions only. Access: Console → Workspace → Mini-app → Promotion → 성과 tab.

### Metrics

**Final Conversion Rate (Funnel)**:
1. **혜택탭 진입**: Users who saw the promotion in Benefits Tab
2. **프로모션 클릭**: Users who clicked to enter detail screen
3. **포인트 획득**: Users who completed the condition and received points

**User Segments**:
- **신규 유저**: First-time mini-app users via promotion
- **기존 유저**: Returning users

**Revenue Attribution** (requires TossPay integration):
- 총 기여 매출 (total revenue from promo users)
- 결제자 기준 1인당 평균 매출
- 전체 유저 기준 1인당 평균 매출
- Note: Revenue is per-workspace (business number), not per-mini-app

### Query Options
- Daily / Weekly / Monthly granularity
- OS-specific breakdown
- Per-promotion or all-promotions view

---

## Mandatory User Disclosure

Must display to users before participation:

- 지급 시점 (e.g., 즉시 지급, 익일 18시 지급)
- 지급 조건 (e.g., 최초 결제, 5,000원 이상 결제)
- 지급 제한 (탈퇴/환불/부정 참여 시 지급 불가)
- **"본 프로모션은 사전 고지 없이 중단될 수 있습니다"**
- Random rewards not allowed (fixed amount only)

---

## Pre-Launch Checklist

All items must be satisfied before starting promotion:

- [ ] 제공되는 포인트가 **1인당 5천 포인트 이하**인가요?
- [ ] 지급 조건, 지급 시점, 지급 제한 사항 등을 명확히 고지했나요?
- [ ] 참여 방식이 단순하고 과도한 시간/노동 요구는 없나요?
- [ ] (게임의 경우) 룰렛/뽑기 등 확률형 요소와 결합되지 않았나요?
- [ ] 게임 결과/등수 기반으로 포인트가 산정되지 않나요?
- [ ] 유저 보유 재화를 토스포인트로 교환/전환하는 형태가 아닌가요?
- [ ] 조기 종료/중단 가능성을 사전 고지했나요?
- [ ] 중복 참여 방지 로직을 적용했나요?
- [ ] 사행성 또는 과장된 프로모션이 아닌가요?

---

## Naming Restrictions

- **"포인트"**: Cannot use for in-app custom rewards — users confuse with Toss Points. Use clearly distinguishable terms.
- **"출금"/"인출"**: Cannot use terms implying cash conversion.
- Use **"토스 포인트 지급"** when virtual assets convert to Toss Points.

---

## Budget and Limits

| Constraint | Value |
|-----------|-------|
| Max points per person (all promotions) | 5,000 |
| Biz Wallet min charge | 300,000 KRW |
| Biz Wallet max charge | 30,000,000 KRW |
| Key validity | 1 hour |
| Test code prefix | `TEST_` |
| Budget alert email | At 80% consumption |
| Benefits Tab mission name | Max 12 chars, ends in "~하기" |
| Promotion review period | 2-3 business days |
| Non-game random promo max period | 1 week |

---

## FAQ

**Q: 1인당 최대 5,000포인트 미만만 지급 가능한가요?**
A: 맞습니다. 가입/거래/이벤트/친구 초대 등 모든 프로모션 유형에 동일 적용됩니다.

**Q: 게임 앱에서 확률형(룰렛/뽑기) 보상을 줄 수 있나요?**
A: 불가합니다. 사행행위로 해석될 위험이 있어 고정형 지급만 허용됩니다.

**Q: 게임 결과 기반 보상은 가능한가요?**
A: 불가합니다. 게임 결과와 무관한 조건(가입, 로그인, 튜토리얼 완료 등)으로만 가능합니다.

**Q: 유저가 보유한 재화를 토스포인트로 교환해줄 수 있나요?**
A: 불가합니다. 자금 세탁 우려로 앱 내 특정 행동(가입, 결제, 이벤트 참여) 기반으로만 지급해야 합니다.

**Q: 지급 시점은 자유롭게 정할 수 있나요?**
A: 자체적으로 판단하되, 유저에게 반드시 사전 고지해야 합니다. (예: "즉시 지급" / "익일 18시까지 지급")

**Q: 프로모션을 갑자기 중단해도 되나요?**
A: 예산 초과 외에는 중단을 권장하지 않습니다. 반드시 "사전 고지 없이 중단될 수 있습니다" 문구를 포함하세요.

**Q: 친구 초대 프로모션 조건은?**
A: 초대한 사람과 초대받은 사람 모두 동일 보상, 중복 참여/어뷰징 방지 로직 필수, 1인당 최대 5천 포인트 동일 적용.

**Q: 현금 보장형 프로모션은 가능한가요?**
A: 불가합니다. 유사수신행위/사행성 행위로 법 위반 소지가 있으며, 반드시 토스 포인트 형태로만 지급해야 합니다.

### Settlement & Operations Principles
- Promotion budget is set from Biz Wallet; auto-terminates on budget exhaustion
- Remaining budget returns to Biz Wallet on promotion end
- Anti-abuse/duplicate participation logic is mandatory
- Claims must be handled by the partner based on participation records

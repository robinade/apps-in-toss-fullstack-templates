---
name: appintoss-promotion-reward
description: Implements Toss Points promotion reward system for AppsInToss mini-apps. Guides through the complete flow from console setup to production deployment, including interactive onboarding interview, test code activation via terminal, 3-step server API (getKey, executePromotion, getExecutionResult), mTLS setup, round-robin promotion code distribution, rewarded ad integration, and Vercel deployment. Use PROACTIVELY when the user mentions Toss promotion, Toss Points grant, rewarded ads with point rewards, promotion codes, Biz Wallet, executePromotion, getKey, getExecutionResult, point/reward systems in AppsInToss mini-apps, 프로모션, 토스포인트, 포인트 지급, 보상형 광고, 비즈월렛, 리워드, or grantPromotionRewardForGame.
---

# AppsInToss Promotion Reward System

Guides implementation of the Toss Points promotion reward system for AppsInToss mini-apps. Covers everything from console setup to production deployment, with an interactive onboarding flow for first-time implementers.

## Contents
- [Phase 0: Interactive Setup Interview](#phase-0-interactive-setup-interview)
- [Phase 1: Prerequisites Check](#phase-1-prerequisites-check)
- [Phase 2: Test Promotion Code Activation](#phase-2-test-promotion-code-activation)
- [Phase 3: Server Implementation](#phase-3-server-implementation)
- [Phase 4: Client Implementation](#phase-4-client-implementation)
- [Phase 5: Environment & Deployment](#phase-5-environment--deployment)
- [Phase 6: QA Verification](#phase-6-qa-verification)
- [Naming Restrictions & Mandatory Disclosure](#naming-restrictions--mandatory-disclosure)

## Architecture Overview

The promotion system grants real Toss Points to users after specific actions (typically watching rewarded ads). The flow differs by app type:

- **Game apps**: Use SDK function `grantPromotionRewardForGame` — no server required
- **Non-game apps**: Server-side 3-step mTLS API sequence: `getKey → executePromotion → getExecutionResult`

For non-game apps, multiple promotion codes are stored comma-separated in environment variables and distributed via round-robin with automatic failover when a code's budget is exhausted.

---

## Phase 0: Interactive Setup Interview

Before writing any code, gather required information through AskUserQuestion. First-time implementers do not know what they need — guide them step by step.

### Q0: App Type (MUST ask first)

```
"Is your mini-app a game or non-game app? This determines the entire
implementation approach."
Options: [Game app] [Non-game app]
```

**If Game**: Read [reference/game-sdk.md](reference/game-sdk.md) and follow the SDK-based approach. The rest of this guide is for non-game apps.

**If Non-game**: Continue with Q1 below.

### Q1: Toss Login Integration
```
"Have you implemented Toss Login in your mini-app? The promotion API
requires x-toss-user-key header from Toss Login to identify users.
Without this, promotion rewards cannot be granted."
Options: [Yes, already implemented] [No, need to implement first]
```
If No → Direct to Toss Login docs first. Promotion requires user identification.

### Q2: mTLS Certificates
```
"Do you have mTLS client certificates for the Toss API? The promotion
API requires mutual TLS (server-to-server). You need a .pem certificate
and private key issued by Toss."
Options: [Yes, I have cert + key files] [Yes, as Base64 env vars] [No, need to obtain]
```
If No → Guide to request mTLS certs from Toss partner support.

### Q3: Promotion Codes
```
"Have you registered promotions in the AppsInToss Console and received
promotion codes? Each promotion gets a unique code like
'01JPPJ6SB66BQXXDAKRQZ6SZD7'."
Options: [Yes, I have codes] [No, need to register]
```
If No → Guide through console registration. See [reference/official-api.md](reference/official-api.md), Console Guide section.

### Q4: Test Promotion Codes
```
"Do you have TEST_ prefixed test promotion codes? Each promotion code has
a matching test code (e.g., code '01KH...' → test code 'TEST_01KH...').
You can find them in the AppsInToss Console by clicking the 'Test' button
on each promotion. Please provide ALL your test codes."
Options: [Yes, I have test codes] [No / Don't know where to find them]
```
If No → Guide: "Go to AppsInToss Console → Your promotion → Click 'Test' button → Copy the TEST_ prefixed code shown."

Collect all test codes from the user. These are needed for Phase 2 activation.

### Q5: Number of Promotion Codes & Distribution Strategy
```
"How many promotion codes will you use? If multiple, codes are distributed
via round-robin to spread budget usage evenly. Codes are stored
comma-separated in a single environment variable
(e.g., TOSS_PROMOTION_CODES=CODE1,CODE2,CODE3)."
Options: [Single code] [Multiple codes with round-robin]
```

### Q6: Reward Trigger Mechanism
```
"What action triggers the point reward?"
Options: [Rewarded ad watch] [Task completion] [Sign-up/first use] [Custom event]
```

### Q7: Database / User Management
```
"How do you manage user data? We need to track point balances, daily
limits, and prevent duplicate grants."
Options: [Supabase] [Other database] [Need to set up]
```

### Q8: Deployment Platform
```
"Where will you deploy the server? Promotion codes and mTLS certs are
stored as environment variables."
Options: [Vercel] [Other platform]
```

### Q9: Grant Amount
```
"How many Toss Points per reward event? (Max 5,000 points per person
total across all promotions)"
```

---

## Phase 1: Prerequisites Check

Before any API integration, verify these are complete:

1. **Business registration** approved in AppsInToss Console (~1-2 business days)
2. **Settlement info** reviewed and approved (~2-3 business days)
3. **Biz Wallet charged** (min 300,000 KRW, max 30,000,000 KRW)
4. **Toss Login integrated** (provides `userKey` for API calls)
5. **mTLS certificates** obtained (`.pem` cert + private key)
6. **Promotion registered** in console and **review approved** (~2-3 business days)

For detailed console procedures, see [reference/official-api.md](reference/official-api.md).

---

## Phase 2: Test Promotion Code Activation

After Phase 0 interview completes, proceed to this phase IMMEDIATELY. Do not analyze the codebase, plan modifications, or propose implementation changes yet. Test code activation is a prerequisite that must succeed before any other work — Toss requires at least 1 successful test API call for promotion review approval.

### How Test Codes Work
- Test codes have `TEST_` prefix: e.g., `TEST_01KHXFH8DYGH5R146ZATFDTNWJ`
- No real points deducted, no real points issued
- Must confirm `resultType: SUCCESS` response at each step
- Each test code must be activated separately

### Step 1: Get a test user's tossUserKey

If using Supabase, use **Supabase MCP** `execute_sql` tool. Ask the user for their users table name first:

```
AskUserQuestion: "What is the name of your users table in Supabase?
(e.g., users, puzzle_users, app_users)"
```

Then query:
```sql
SELECT toss_user_key FROM {table_name} WHERE toss_user_key IS NOT NULL LIMIT 1;
```

If no users exist yet, the user needs to open the mini-app in Toss and complete login first.

### Step 2: Run the 3-step API test

Use a **Node.js script** (works on Windows, Mac, and Linux). Do not use `curl` — on Windows, the default curl uses Schannel which does not support PEM certificate files and will fail with exit code 58.

Write and run a temporary Node.js test script using `npx tsx`. See [reference/setup-and-testing.md](reference/setup-and-testing.md) for the complete cross-platform test script.

Key points for the test script:
- Use `import.meta.url` for path resolution (not `__dirname` — fails in ES modules)
- Use Node.js `https.Agent` with `cert` and `key` from `fs.readFileSync`
- Certificate files can be `.pem`, `.crt`, or `.key` — Node.js handles all formats
- Run each test code through the full 3-step flow: `getKey → executePromotion → getExecutionResult`
- Confirm `resultType: SUCCESS` at every step

If ALL test codes return `SUCCESS` at each step, test activation is complete. Only then proceed to Phase 3.

---

## Phase 3: Server Implementation

The proven implementation pattern from a production non-game mini-app. See [reference/implementation-patterns.md](reference/implementation-patterns.md) for complete code.

### Core Components

**1. mTLS Client** (`tlsClient.ts`)
- `TLSClient` class with connection pooling (keepAlive, maxSockets: 10)
- Load certs from Base64 env vars (cloud) or file paths (local dev)
- Retry with exponential backoff for ECONNRESET/socket hangup and error 4110

**2. Promotion Service** (`promotionService.ts`)
- Round-robin promotion code selection from comma-separated env var
- 3-step Toss API flow: `getKey → executePromotion → getExecutionResult`
- Result polling (up to 10 attempts, 500ms intervals)
- Failover: if code budget exhausted (4109/4112), try next code
- Per-code retry (up to 2 attempts for error 4110)
- 5-minute idempotency cache to prevent duplicate requests
- Ad token generation/verification with HMAC signature

**3. API Routes** (`routes/promotion.ts`)
- JWT auth middleware on all endpoints
- `POST /ad-token` — Issue signed ad completion token
- `POST /grant` — Grant Toss Points (requires valid ad token)
- `POST /earn` — Earn internal points (habit-check, ad-watch, streak-bonus, milestone-reward)
- `GET /balance` — Get point balance
- `POST /withdraw` — Withdraw points via Toss 3-step API
- `POST /lottery-grant` — Server-side lottery draw + grant

### Key Design Decisions

**Round-Robin with Failover**: Distribute API calls evenly across codes; auto-skip exhausted codes.

**Ad Token Security**: Server generates a signed, time-limited token (`{timestamp}.{userKeyHash}.{signature}`) when ad completion is reported. Prevents point grants without watching ads.

**Idempotency**: In-memory cache with 5-min TTL keyed on `userId:amount:idempotencyKey`.

---

## Phase 4: Client Implementation

### Rewarded Ad Flow (typical pattern)

```
User watches rewarded ad
  → SDK fires userEarnedReward event
  → Client calls POST /api/promotion/ad-token
  → Client calls POST /api/promotion/grant (amount + adToken)
    → Server verifies JWT + adToken
    → Server calls 3-step Toss API
    → Returns success + amount
  → Client shows success toast & updates state
```

### Key Patterns

**Ad Load Manager (Singleton):** Only one ad can load at a time (SDK constraint). Serialize all ad operations with a priority queue. Uses IntegratedAd v2 API (`@apps-in-toss/web-framework`).

**Rewarded Ad Hook:** Load ad → wait for `userEarnedReward` → request adToken → grant reward → show toast → reload next ad.

**Daily Limits:** Track ad watches per day client-side for UX, enforce server-side (configurable max per user per day).

For complete client patterns, see [reference/implementation-patterns.md](reference/implementation-patterns.md).

---

## Phase 5: Environment & Deployment

### Vercel Environment Variables

```
# Toss API
TOSS_API_BASE_URL=https://apps-in-toss-api.toss.im
TOSS_PROMOTION_CODES=CODE1,CODE2,CODE3

# mTLS (Base64-encoded for cloud)
MTLS_CERT_BASE64=<base64-encoded-cert>
MTLS_KEY_BASE64=<base64-encoded-key>

# Security
AD_TOKEN_SECRET=<random-secret>
JWT_SECRET=<random-secret>

# Database
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### Base64 Encoding Certs for Cloud

```bash
# Mac/Linux
base64 -w 0 < cert.pem > cert_b64.txt

# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("cert.pem")) > cert_b64.txt
```

### Multiple Promotion Codes Setup

Store comma-separated: `TOSS_PROMOTION_CODES=CODE1,CODE2,CODE3`

The round-robin selector distributes calls evenly. When one code's budget runs out (error 4109/4112), the system automatically tries the next code.

For detailed setup steps, see [reference/setup-and-testing.md](reference/setup-and-testing.md).

---

## Phase 6: QA Verification

Complete QA checklist before going live. See [reference/qa-checklist.md](reference/qa-checklist.md) for the full official checklist.

### Must-Pass Items

- [ ] 3-step API: get-key → execute-promotion → execution-result returns `SUCCESS`
- [ ] Duplicate prevention: rapid clicks produce only 1 grant
- [ ] Budget exhaustion: failover to next code, or graceful error message
- [ ] Error 4110 retry: auto-retry on transient errors
- [ ] Key expiry: keys expire after 1 hour, system gets fresh key
- [ ] Daily limit enforced: no more than configured max per user per day
- [ ] Ad token required: grants rejected without valid ad token
- [ ] Concurrency: multi-tab/multi-click only processes 1 valid request
- [ ] Logging: userKey, promotionCode, amount, status all logged for reconciliation

---

## Naming Restrictions & Mandatory Disclosure

### Naming Restrictions
To avoid confusion with Toss terminology:
- **"포인트"**: Cannot use for in-app custom rewards — users confuse with Toss Points
- **"출금"/"인출"**: Cannot use terms implying cash conversion
- Use **"토스 포인트 지급"** when virtual assets convert to Toss Points

### Mandatory User Disclosure
Must display to users before participation:
- Grant timing (immediate, delayed, etc.)
- Grant conditions
- Restrictions (deleted accounts, refunds, fraud ineligible)
- **"본 프로모션은 사전 고지 없이 중단될 수 있습니다"**
- Non-game apps with random/probability rewards: promotion period must be **within 1 week**

---

## Reference Files

- **[reference/official-api.md](reference/official-api.md)** — Complete Toss API specs, console guide, error codes, dashboard, FAQ, pre-launch checklist
- **[reference/implementation-patterns.md](reference/implementation-patterns.md)** — Production-proven code patterns (mTLS, promotion service, client hooks, DB schema)
- **[reference/setup-and-testing.md](reference/setup-and-testing.md)** — mTLS setup, test code activation, Supabase MCP queries, terminal scripts
- **[reference/qa-checklist.md](reference/qa-checklist.md)** — Official QA checklist with pass/fail criteria
- **[reference/error-codes.md](reference/error-codes.md)** — Complete error code reference with resolution steps
- **[reference/game-sdk.md](reference/game-sdk.md)** — Game app SDK approach (grantPromotionRewardForGame)

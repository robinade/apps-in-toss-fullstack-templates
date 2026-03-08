# QA Checklist

Official QA requirements from AppsInToss documentation. All items must pass before going live.

Source: https://developers-apps-in-toss.toss.im/promotion/qa.html

---

## Pre-Check (사전체크)

| # | Category | Test Case | Expected Result |
|---|----------|-----------|-----------------|
| 1 | Business registration | Business info approved in console | Status shows "승인" |
| 2 | Settlement info | Settlement info reviewed and approved | Status shows "승인" |
| 3 | Biz Wallet | Balance >= promotion budget amount | Sufficient balance confirmed |
| 4 | Promotion review | Promotion registered and review approved | Status shows "운영중" or ready to start |
| 5 | mTLS certificates | Client cert + key configured correctly | API calls succeed without TLS errors |
| 6 | Test account | Have a valid `x-toss-user-key` for testing | Key retrieved from database |

---

## Normal Grant Flow (정상 지급 플로우)

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 7 | Call get-key API | `resultType: SUCCESS`, receive valid key |
| 8 | Call execute-promotion with key + promotionCode + amount | `resultType: SUCCESS` |
| 9 | Call execution-result (polling) | `success: SUCCESS` within 10 polls |
| 10 | Full 3-step flow end-to-end | All 3 steps return SUCCESS |
| 11 | Verify user received points | Toss app shows point notification |
| 12 | Check amount matches request | Granted amount equals requested amount |

---

## Benefits Tab Exposure (혜택탭 노출)

Only applicable if promotion is set to "혜택탭 노출".

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 13 | Mission name format | Within 12 characters, ends in "~하기" |
| 14 | Grant amount displayed correctly | Matches configured reward amount |
| 15 | Navigation URL opens mini-app | `intoss://{{appName}}/ScreenName` works correctly |
| 16 | Budget exhausted behavior | Promotion auto-removed from Benefits Tab |

---

## Duplicate Grant Prevention (중복 지급 방지)

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 17 | Click grant button rapidly 5+ times | Only 1 grant succeeds |
| 18 | Refresh page during grant processing | No duplicate grant |
| 19 | Same idempotency key submitted twice | Second call returns cached result, no duplicate |
| 20 | Multi-tab simultaneous grant requests | Only 1 valid request processed |

---

## KEY Validity (KEY 유효시간)

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 21 | Use key within 1-hour validity window | Grant succeeds normally |
| 22 | Use key after 1-hour expiry | Error returned, system gets fresh key automatically |
| 23 | Reuse already-used key (error 4113) | Error 4113, system issues new key and retries |

---

## User Identification Header (사용자 식별 헤더)

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 24 | Valid `x-toss-user-key` in header | API calls succeed |
| 25 | Missing `x-toss-user-key` header | Auth error, user prompted to log in |
| 26 | Invalid/expired `x-toss-user-key` | Failure handled gracefully, re-login prompt |

---

## Budget Exhaustion (예산 소진)

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 27 | Single code budget exhausted (error 4109) | Failover to next code in round-robin |
| 28 | Insufficient promotion funds (error 4112) | Try next code, or clear error message |
| 29 | All promotion codes exhausted | User sees "일시적으로 이용 불가" message |
| 30 | 80% budget consumption alert | Email alert received (verify with ops team) |

---

## End Date (종료일 경과)

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 31 | Promotion within valid date range | Grants succeed normally |
| 32 | Promotion past end date | Grants blocked, end notice shown to user |
| 33 | Budget exhausted before end date | Auto-termination, remaining budget returns to Biz Wallet |

---

## Limit Policies (한도 정책)

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 34 | Daily limit reached per user | User informed, grants blocked for today |
| 35 | Per-person total limit (max 5,000 points) | No more than 5,000 points total per user |
| 36 | Single grant amount limit exceeded | Error 4114 returned |
| 37 | Max grant amount exceeds remaining budget | Error 4116 returned |

---

## Code/Key Errors (코드/KEY 오류)

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 38 | Invalid promotionCode (error 4100) | Clear error message, no crash |
| 39 | Tampered or corrupted key value | Failure handled gracefully |
| 40 | Wrong promotionCode + key combination (error 4111) | Error message, no system failure |

---

## Network/Timeout (네트워크/타임아웃)

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 41 | Network timeout during API call | Retry with backoff, no duplicate grants |
| 42 | ECONNRESET / socket hangup | Auto-retry (TLSClient handles), transparent to user |
| 43 | DNS resolution failure | User sees connection error, retry option |

---

## Server Error Recovery (서버 장애 대응)

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 44 | Error 4110 (transient internal error) | Auto-retry up to 2-3 times with 200-500ms delay |
| 45 | Toss API 5xx response | Safe user notice + auto-retry or "잠시 후 다시 시도" |
| 46 | Repeated 4110 after all retries | Return error to client with retry option |

---

## Logging & Reconciliation (로깅/대사)

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 47 | All required fields logged | userKey, promotionCode, amount, key, status recorded |
| 48 | Success transactions logged | Can match Toss records with internal logs |
| 49 | Failed transactions logged | Error code, message, retry count all recorded |
| 50 | Reconciliation report feasible | Internal data sufficient to reconcile with Toss |

---

## Concurrency Control (동시성 제어)

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 51 | Multiple users grant simultaneously | Each user processed independently |
| 52 | Same user concurrent requests | Only 1 valid request processed (idempotency) |
| 53 | Server under high load | Connection pooling handles load, no socket exhaustion |

---

## User Disclosure (사용자 고지사항)

Must display all mandatory disclosures to users before participation.

| # | Mandatory Copy | Present? |
|---|----------------|----------|
| 54 | 지급 시점 (e.g., 즉시 지급, 익일 18시 지급) | Yes |
| 55 | 지급 조건 (e.g., 최초 결제, 5,000원 이상 결제) | Yes |
| 56 | 지급 제한 (탈퇴/환불/부정 참여 시 지급 불가) | Yes |
| 57 | "본 프로모션은 사전 고지 없이 중단될 수 있습니다" | Yes |

---

## Ad Token Security (보상형 광고 보안)

Only applicable if using rewarded ads as the grant trigger.

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 58 | Request without JWT | 401 Unauthorized |
| 59 | Request without ad token | 403 Forbidden |
| 60 | Expired ad token (> 5 min) | 403, user prompted to watch ad again |
| 61 | Replayed ad token (already consumed) | Rejected, token marked as consumed in DB |

---

## Testing Workflow

1. Run **all tests** with `TEST_` prefixed promotion codes first (no real points deducted/issued)
2. Verify `resultType: SUCCESS` on every successful test
3. Must have **minimum 1 successful test API call** for promotion review approval
4. Switch to real promotion codes
5. Run critical path tests (items 7-12) with real codes
6. Monitor first 10 real grants in production for any issues
7. Verify 80% budget alert email is configured and received

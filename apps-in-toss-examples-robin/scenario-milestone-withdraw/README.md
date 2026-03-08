# scenario-milestone-withdraw

> 마일스톤 + 포인트 출금 — 출석 마일스톤 달성 후 포인트 출금

## 사용된 SDK API
- `executePromotion()` — 프로모션 리워드 (출금)
  - 공식 문서: https://developers-apps-in-toss.toss.im/api/executePromotion.html
- `getOperationalEnvironment()` — 환경 감지

## 서버 API
- `GET /api/milestones/status` — 마일스톤 현황
- `POST /api/milestones/claim` — 마일스톤 보상 수령
- `GET /api/balance` — 포인트 잔고
- `POST /api/withdraw` — 포인트 출금 (최소 10P)

## 마일스톤 정의
| 마일스톤 | 필요 일수 | 보상 |
|----------|----------|------|
| 3일 출석 | 3일 | 5P |
| 7일 출석 | 7일 | 15P |
| 14일 출석 | 14일 | 30P |
| 21일 출석 | 21일 | 50P |
| 28일 출석 | 28일 | 100P |

## 실행
```bash
npm run install:all
npm run dev
```

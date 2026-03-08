# scenario-lottery-reward

> 복권 뽑기 + 리워드 — 광고 시청으로 기회를 얻고 복권을 뽑아 포인트 획득

## 사용된 SDK API
- `loadFullScreenAd()` / `showFullScreenAd()` — 보상형 광고
  - 공식 문서: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/광고/loadAppsInTossAdMob.html
- `executePromotion()` — 프로모션 리워드 지급
  - 공식 문서: https://developers-apps-in-toss.toss.im/api/executePromotion.html

## 서버 API
- `GET /api/lottery/status` — 남은 기회 + 최근 결과
- `POST /api/lottery/watch-ad` — 광고 시청 → 기회 +1
- `POST /api/lottery/draw` — 복권 뽑기 (기회 -1)

## 당첨 확률
| 등급 | 이름 | 포인트 | 확률 |
|------|------|--------|------|
| 1등 | 대박! | 100P | 1% |
| 2등 | 럭키! | 50P | 5% |
| 3등 | 좋아요 | 10P | 20% |
| 4등 | 아깝다 | 1P | 40% |
| 꽝 | 다음에 | 0P | 34% |

## 실행
```bash
npm run install:all
npm run dev
```

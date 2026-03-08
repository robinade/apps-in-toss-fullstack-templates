# scenario-mission-system

> 미션 시스템 — 미션 수행 + 진행도 관리 + 보상 수령

## 사용된 SDK API
- `getOperationalEnvironment()` — 환경 감지
- `Storage` — 미션 진행 상태 (서버 대체)

## 서버 API
- `GET /api/missions/list` — 미션 목록 + 진행도
- `POST /api/missions/progress` — 미션 진행 업데이트
- `POST /api/missions/claim` — 보상 수령

## 실행
```bash
npm run install:all
npm run dev
```

## 데모 미션
1. 앱 방문하기 (1회) — 10P
2. 공유하기 (3회) — 30P
3. 출석하기 (5회) — 50P
4. 광고 보기 (2회) — 20P
5. 프로필 완성 (1회) — 15P

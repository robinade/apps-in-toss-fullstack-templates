# scenario-attendance-reward

> 출석 체크 + 보상형 광고 — 매일 광고를 시청하고 출석 체크하면 보상 획득

## 사용된 SDK API
- `loadFullScreenAd()` — 보상형 광고 로드
  - 공식 문서: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/광고/loadAppsInTossAdMob.html
- `showFullScreenAd()` — 보상형 광고 표시
  - 공식 문서: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/광고/showAppsInTossAdMob.html
- `getOperationalEnvironment()` — 환경 감지

## 서버 API
- `GET /api/attendance/status` — 출석 상태 조회
- `GET /api/attendance/history` — 달력용 출석 이력
- `POST /api/attendance/check-in` — 출석 체크 + 보상 지급

## 실행
```bash
npm run install:all
npm run dev
```

## 핵심 플로우
1. 출석 체크 버튼 → 광고 시청 모달
2. 광고 시청 완료 → 서버에 출석 기록
3. 연속 출석 보너스 (3일: +1, 7일: +3, 14일: +5, 28일: +10)
4. 캘린더 UI로 출석 이력 확인

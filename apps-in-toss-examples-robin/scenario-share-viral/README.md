# scenario-share-viral

> 공유 바이럴 리워드 — contactsViral API로 친구에게 공유하고 리워드 받기

## 사용된 SDK API
- `contactsViral()` — 친구 공유 모달
  - 공식 문서: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/친구초대/contactsViral.html
- `getOperationalEnvironment()` — 환경 감지

## 서버 API
- `GET /api/share/status` — 공유 현황 조회
- `POST /api/share/record` — 공유 기록 + 리워드 지급

## 실행
```bash
npm run install:all
npm run dev
```

## 핵심 플로우
1. 공유 버튼 → contactsViral 모달 (웹에서는 mock)
2. 친구 선택 → 공유 완료 이벤트
3. 서버에 공유 기록 + 기회 지급
4. 일일 제한 체크 (10회/일)

# scenario-onboarding-coach

> 온보딩 + 코치마크 — 사용자 온보딩 플로우와 UI 가이드 오버레이

## 사용된 SDK API
- `getOperationalEnvironment()` — 환경 감지
- `Storage` — 온보딩 완료 상태 저장 (서버 대체)

## 서버 API
- `GET /api/onboarding/status` — 온보딩 완료 여부
- `POST /api/onboarding/complete` — 온보딩 완료 처리
- `POST /api/onboarding/coach-marks-seen` — 코치마크 완료 처리

## 실행
```bash
npm run install:all
npm run dev
```

## 핵심 플로우
1. 앱 마운트 → 서버에서 온보딩 상태 확인
2. 미완료 → 3단계 온보딩 카드 (motion 애니메이션)
3. 완료 → 메인 뷰 + 코치마크 오버레이 시작
4. 코치마크 4개 UI 요소 하이라이트 안내
5. 완료 → 서버에 상태 저장

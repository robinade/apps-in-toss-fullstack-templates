# AppsInToss Fullscreen Ad QA Checklist

Based on official QA guide. Test on **real device** (sandbox does NOT support ads).

## Pre-check

- [ ] SDK version >= 1.6.0 in package.json
- [ ] Using test ad group IDs (NOT production IDs)
  - 보상형: `ait-ad-test-rewarded-id`
  - 전면형: `ait-ad-test-interstitial-id`

## Basic Integration

- [ ] 화면 진입 시 사전 로드(preload) 수행되는지 확인
- [ ] 광고 로드 완료 후 지연 없이 재생되는지 확인
- [ ] 광고 종료 시 미니앱 화면으로 정상 복귀하는지 확인
- [ ] 광고 재생 시 미니앱 배경음/효과음이 일시 정지되는지 확인
- [ ] 복귀 후 배경음/효과음이 정상 재개되는지 확인
- [ ] 광고 재생 도중 닫았을 때 예외 없이 복귀되는지 확인

## Rewarded Ad Specific

- [ ] 시청 완료(`userEarnedReward`) 이벤트에서만 보상 지급되는지 확인
- [ ] 중복 보상 방지 로직 동작 확인 (재요청/새로고침 등)

## Stability & Policy

- [ ] 광고 빈도 제한/쿨다운 적용 — 남용 방지
- [ ] 핵심 플로우(결제/가입/로그인) 중 광고 노출 없는지 확인
- [ ] 가로/세로 전환, 백그라운드 복귀 시 정상 동작
- [ ] 네트워크 실패 시 재시도/대체 흐름 동작
- [ ] 메모리/CPU 사용량 급증이나 앱 크래시 없는지 확인

## Logging & Settlement

- [ ] 광고 노출/완료/보상 지급 이벤트 로그 수집 확인
- [ ] 대시보드/정산과 식별자 일치 확인

## Before Production Launch

- [ ] 테스트 ID → 운영 ID로 교체
- [ ] 환경변수로 ID 관리 (하드코딩 금지)
- [ ] 광고 클릭 시 의도한 화면으로 이동 확인
- [ ] 뒤로 가기 정상 동작 확인

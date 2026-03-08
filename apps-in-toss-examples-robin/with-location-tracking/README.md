# with-location-tracking

실시간 위치 추적 (watch) 시작/중지 예제 — AppsInToss SDK 2.0.1

## SDK API

| API | 설명 |
|-----|------|
| `startUpdateLocation()` | 위치 변경 시 콜백 호출 (연속 추적), cleanup 함수 반환 |

## 주요 기능

- **추적 시작/중지** — 실시간 위치 업데이트 수신
- **경로 기록** — 최대 100개 포인트 저장, 최신순 표시
- **웹 폴백** — 브라우저 `navigator.geolocation.watchPosition` 사용
- **이벤트 로그** — 모든 위치 이벤트 기록

## 실행

```bash
cd with-location-tracking
npm install
npm run dev
```

## 파일 구조

```
src/
├── App.tsx                      # 메인 UI
├── hooks/useLocationTracking.ts # 위치 추적 훅
├── stores/eventLogStore.ts      # 이벤트 로그 (zustand)
├── components/DemoLayout.tsx    # 공통 레이아웃
└── lib/environment.ts           # 환경 감지
```

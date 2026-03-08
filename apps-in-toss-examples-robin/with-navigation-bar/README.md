# with-navigation-bar

AppsInToss SDK 2.0.1 - 네비게이션바 액세서리 버튼 예제

## SDK API

### `partner.addAccessoryButton(options)`
- 네비게이션바 우측에 액세서리 아이콘 버튼을 추가합니다.
- `options`: `{ id: string; title: string; icon: { name: string } }`
- 모노톤 아이콘만 지원, 한 번에 1개만 표시 가능

### `tdsEvent.addEventListener('navigationAccessoryEvent', handler)`
- 액세서리 버튼 클릭 이벤트를 수신합니다.
- `handler`: `{ onEvent: ({ id }) => void }`
- cleanup 함수를 반환합니다.

### `defineConfig` - `navigationBar.initialAccessoryButton`
- 초기 설정에서 액세서리 버튼을 미리 노출할 수 있습니다.

## Features

- 액세서리 아이콘 버튼 동적 추가 (partner.addAccessoryButton)
- 버튼 클릭 이벤트 수신 (tdsEvent.addEventListener)
- 아이콘 선택 UI (heart, star, setting)
- 웹 환경 폴백 (상태 시뮬레이션)
- 실시간 미리보기 UI
- 이벤트 로그 표시

## Run

```bash
npm install
npm run dev
```

## Structure

```
src/
├── App.tsx                  # 메인 데모 UI
├── hooks/
│   └── useNavigationBar.ts  # partner/tdsEvent SDK 훅
├── components/
│   └── DemoLayout.tsx       # 공통 레이아웃
├── lib/
│   ├── environment.ts       # 환경 감지
│   ├── sdk.ts               # SDK 유틸
│   └── utils.ts             # 공통 유틸
└── stores/
    └── eventLogStore.ts     # 이벤트 로그 상태
```

# with-locale

앱의 언어 및 지역 설정을 감지하고 다국어 UI를 제공하는 예제입니다.

## SDK API

- **`getLocale()`** — 현재 앱의 로케일 문자열을 반환합니다 (예: `'ko-KR'`). 동기 함수이며, 사용 불가 시 기본값 `'ko-KR'`을 반환합니다.

## 주요 기능

- **언어 감지**: 토스 앱 내에서는 SDK를 통해, 웹 브라우저에서는 `navigator.language`를 통해 현재 언어를 감지합니다.
- **다국어 문자열**: 감지된 언어에 따라 한국어(ko), 영어(en), 일본어(ja) 인사말을 자동 전환합니다.
- **이벤트 로그**: 언어 감지 과정을 실시간으로 확인할 수 있습니다.

## 실행 방법

```bash
cd with-locale
npm install
npm run dev
```

`http://localhost:5173`에서 확인할 수 있습니다.

## 파일 구조

```
src/
├── App.tsx              # 메인 앱 컴포넌트
├── hooks/
│   └── useLocale.ts     # 언어/지역 감지 훅
├── components/
│   └── DemoLayout.tsx   # 공통 레이아웃
├── lib/
│   └── environment.ts   # 환경 감지 유틸
└── stores/
    └── eventLogStore.ts # 이벤트 로그 상태
```

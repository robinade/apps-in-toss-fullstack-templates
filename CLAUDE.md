ㄱ# AppsInToss Fullstack Templates — Claude Code Instructions

> 이 프로젝트에서 코드를 작성할 때 **반드시** 따라야 하는 규칙이다.
> 앱인토스 비게임 미니앱 심사 반려를 예방하기 위한 개발 시점 강제 규칙이며, 위반 시 심사에서 반려된다.

## NEVER (절대 금지 — 위반 시 심사 반려)

### UI 금지사항

- NEVER use `alert()`, `confirm()`, `prompt()` — TDS Dialog, 커스텀 모달, 또는 shadcn-ui AlertDialog를 사용하라
- NEVER implement custom back button or 뒤로가기 UI — 공통 네비게이션바의 백버튼만 사용
- NEVER implement custom top header/app bar — 공통 네비게이션바가 유일한 상단 UI (자체 헤더 있으면 인앱 브라우저로 보여 반려)
- NEVER implement hamburger menu — 네비게이션바 커스텀 액세서리로 대체
- NEVER enable pinch zoom — `<meta name="viewport">` 에 `user-scalable=no` 필수
- NEVER use colored icons for navigation accessory buttons — 모노톤 아이콘만 허용
- NEVER add more than 1 accessory button to navigation bar
- NEVER allow unintended horizontal scroll on home screen
- NEVER create full-screen bottom sheets that block the close button

```typescript
// ❌ WRONG: 자체 헤더/백버튼
<header className="app-header"><button onClick={goBack}>←</button></header>

// ✅ CORRECT: 공통 네비게이션바만 사용 (granite.config.ts에서 설정)
navigationBar: {
  withBackButton: true,
  withHomeButton: true,
  initialAccessoryButton: {
    id: 'heart',
    title: 'Heart',
    icon: { name: 'icon-heart-mono' }, // 반드시 모노톤
  },
}
```

### 인증 금지사항

- NEVER call `appLogin()` on app start — 반드시 인트로/랜딩 화면을 먼저 보여준 후 로그인 진행
- NEVER implement custom 이용약관 UI — 토스 로그인 플로우 내 약관 동의 사용
- NEVER expose Toss OAuth tokens (AccessToken, RefreshToken) to client — 서버에서만 사용하고 앱 자체 JWT를 클라이언트에 발급

```typescript
// ❌ WRONG: 앱 시작 직후 로그인
function App() {
  useEffect(() => { appLogin(); }, []); // 반려!
}

// ✅ CORRECT: 인트로 화면 → 사용자 액션 → 로그인
function App() {
  return showIntro ? <IntroView onStart={handleLogin} /> : <MainView />;
}
```

### 외부 연결 금지사항

- NEVER navigate to external apps/browsers for core features — 미니앱 내에서 완결
- NEVER insert app install promotion (문구, 배너, 마켓 링크, 혜택 안내 모두 금지)
- NEVER link to external payment pages — 인앱결제 또는 앱인토스 전용 토스페이 사용
- NEVER use share links pointing to own website — `getTossShareLink()` 사용
- NEVER write app install inducing text (예: "앱을 설치하시면 더 많은 기능을...", "앱 다운로드하고 할인 받으세요")

허용되는 외부 링크: 법률 고지, 공공기관/제휴기관 공식 페이지, 타사 정보 확인 목적만 가능

### 텍스트 금지사항

- NEVER use 구독 오인 워딩 — 실제 구독이 아닌데 "구독", "정기결제" 등의 표현 사용 금지
- NEVER show mismatched payment amounts — UI 표시 금액과 실제 결제 금액이 반드시 일치

## ALWAYS (필수 준수)

### 네비게이션바 (모든 미니앱 필수)

- ALWAYS set `navigationBar: { withBackButton: true, withHomeButton: true }` in granite.config.ts
- ALWAYS ensure first screen(온보딩/랜딩) back button **exits** the mini-app (리프레시만 되면 반려)
- ALWAYS display app icon/logo in common navigation bar

### 브랜딩 통일 (필수)

- ALWAYS match app name **exactly** across ALL locations (공백 포함):
  - `granite.config.ts` → `brand.displayName`
  - `index.html` → `<title>`, `<meta property="og:title">`
  - 공유 메시지, 메타 태그, 앱 내 모든 노출 위치
  - 콘솔 정보등록
- ALWAYS use `brand.primaryColor` as 6-digit hex with `#` (예: `#3182F6`)
- ALWAYS use 한글 app name (토스 O, Toss X)
- ALWAYS use 600x600px 각진 정사각형 로고, 라이트/다크 모드 모두 가시적 배경

### 로그인 연동 해제 처리 (로그인 구현 시 필수)

- ALWAYS handle `appLogin` unlink callback → 로그아웃 처리
- ALWAYS implement re-login flow after unlink
- ALWAYS register callback URLs in console (referrer: UNLINK, WITHDRAWAL_TERMS, WITHDRAWAL_TOSS)
- ALWAYS use server-side token pattern: Toss OAuth tokens는 서버에서만, 클라이언트에는 앱 자체 JWT 발급

### 권한 요청 (카메라/위치 등 사용 시)

- ALWAYS use Toss permission bottom sheet (토스 권한 문서 기반 바텀싯)
- ALWAYS show only permissions that will actually be requested (미사용 권한 표시 시 반려)
- ALWAYS provide re-request or guidance when permission is denied

### 스킴/라우팅 (필수)

- ALWAYS ensure all registered 기능 스킴 URLs return valid pages (404 시 반려)
- ALWAYS verify 기능 스킴 랜딩 페이지 정상 렌더링

### UI 기능 완결성 (필수)

- ALWAYS reflect data immediately after user actions (좋아요/즐겨찾기 후 데이터 즉시 반영)
- ALWAYS show guidance when limited-use features are exhausted (횟수 소진 안내)
- ALWAYS ensure all feature buttons work correctly (이미지 저장, 재화 소모 등)
- ALWAYS avoid excessive blinking/animation on UI elements

### 핀치줌 비활성화 (필수)

```html
<!-- index.html에 반드시 포함 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

## CONDITIONAL (해당 기능 구현 시 필수)

### 결제 (인앱결제/토스페이)

- 결제 전: 상품 이름, 수량, 총 금액, 할인, 환불 규정 명확히 안내
- 결제 중: 앱 내 미디어(음악, 영상) 일시 정지
- 결제 후: 미디어 자동 재개
- 인앱결제: 소모성/비소모성 아이템 구분 정확히
- 토스페이: 앱인토스 전용 가맹점 키 발급 사용 (기존 키 불가), 주문 번호 중복 금지

### 광고 (IntegratedAd v2)

- 전면/보상형: `loadFullScreenAd()` → `showFullScreenAd()` 순서 필수 (역순 금지)
- 배너: `TossAds.initialize()` → `TossAds.attachBanner()` 순서
- 보상형: `userEarnedReward` 이벤트 반드시 처리
- 광고 로딩 정상 동작 확인 필수

### 공유 리워드

- `getTossShareLink()`로 링크 생성
- `share` API로 공유 실행
- 공유 결과 화면 정상 렌더링 확인

### TDS 디자인 시스템 (권장)

- TDS 미사용이 직접 반려 사유는 아니나 토스 UX 일관성을 위해 권장
- 탭바 사용 시: 플로팅 형태, 2~5개, 적절한 여백/크기

## SDK Import Pattern (필수)

```typescript
// ✅ CORRECT: Dynamic import + isSupported 체크
const { someAPI } = await import('@apps-in-toss/web-framework');
if (someAPI.isSupported() !== true) { /* mock 동작 */ return; }

// ❌ WRONG: Static import
import { someAPI } from '@apps-in-toss/web-framework';
```

## 출시 전 최종 검증

코드 작성 완료 후 반드시 `/appintoss-nongame-launch-checklist` 스킬을 실행하여 11단계 체크리스트를 점검한다.

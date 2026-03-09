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

## Harness Engineering Workflow (AI 에이전트 워크플로우)

> 이 보일러플레이트는 **harness engineering**이 적용되어 있다.
> AI 에이전트가 미니앱을 만들 때 반드시 이 워크플로우를 따라야 한다.
> 핵심 원칙: **"나중에 검증이 아니라, 처음부터 반려당하지 않게 만든다."**

### 7단계 워크플로우

| 단계 | 이름 | 스킬 | 설명 |
|------|------|------|------|
| 1 | 요구사항 정의 | `ooo interview` (권장) 또는 대화 | 어떤 미니앱을 만들지 명확히 정의 |
| 2 | 초기화 | `/harness-init` | granite.config.ts + 브랜딩 + viewport 등 반려방지 기본 세팅 자동 생성 |
| 3 | SDK 블록 선택 | `/harness-init` 내 포함 | robin 예제에서 필요한 with-* 조합 선택 |
| 4 | TDS 디자인 적용 | `/appintoss-tds-mobile` | 비게임 필수: TDS 디자인 시스템 적용 |
| 5 | 점진적 구현 | `/harness-progress` | 세션당 1기능, feature_list.json 기반 추적 |
| 6 | 기능별 검증 루프 | `/harness-validate` | NEVER/ALWAYS 규칙 대비 자동 위반 탐지 |
| 7 | 출시 전 최종 심사 | `/appintoss-nongame-launch-checklist` | 11단계 최종 검수 |

### 워크플로우 트리거

AI 에이전트는 아래 키워드가 등장하면 해당 스킬을 **자동 호출**한다:

| 키워드 | 스킬 |
|--------|------|
| "새 미니앱", "미니앱 만들기", "new mini-app", "harness", "워크플로우" | `/harness-workflow` (마스터) |
| "초기화", "프로젝트 시작", "init", "세팅" | `/harness-init` |
| "진행상황", "다음 기능", "progress", "next feature" | `/harness-progress` |
| "검증", "반려 체크", "validate", "심사 점검" | `/harness-validate` |

### 세션간 상태 관리 (Anthropic Harness 패턴)

AI 에이전트는 **매 세션 시작 시** 반드시 다음을 수행한다:

1. `claude-progress.txt` 읽기 → 이전 세션 작업 내용 파악
2. `feature_list.json` 읽기 → 미완성 기능 확인
3. git log 확인 → 최근 커밋 히스토리 파악
4. **미완성 기능 하나만 선택**하여 작업
5. 작업 완료 후 progress 업데이트 + 커밋

### 3-레이어 Harness

| 레이어 | 구성 | 필수 여부 |
|--------|------|----------|
| **기본** | CLAUDE.md + .claude/skills/ | 필수 (clone만으로 동작) |
| **권장** | superpowers 플러그인 | 권장 (TDD, 코드리뷰, 체계적 계획) |
| **권장** | ouroboros 플러그인 | 권장 (요구사항 인터뷰, 스펙 결정화) |

플러그인 설치법은 `docs/harness-engineering-guide.md` 참조.

<!-- ooo:START -->
<!-- ooo:VERSION:0.14.0 -->
# Ouroboros — Specification-First AI Development

> Before telling AI what to build, define what should be built.
> As Socrates asked 2,500 years ago — "What do you truly know?"
> Ouroboros turns that question into an evolutionary AI workflow engine.

Most AI coding fails at the input, not the output. Ouroboros fixes this by
**exposing hidden assumptions before any code is written**.

1. **Socratic Clarity** — Question until ambiguity ≤ 0.2
2. **Ontological Precision** — Solve the root problem, not symptoms
3. **Evolutionary Loops** — Each evaluation cycle feeds back into better specs

```
Interview → Seed → Execute → Evaluate
    ↑                           ↓
    └─── Evolutionary Loop ─────┘
```

## ooo Commands

Each command loads its agent/MCP on-demand. Details in each skill file.

| Command | Loads |
|---------|-------|
| `ooo` | — |
| `ooo interview` | `ouroboros:socratic-interviewer` |
| `ooo seed` | `ouroboros:seed-architect` |
| `ooo run` | MCP required |
| `ooo evolve` | MCP: `evolve_step` |
| `ooo evaluate` | `ouroboros:evaluator` |
| `ooo unstuck` | `ouroboros:{persona}` |
| `ooo status` | MCP: `session_status` |
| `ooo setup` | — |
| `ooo help` | — |

## Agents

Loaded on-demand — not preloaded.

**Core**: socratic-interviewer, ontologist, seed-architect, evaluator,
wonder, reflect, advocate, contrarian, judge
**Support**: hacker, simplifier, researcher, architect
<!-- ooo:END -->

# AppsInToss Fullstack Templates

[![SDK](https://img.shields.io/badge/SDK-2.0.1-blue)](https://developers-apps-in-toss.toss.im)
[![React](https://img.shields.io/badge/React-18.x-61dafb)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.x-646cff)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.x-38bdf8)](https://tailwindcss.com)

앱인토스(AppsInToss) 미니앱을 빠르게 만들기 위한 **범용 풀스택 보일러플레이트**.

레고 조립하듯 기본 틀 위에 필요한 SDK 기능만 골라 붙여 새 미니앱을 만든다.

## 왜 이 템플릿인가?

| | 처음부터 시작 | 이 템플릿 |
|---|------------|----------|
| 프로젝트 셋업 | Vite + React + TS + 린팅 직접 구성 | **즉시 시작** |
| UI 컴포넌트 | 직접 제작 또는 선택 | **shadcn-ui 50+ 컴포넌트** 내장 |
| SDK 연동 | 문서 읽고 처음부터 구현 | **29개 레퍼런스 예제** 참조 |
| 풀스택 패턴 | 아키텍처 직접 설계 | **6개 비즈니스 시나리오** 제공 |
| AI 에이전트 지원 | 없음 | **7개 전용 스킬** + AGENTS.md |

## 빠른 시작

```bash
# 1. 템플릿 클론
git clone <this-repo> my-mini-app
cd my-mini-app

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev
# → http://localhost:8080

# 4. 앱인토스 SDK 추가 (미니앱 개발 시)
npm install @apps-in-toss/web-framework
```

## 기술 스택

### Core

| 카테고리 | 기술 | 용도 |
|---------|------|------|
| **Build** | Vite 5 + SWC | 빠른 빌드 & HMR |
| **Framework** | React 18 | UI 렌더링 |
| **Language** | TypeScript 5 | 타입 안전성 |
| **Styling** | Tailwind CSS 3 | 유틸리티 CSS |
| **UI** | shadcn-ui (Radix) | 50+ 접근성 컴포넌트 |
| **Server State** | TanStack Query 5 | API 캐싱 & 동기화 |
| **Routing** | React Router 6 | SPA 라우팅 |
| **Validation** | Zod 3 | 런타임 타입 검증 |
| **Charts** | Recharts 2 | 데이터 시각화 |
| **Testing** | Vitest + Testing Library | 단위/컴포넌트 테스트 |

### AppsInToss SDK

| 패키지 | 버전 | 비고 |
|--------|------|------|
| `@apps-in-toss/web-framework` | 2.0.1 | Granite 1.0+ WebView 미니앱 |
| `@toss/tds-mobile` | latest | TDS 디자인 시스템 (비게임 필수) |

## 프로젝트 구조

```
my-mini-app/
├── src/
│   ├── App.tsx                 # 앱 엔트리 (Router, Providers)
│   ├── main.tsx                # React DOM 마운트
│   ├── components/
│   │   ├── ui/                 # shadcn-ui 컴포넌트 (~50개)
│   │   └── ...                 # 커스텀 컴포넌트
│   ├── hooks/                  # 커스텀 훅 (use-mobile, use-toast)
│   ├── lib/                    # 유틸리티 (cn, utils)
│   ├── pages/                  # 페이지 컴포넌트
│   └── test/                   # 테스트 설정 & 파일
├── vite.config.ts              # Vite 설정 (@ alias → src/)
├── tailwind.config.ts          # Tailwind 설정 (HSL 컬러 시스템)
├── tsconfig.json               # TypeScript 설정
│
└── apps-in-toss-examples-robin/  # SDK 레퍼런스 예제 (29개)
    ├── with-*/                   # 23개 단일 SDK 기능 예제
    ├── scenario-*/               # 6개 풀스택 비즈니스 시나리오
    ├── _template/                # 새 예제 생성용 템플릿
    └── _scenario-template/       # 새 시나리오 생성용 템플릿
```

## 사용 가능한 스크립트

| 스크립트 | 설명 |
|---------|------|
| `npm run dev` | Vite 개발 서버 (port 8080) |
| `npm run build` | 프로덕션 빌드 |
| `npm run build:dev` | 개발 모드 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run lint` | ESLint 실행 |
| `npm run test` | Vitest 테스트 실행 |
| `npm run test:watch` | 테스트 워치 모드 |

앱인토스 배포 시:

```bash
ait dev              # Granite 개발 서버
ait build            # Granite 프로덕션 빌드 (granite.config.ts 필요)
```

## SDK 예제 카탈로그

`apps-in-toss-examples-robin/` 디렉토리에 29개의 프로덕션 품질 예제가 포함되어 있다.

### 단일 기능 예제 (with-*) — 23개

| 카테고리 | 예제 | 설명 |
|---------|------|------|
| **환경** | `with-env-detection` | 실행 환경 감지 (web/toss/sandbox) |
| | `with-platform-os` | OS 감지 (iOS/Android) |
| | `with-network-status` | 네트워크 상태 확인 |
| | `with-locale` | 언어/지역 설정 |
| **인증** | `with-app-login` | 토스 로그인 (OAuth2) |
| | `with-storage` | 네이티브 스토리지 |
| **광고** | `with-rewarded-ad` | 보상형 광고 |
| | `with-interstitial-ad` | 전면 광고 |
| | `with-banner-ad` | 배너 광고 (v2) |
| **결제** | `with-in-app-purchase` | 인앱 결제 |
| **공유** | `with-share-reward` | 공유 바이럴 리워드 |
| | `with-contacts-viral` | 연락처 바이럴 |
| | `with-share-link` | 딥링크 공유 |
| | `with-clipboard-text` | 클립보드 |
| **미디어** | `with-camera` | 카메라 촬영 |
| | `with-album-photos` | 앨범 사진 접근 |
| **위치** | `with-location-once` | 위치 (1회) |
| | `with-location-tracking` | 위치 추적 |
| **디바이스** | `with-haptic-feedback` | 햅틱 피드백 |
| | `with-permission` | 권한 요청 |
| **UI** | `with-navigation-bar` | 네비게이션바 커스텀 |
| | `with-back-event` | 뒤로가기 제어 |
| **알림** | `with-push-notification` | 푸시 알림 |

### 풀스택 시나리오 (scenario-*) — 6개

| 시나리오 | 설명 | 주요 기능 조합 |
|----------|------|--------------|
| `scenario-attendance-reward` | 출석체크 + 광고 + 캘린더 | login, storage, rewarded-ad |
| `scenario-lottery-reward` | 복권 뽑기 + 포인트 리워드 | rewarded-ad, promotion |
| `scenario-mission-system` | 미션 + 진행도 + 보상 | storage, promotion |
| `scenario-share-viral` | 공유 바이럴 + 일일 제한 | contacts-viral, storage |
| `scenario-milestone-withdraw` | 마일스톤 + 포인트 출금 | storage, promotion |
| `scenario-onboarding-coach` | 온보딩 + 코치마크 | storage, env-detection |

### 예제 실행 방법

```bash
# 단일 기능 예제
cd apps-in-toss-examples-robin/with-{feature}
npm install && npm run dev

# 풀스택 시나리오
cd apps-in-toss-examples-robin/scenario-{name}
npm run install:all && npm run dev
```

## 미니앱 만들기 가이드

### Step 1: 보일러플레이트에서 시작

이 템플릿을 클론하면 Vite + React + shadcn-ui가 즉시 동작한다. `src/pages/Index.tsx`를 수정하여 첫 화면을 만든다.

### Step 2: SDK 기능 추가

필요한 SDK 기능을 `with-*` 예제에서 참조한다. 모든 SDK 호출은 아래 패턴을 따른다:

```typescript
// Dynamic import → isSupported 체크 → cleanup 패턴
const { someAPI } = await import('@apps-in-toss/web-framework');
if (someAPI.isSupported() !== true) { return; } // 웹에서는 mock 제공
const cleanup = someAPI({ onEvent, onError });
return () => cleanup?.();
```

### Step 3: 비즈니스 로직 구성

복잡한 비즈니스 로직이 필요하면 `scenario-*` 예제를 참고하여 Express + SQLite 또는 Supabase로 서버를 구성한다.

### Step 4: 자주 만드는 조합 (레시피)

| 미니앱 유형 | 조합할 블록 | 참고 시나리오 |
|------------|-----------|-------------|
| 출석체크 앱 | login + storage + rewarded-ad + promotion-reward | `scenario-attendance-reward` |
| 바이럴 리워드 앱 | login + share-reward + contacts-viral + promotion-reward | `scenario-share-viral` |
| 콘텐츠/미디어 앱 | login + camera + album-photos + storage | — |
| 게임 미니앱 | env-detection + rewarded-ad + in-app-purchase + haptic | — |
| 커머스 앱 | login + in-app-purchase + push-notification + storage | — |
| 미션/이벤트 앱 | login + storage + promotion-reward + rewarded-ad | `scenario-mission-system` |

### Step 5: 출시 전 체크리스트 (비게임)

- [ ] TDS 디자인 시스템 적용 (`@toss/tds-mobile`)
- [ ] 네비게이션바 뒤로가기 동작 확인
- [ ] 토스 로그인 → 인트로 후 진행
- [ ] 웹/토스/샌드박스 환경별 동작 확인
- [ ] `granite.config.ts` appName 설정
- [ ] 핀치 줌 비활성화, `alert()` 미사용

## AI 에이전트 지원

이 프로젝트는 AI 코딩 에이전트를 위한 전용 지원을 포함한다:

| 파일 | 역할 |
|------|------|
| `AGENTS.md` | 프로젝트 컨텍스트, SDK 패턴, 레고 블록 카탈로그, 에이전트 지침 |
| `.claude/skills/` | 7개 전용 스킬 (로그인, 광고, 리워드, TDS, 출시 체크리스트 등) |

AI 에이전트에게 "출석체크 미니앱 만들어줘"라고 요청하면, AGENTS.md의 레시피와 스킬을 활용하여 자동으로 구현한다.

## 공식 문서

| 문서 | URL |
|------|-----|
| AppsInToss 개발자 센터 | https://developers-apps-in-toss.toss.im |
| SDK API Reference | https://developers-apps-in-toss.toss.im/llms.txt |
| SDK Full Docs | https://developers-apps-in-toss.toss.im/llms-full.txt |
| TDS Mobile (Web) | https://tossmini-docs.toss.im/tds-mobile |
| 광고 개발 가이드 | https://developers-apps-in-toss.toss.im/ads/develop.html |
| 프로모션 개발 가이드 | https://developers-apps-in-toss.toss.im/promotion/develop.html |
| 로그인 개발 가이드 | https://developers-apps-in-toss.toss.im/login/develop.html |

## 라이선스

MIT

# AGENTS.md — AppsInToss Fullstack Templates (Boilerplate)

> 앱인토스 미니앱을 만들기 위한 **범용 보일러플레이트**. 레고 조립하듯 필요한 기능만 골라 붙여 새 미니앱을 만든다.

## Project Overview

이 프로젝트는 두 레이어로 구성된 **앱인토스 미니앱 개발 플랫폼**이다:

| 레이어 | 경로 | 역할 |
|--------|------|------|
| **Root Boilerplate** | `/` | UI 기반 프로젝트 템플릿 (Vite + React + shadcn-ui) |
| **Examples Robin** | `/apps-in-toss-examples-robin/` | SDK 기능별 레퍼런스 구현 (23 with-* + 6 scenario-*) |

**컨셉: 레고 조립**
1. Root Boilerplate에서 UI 기반 틀을 잡고
2. Examples Robin에서 필요한 SDK 기능 블록(with-*)을 참조하여 조합하고
3. 복잡한 비즈니스 로직이 필요하면 시나리오(scenario-*) 패턴을 참고한다

## Tech Stack

### Root Boilerplate (UI Layer)

| Category | Technology | Version |
|----------|-----------|---------|
| Build | Vite | 6.x |
| Framework | React | 19.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| UI Components | shadcn-ui (Radix) | latest |
| State | TanStack Query | 5.x |
| Routing | React Router DOM | 6.x |
| Validation | Zod | 3.x |
| Charts | Recharts | 2.x |
| Testing | Vitest + Testing Library | latest |

### SDK & Framework

| Package | Version | Note |
|---------|---------|------|
| `@apps-in-toss/web-framework` | 2.0.1 | Granite 1.0+ (WebView 미니앱) |
| `@toss/tds-mobile` | latest | TDS 웹 버전 (비게임 필수) |

### Server (시나리오 전용)

Express 4.x, better-sqlite3, Vercel Serverless, Supabase

### Build Commands

```bash
# Root boilerplate (개발용)
npm run dev          # Vite dev server (port 8080)
npm run build        # Production build

# SDK 미니앱 (앱인토스 배포용)
ait dev              # Granite dev server
ait build            # Granite production build (granite.config.ts)
```

## Project Structure

```
/                                    # Root Boilerplate
├── src/
│   ├── App.tsx                      # 메인 앱 엔트리
│   ├── main.tsx                     # React DOM 렌더링
│   ├── components/
│   │   ├── ui/                      # shadcn-ui 컴포넌트 (~50개)
│   │   └── NavLink.tsx              # 커스텀 컴포넌트
│   ├── hooks/                       # 커스텀 훅
│   ├── lib/                         # 유틸리티 (cn, utils)
│   ├── pages/                       # 페이지 컴포넌트
│   └── test/                        # 테스트 파일
├── vite.config.ts                   # Vite 설정 (@ alias)
├── tailwind.config.ts               # Tailwind 설정
├── tsconfig.json                    # TypeScript 설정
│
├── .claude/skills/                  # AI 에이전트 스킬 (7개)
│   ├── appintoss-login/
│   ├── appintoss-rewarded-ad/
│   ├── appintoss-banner-ad/
│   ├── appintoss-promotion-reward/
│   ├── appintoss-nongame-launch-checklist/
│   ├── appintoss-smart-message/
│   └── appintoss-tds-mobile/
│
└── apps-in-toss-examples-robin/     # SDK 레퍼런스 예제
    ├── _template/                   # 단일 기능 예제 템플릿
    ├── _scenario-template/          # 풀스택 시나리오 템플릿
    ├── with-*/                      # 23개 SDK 기능 예제
    ├── scenario-*/                  # 6개 풀스택 시나리오
    └── llms.txt                     # SDK API 요약 (LLM 친화)
```

## Available Skills (스킬 카탈로그)

스킬이 있는 기능은 **반드시 해당 스킬을 호출**하여 구현한다.

| Skill | 용도 | Trigger Keywords |
|-------|------|-----------------|
| `/appintoss-login` | 토스 로그인 전체 구현 (OAuth2, mTLS, JWT, Supabase) | 로그인, login, 인증, auth |
| `/appintoss-rewarded-ad` | 보상형/전면형 광고 구현 (AdMob) | 광고, rewarded ad, interstitial |
| `/appintoss-banner-ad` | 배너 광고 v2 구현 (TossAds) | 배너, banner ad |
| `/appintoss-promotion-reward` | 토스포인트 프로모션 리워드 지급 | 리워드, 포인트, promotion, reward |
| `/appintoss-nongame-launch-checklist` | 비게임 출시 전 최종 점검 체크리스트 | 출시, launch, 검수, checklist |
| `/appintoss-smart-message` | 마케팅 푸시 메시지 소재 생성 | 푸시, 메시지, smart message |
| `/appintoss-tds-mobile` | TDS 디자인 시스템 가이드 (비게임 필수) | TDS, 디자인, design system |

## SDK Examples Catalog (레고 블록)

### 환경 & 플랫폼

| 블록 | 설명 | SDK API | 유스케이스 |
|------|------|---------|-----------|
| `with-env-detection` | 실행 환경 감지 | `getOperationalEnvironment()` | 모든 미니앱의 기본 블록 |
| `with-platform-os` | OS 감지 (iOS/Android) | `getPlatformOS()` | OS별 분기 처리 |
| `with-network-status` | 네트워크 상태 | `getNetworkStatus()` | 오프라인 대응 |
| `with-locale` | 언어/지역 설정 | `getLocale()` | 다국어 지원 |

### 인증 & 스토리지

| 블록 | 설명 | SDK API | 유스케이스 |
|------|------|---------|-----------|
| `with-app-login` | 토스 로그인 | `appLogin()` | 사용자 인증이 필요한 모든 앱 |
| `with-storage` | 네이티브 스토리지 | `Storage.*` | 로컬 데이터 저장 |

### 광고 & 수익화

| 블록 | 설명 | SDK API | 유스케이스 |
|------|------|---------|-----------|
| `with-rewarded-ad` | 보상형 광고 | `loadFullScreenAd()`, `showFullScreenAd()` | 광고 시청 후 보상 |
| `with-interstitial-ad` | 전면 광고 | `loadFullScreenAd()`, `showFullScreenAd()` | 화면 전환 시 광고 |
| `with-banner-ad` | 배너 광고 (v2) | `TossAds.initialize()`, `TossAds.attachBanner()` | 상시 노출 배너 |
| `with-in-app-purchase` | 인앱 결제 | `getProductItemList()`, `createOneTimePurchaseOrder()` | 유료 아이템 판매 |

### 바이럴 & 공유

| 블록 | 설명 | SDK API | 유스케이스 |
|------|------|---------|-----------|
| `with-share-reward` | 공유 바이럴 리워드 | `contactsViral()` | 친구 초대 리워드 |
| `with-contacts-viral` | 연락처 바이럴 | `contactsViral()` | 대량 초대 캠페인 |
| `with-share-link` | 딥링크 공유 | `getTossShareLink()` | 콘텐츠 공유 |
| `with-clipboard-text` | 클립보드 | `setClipboardText()`, `getClipboardText()` | 텍스트 복사/붙여넣기 |

### 미디어 & 디바이스

| 블록 | 설명 | SDK API | 유스케이스 |
|------|------|---------|-----------|
| `with-camera` | 카메라 촬영 | `openCamera()` | 사진 촬영 기능 |
| `with-album-photos` | 앨범 사진 | `fetchAlbumPhotos()` | 갤러리 접근 |
| `with-location-once` | 위치 (1회) | `getCurrentLocation()` | 현재 위치 확인 |
| `with-location-tracking` | 위치 추적 | `startUpdateLocation()` | 실시간 위치 트래킹 |
| `with-haptic-feedback` | 햅틱 피드백 | `generateHapticFeedback()` | 터치 피드백 |

### UI & 네비게이션

| 블록 | 설명 | SDK API | 유스케이스 |
|------|------|---------|-----------|
| `with-navigation-bar` | 네비게이션바 커스텀 | `partner.addAccessoryButton()` | 상단바 버튼 추가 |
| `with-back-event` | 뒤로가기 제어 | `useBackEvent()` | 뒤로가기 인터셉트 |
| `with-permission` | 권한 요청 | `getPermission()`, `openPermissionDialog()` | 카메라/위치 권한 |
| `with-push-notification` | 푸시 알림 | Server-side REST API | 마케팅/알림 푸시 |

### 풀스택 시나리오 (비즈니스 패턴)

| 시나리오 | 설명 | 조합 블록 |
|----------|------|----------|
| `scenario-attendance-reward` | 출석체크 + 보상형 광고 + 캘린더 | login, storage, rewarded-ad |
| `scenario-lottery-reward` | 복권 뽑기 + 광고 + 포인트 리워드 | rewarded-ad, promotion |
| `scenario-mission-system` | 미션 + 진행도 + 보상 수령 | storage, promotion |
| `scenario-share-viral` | 공유 바이럴 + 일일 제한 + 리워드 | contacts-viral, storage |
| `scenario-milestone-withdraw` | 마일스톤 + 포인트 출금 | storage, promotion |
| `scenario-onboarding-coach` | 온보딩 + 코치마크 오버레이 | storage, env-detection |

## Key Patterns & Conventions

### SDK Safety Pattern (필수)

모든 SDK API 호출은 반드시 이 3단계 패턴을 따른다:

```typescript
// Step 1: Dynamic import (번들 최적화)
const { someAPI } = await import('@apps-in-toss/web-framework');

// Step 2: isSupported 체크 (웹 환경 graceful degradation)
if (someAPI.isSupported() !== true) {
  // mock 동작 제공
  return;
}

// Step 3: cleanup 패턴 (메모리 누수 방지)
const cleanup = someAPI({ onEvent, onError });
return () => cleanup?.();
```

### Environment Detection

```typescript
const env = getOperationalEnvironment(); // 'web' | 'toss' | 'sandbox'
// web: 브라우저 개발 → mock 데이터, console.log
// sandbox: 토스 테스트 환경 → 테스트 광고 ID
// toss: 프로덕션 → 실제 SDK API
```

### Standard Hook Interface

```typescript
interface UseFeatureReturn {
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: Error | null;
  isSupported: boolean;
  environment: 'web' | 'toss' | 'sandbox';
}
```

### Naming Conventions

| 대상 | 패턴 | 예시 |
|------|------|------|
| Hook | `use{Feature}.ts` | `useRewardedAd.ts` |
| Component | `{Feature}Demo.tsx` | `RewardedAdDemo.tsx` |
| Store | `{feature}Store.ts` | `rewardedAdStore.ts` |
| Page | `{Feature}.tsx` | `Home.tsx` |
| Directory | `with-{feature}` / `scenario-{name}` | `with-rewarded-ad` |

### Path Alias

```typescript
import { Button } from '@/components/ui/button'; // → src/components/ui/button
```

## New Mini-App Creation Workflow

AI 에이전트가 새 미니앱 요청을 받았을 때의 단계별 가이드:

### Step 1: 요구사항 파악
- 어떤 SDK 기능이 필요한가? (로그인, 광고, 결제, 공유 등)
- 게임인가 비게임인가? (TDS 적용 여부 결정)
- 서버가 필요한가? (단일 기능 vs 풀스택 시나리오)

### Step 2: 프로젝트 셋업
- Root Boilerplate를 기반으로 새 프로젝트 생성
- `granite.config.ts` 생성 (appName 설정)
- `@apps-in-toss/web-framework` 의존성 추가

### Step 2.5: 출시 준수 규칙 확인 (비게임 필수)

코드 작성 전에 프로젝트 루트의 `CLAUDE.md`에 정의된 심사 준수 규칙을 확인한다.
주요 체크포인트:

- [ ] `granite.config.ts`에 `navigationBar: { withBackButton: true, withHomeButton: true }` 설정
- [ ] `brand.displayName`과 `index.html` `<title>`, `<meta og:title>` 앱 이름 통일
- [ ] `<meta name="viewport">`에 `user-scalable=no` 포함
- [ ] 자체 헤더/백버튼/햄버거 메뉴 구현하지 않음
- [ ] `alert()`/`confirm()` 대신 TDS 모달 또는 shadcn-ui AlertDialog 사용
- [ ] 로그인은 인트로 화면 이후에 진행
- [ ] 외부 앱/브라우저 이동 없이 미니앱 내 완결
- [ ] 앱 설치 유도 문구/배너/마켓 링크 없음

전체 규칙: `CLAUDE.md` 참조

### Step 3: SDK 기능 조합
- `apps-in-toss-examples-robin/with-*`에서 필요한 패턴 참조
- 각 블록의 Hook + Component 패턴을 복사/적용
- SDK Safety Pattern 준수 필수

### Step 4: 풀스택 구성 (필요시)
- `scenario-*` 패턴으로 서버 구성 참고
- Express + SQLite 또는 Supabase 선택

### Step 5: 스킬 호출
- 로그인 필요? → `/appintoss-login`
- 광고 필요? → `/appintoss-rewarded-ad` 또는 `/appintoss-banner-ad`
- 리워드 필요? → `/appintoss-promotion-reward`
- TDS 적용? → `/appintoss-tds-mobile`

### Step 6: TDS 적용 (비게임 필수)
- 비게임 미니앱은 반드시 `@toss/tds-mobile` 사용
- `/appintoss-tds-mobile` 스킬로 가이드 확인

### Step 7: 출시 전 점검
- `/appintoss-nongame-launch-checklist` 실행하여 11단계 최종 검수
- `CLAUDE.md`의 NEVER/ALWAYS 규칙 위반 항목이 없는지 재확인
- 모든 등록 스킴 URL 404 없이 정상 동작 확인

## Common Mini-App Recipes (레시피)

### 출석체크 앱
```
login + storage + rewarded-ad + promotion-reward + calendar UI
→ scenario-attendance-reward 참고
→ 스킬: /appintoss-login, /appintoss-rewarded-ad, /appintoss-promotion-reward
```

### 바이럴 리워드 앱
```
login + share-reward + contacts-viral + promotion-reward
→ scenario-share-viral 참고
→ 스킬: /appintoss-login, /appintoss-promotion-reward
```

### 콘텐츠/미디어 앱
```
login + camera + album-photos + storage + share-link
→ 스킬: /appintoss-login
```

### 게임 미니앱
```
env-detection + rewarded-ad + in-app-purchase + haptic-feedback
→ 스킬: /appintoss-rewarded-ad (TDS 선택사항)
```

### 커머스 앱
```
login + in-app-purchase + push-notification + storage
→ 스킬: /appintoss-login, /appintoss-tds-mobile
```

### 미션/이벤트 앱
```
login + storage + promotion-reward + rewarded-ad + push-notification
→ scenario-mission-system 참고
→ 스킬: /appintoss-login, /appintoss-rewarded-ad, /appintoss-promotion-reward
```

## For AI Agents (에이전트 지침)

### 필수 규칙
1. **새 미니앱은 반드시 이 보일러플레이트를 기반으로 시작**한다
2. SDK API 호출은 반드시 `examples-robin/with-*`의 패턴을 따른다
3. 스킬이 있는 기능은 **반드시 해당 스킬을 먼저 호출**한다
4. 비게임 앱은 출시 전 반드시 `/appintoss-nongame-launch-checklist` 실행
5. SDK import는 **반드시 Dynamic Import + isSupported** 패턴 사용
6. 웹 환경에서도 동작하는 **mock 동작을 반드시 제공**한다

### SDK Import 규칙

```typescript
// ✅ CORRECT: Dynamic import + isSupported
const { loadFullScreenAd } = await import('@apps-in-toss/web-framework');
if (loadFullScreenAd.isSupported() !== true) { /* mock */ return; }

// ❌ WRONG: Static import
import { loadFullScreenAd } from '@apps-in-toss/web-framework';
```

### TDS 규칙

| 앱 유형 | TDS 사용 | 패키지 |
|---------|---------|--------|
| 비게임 | **필수** | `@toss/tds-mobile` |
| 게임 | 선택 | `@toss/tds-mobile` |

### 새 예제 추가 시
- `_template/` (단일 기능) 또는 `_scenario-template/` (풀스택) 복사하여 시작
- 각 예제는 **독립적** — 다른 예제의 코드를 import하지 않음
- `granite.config.ts`의 `appName`은 디렉토리명과 일치

## Official Documentation Links

| 문서 | URL |
|------|-----|
| SDK Overview (LLM) | https://developers-apps-in-toss.toss.im/llms.txt |
| SDK Full Docs (LLM) | https://developers-apps-in-toss.toss.im/llms-full.txt |
| 광고 (Ads) | https://developers-apps-in-toss.toss.im/ads/develop.html |
| 프로모션 (Promotion) | https://developers-apps-in-toss.toss.im/promotion/develop.html |
| 로그인 (Login) | https://developers-apps-in-toss.toss.im/login/develop.html |
| 공유리워드 (Share) | https://developers-apps-in-toss.toss.im/bedrock/reference/framework/친구초대/contactsViral.html |
| 인앱결제 (IAP) | https://developers-apps-in-toss.toss.im/bedrock/reference/framework/인앱결제/IAP.html |
| 권한 (Permission) | https://developers-apps-in-toss.toss.im/bedrock/reference/framework/권한/permission.html |
| 뒤로가기 (Back) | https://developers-apps-in-toss.toss.im/bedrock/reference/framework/이벤트제어/back-event.html |
| 네비게이션바 (NavBar) | https://developers-apps-in-toss.toss.im/bedrock/reference/framework/UI/NavigationBar.html |
| TDS React Native | https://tossmini-docs.toss.im/tds-react-native |
| TDS Mobile (Web) | https://tossmini-docs.toss.im/tds-mobile |
| AppsInToss 개발자 센터 | https://developers-apps-in-toss.toss.im |

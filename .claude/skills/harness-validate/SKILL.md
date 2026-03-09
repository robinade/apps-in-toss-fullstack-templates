---
name: harness-validate
description: >
  앱인토스 미니앱 코드베이스를 CLAUDE.md의 심사 규칙(NEVER/ALWAYS/CONDITIONAL) 대비
  자동 스캔하여 위반 항목을 탐지하고 수정 방법을 제시하는 반려방지 검증 도구.
  기능 구현 후 즉시 실행하면 반려 위험을 조기에 발견할 수 있고, 전체 구현 완료 후
  최종 점검으로도 사용한다. 위반 → 수정 → 재검증 루프를 모든 항목 통과까지 반복.
  Use when: (1) 기능 구현 후 반려 위험 체크, (2) 전체 코드 심사 규칙 점검,
  (3) 출시 전 NEVER/ALWAYS 규칙 위반 여부 확인, (4) 코드에서 심사 반려 요소 탐지,
  (5) 심사 제출 전 최종 점검, (6) "이거 반려 안 당할까?" 확인할 때.
  Make sure to use this skill whenever the user mentions 검증, 반려 체크, 심사 점검,
  or asks if their code will pass review, even without explicitly saying "validate".
  Triggers: "검증", "반려 체크", "validate", "심사 점검", "규칙 체크",
  "rule check", "반려 방지", "위반 체크", "심사 통과", "반려될까",
  "코드 검증", "규칙 위반", "체크리스트", "review check".
---

# 반려방지 자동 검증

토스 미니앱 심사에는 수십 가지 규칙이 있다. CLAUDE.md에 NEVER/ALWAYS/CONDITIONAL로
분류된 이 규칙들을 코드베이스에서 자동으로 스캔하여 위반 항목을 찾아낸다.

이 검증은 `/appintoss-nongame-launch-checklist`(7단계 최종 심사)보다 가볍고 빠르다.
기능 하나를 구현할 때마다 실행하면 문제를 조기에 잡을 수 있다.

---

## 검증 항목

### NEVER 규칙 (위반 시 심사 반려)

이 항목들은 하나라도 위반되면 심사에서 반려된다. `src/` 디렉토리의 `.ts`, `.tsx` 파일을 대상으로 검사한다.

#### N1: alert/confirm/prompt 사용 금지

`alert()`, `confirm()`, `prompt()`를 검색한다.
토스 앱 내에서 브라우저 기본 다이얼로그는 UX가 어색하고, 토스가 이를 명시적으로 금지한다.
대체: shadcn-ui `AlertDialog`, TDS `Dialog`, 또는 커스텀 모달.

#### N2: 자체 헤더/백버튼/햄버거 메뉴

`<header`, `<Header`, `<AppBar`, `<TopBar`, `<Navbar`, `goBack`, `navigate(-1)`,
`history.back`, `hamburger`, `HamburgerMenu` 패턴을 검색한다.
자체 헤더가 있으면 "인앱 브라우저처럼 보인다"는 이유로 반려된다.
대체: `granite.config.ts`의 `navigationBar` 설정만 사용.

#### N3: 앱 시작 시 바로 로그인

`App.tsx`, `main.tsx`에서 `useEffect` 내 `appLogin` 또는 `login` 호출을 검색한다.
사용자에게 서비스를 소개하기 전에 로그인을 요구하면 반려된다.
대체: 인트로/랜딩 화면을 먼저 표시, 사용자 액션으로 로그인 진행.

#### N4: 외부 앱/브라우저 이동

`window.open`, `location.href`, `window.location` 패턴을 검색한다.
핵심 기능이 외부로 연결되면 반려된다 (법률 고지/공공기관 링크만 예외).
대체: 미니앱 내에서 완결되도록 구현.

#### N5: 앱 설치 유도

"앱.*설치", "앱.*다운로드", "마켓.*링크", "play.google", "apps.apple", "앱스토어"
패턴을 검색한다. 설치 유도 문구, 배너, 마켓 링크 모두 금지.
대체: 해당 문구/링크 전체 제거.

#### N6: Static SDK import

`import ... from '@apps-in-toss/web-framework'` 형태의 static import를 검색한다.
Static import는 웹 환경에서 크래시를 일으키고, 토스 SDK 사용 패턴에도 위배된다.
대체: `const { api } = await import('@apps-in-toss/web-framework')` 동적 import.

### ALWAYS 규칙 (필수 준수)

#### A1: viewport user-scalable=no

`index.html`에서 `user-scalable=no`를 확인한다.
핀치줌이 활성화되어 있으면 반려된다.

#### A2: navigationBar 설정

`granite.config.ts`에서 `withBackButton: true`와 `withHomeButton: true`를 확인한다.
네비게이션바 미설정 시 반려된다.

#### A3: 브랜딩 통일

`granite.config.ts`의 `displayName`과 `index.html`의 `<title>` 내용이 일치하는지 확인한다.
앱 이름이 불일치하면 반려된다.

#### A4: 인트로 화면 존재

`src/` 디렉토리에서 `Intro`, `Onboarding`, `Landing`, `Welcome` 컴포넌트를 검색한다.
인트로 화면이 없으면 경고 (반려 가능성 높음).

### CONDITIONAL 규칙 (해당 기능 사용 시)

해당 기능이 코드에 존재하는 경우에만 검증한다.

#### C1: 광고 구현 (loadFullScreenAd 사용 시)

- `loadFullScreenAd` → `showFullScreenAd` 순서가 맞는지 확인
- `userEarnedReward` 이벤트 핸들러가 있는지 확인 (보상형 광고)

#### C2: 결제 구현 (인앱결제/토스페이 사용 시)

- 결제 전 상품 정보(이름, 금액) 표시가 있는지 확인
- UI 표시 금액과 결제 금액 불일치 패턴 탐색

#### C3: 공유 구현 (share 관련 코드 사용 시)

- `getTossShareLink` 사용 여부 확인 (자체 웹사이트 링크 공유 금지)

---

## 검증 실행 방법

`src/` 디렉토리의 `.ts`, `.tsx` 파일을 대상으로 각 항목의 패턴을 검색한다.
Grep 도구를 사용하여 검색하고, 결과를 항목별로 정리한다.

CONDITIONAL 규칙은 먼저 해당 기능의 존재 여부를 확인하고,
존재하는 경우에만 세부 검증을 수행한다.

---

## 검증 결과 리포트

모든 검증 완료 후 항목별 통과/위반 상태를 정리하여 보고한다.
위반 항목에는 해당 파일과 라인 번호, 구체적인 수정 방법을 함께 제시한다.

### 위반 발견 시

1. 위반 항목별 수정 방법을 제시한다 (각 항목의 "대체" 참조)
2. 수정을 구현한다
3. 수정 후 이 스킬을 다시 실행하여 재검증한다
4. 모든 항목이 통과할 때까지 이 루프를 반복한다

### 모든 항목 통과 시

다음 단계로 `/appintoss-nongame-launch-checklist`를 안내한다.
이 검증은 코드 수준의 규칙 체크이고, launch checklist는 UI/UX, 기능 완결성,
콘솔 설정 등 더 넓은 범위의 최종 심사를 수행한다.

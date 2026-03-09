---
name: harness-init
description: >
  앱인토스 미니앱 프로젝트 초기화 스킬. 심사 반려를 방지하기 위한 필수 설정을
  프로젝트 시작 시점에 자동 생성한다. granite.config.ts, index.html viewport,
  브랜딩 통일, feature_list.json, claude-progress.txt를 한 번에 세팅.
  Triggers: "초기화", "프로젝트 시작", "init", "세팅", "setup project",
  "새 프로젝트", "new project", "프로젝트 세팅"
---

# 앱인토스 프로젝트 초기화 (반려방지 세팅)

> 이 스킬은 CLAUDE.md의 NEVER/ALWAYS 규칙을 **사전에 충족**하는 프로젝트 기반을 생성한다.

## 사전 조건

- 이 보일러플레이트 프로젝트가 clone된 상태
- Node.js 환경 (npm/bun 사용 가능)

## 초기화 절차

### Step 1: 프로젝트 정보 수집

AskUserQuestion으로 다음을 질문한다:

```json
{
  "questions": [
    {
      "question": "미니앱 이름을 한글로 입력해주세요 (예: 출석체크, 행운뽑기)",
      "header": "앱 이름",
      "options": [
        {"label": "출석체크", "description": "출석체크 + 보상형 광고 앱"},
        {"label": "행운뽑기", "description": "복권 뽑기 + 리워드 앱"},
        {"label": "미션챌린지", "description": "미션 + 진행도 + 보상 앱"}
      ],
      "multiSelect": false
    },
    {
      "question": "게임 앱인가요, 비게임 앱인가요?",
      "header": "앱 유형",
      "options": [
        {"label": "비게임", "description": "TDS 디자인 시스템 필수 적용"},
        {"label": "게임", "description": "TDS 선택사항"}
      ],
      "multiSelect": false
    },
    {
      "question": "브랜드 메인 컬러를 입력해주세요 (6자리 hex)",
      "header": "브랜드 컬러",
      "options": [
        {"label": "#3182F6", "description": "토스 블루 (기본)"},
        {"label": "#FF6B35", "description": "오렌지"},
        {"label": "#00C853", "description": "그린"}
      ],
      "multiSelect": false
    }
  ]
}
```

수집 정보: `appName` (한글), `appType` (game/nongame), `primaryColor` (hex)

### Step 2: granite.config.ts 생성

**CLAUDE.md ALWAYS 규칙 충족: navigationBar, brand 설정**

```typescript
import { defineConfig } from '@apps-in-toss/web-framework';

export default defineConfig({
  appName: '{{appName}}',

  // ✅ ALWAYS: 네비게이션바 필수 설정
  navigationBar: {
    withBackButton: true,
    withHomeButton: true,
    // 액세서리 버튼은 필요시 추가 (최대 1개, 모노톤 아이콘만)
  },

  // ✅ ALWAYS: 브랜딩 통일
  brand: {
    displayName: '{{appName}}',
    primaryColor: '{{primaryColor}}',
  },
});
```

### Step 3: index.html 반려방지 메타태그 설정

**CLAUDE.md ALWAYS 규칙 충족: viewport user-scalable=no, 브랜딩 통일**

`index.html`의 `<head>` 내에 다음이 포함되어야 한다:

```html
<!-- ✅ ALWAYS: 핀치줌 비활성화 (필수) -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

<!-- ✅ ALWAYS: 브랜딩 통일 (granite.config.ts의 displayName과 동일) -->
<title>{{appName}}</title>
<meta property="og:title" content="{{appName}}">
```

기존 `<meta name="viewport">` 태그가 있으면 교체, 없으면 추가.
기존 `<title>` 태그의 내용을 `{{appName}}`으로 교체.

### Step 4: App.tsx 인트로 화면 패턴 적용

**CLAUDE.md NEVER 규칙 충족: 앱 시작 시 바로 appLogin() 호출 금지**

`src/App.tsx`에 인트로/랜딩 화면 패턴을 적용한다:

```typescript
// ✅ CORRECT: 인트로 화면 → 사용자 액션 → 로그인
function App() {
  const [showIntro, setShowIntro] = useState(true);

  if (showIntro) {
    return <IntroView onStart={() => setShowIntro(false)} />;
  }

  return <MainView />;
}
```

로그인이 필요한 경우에도 반드시 인트로 화면을 먼저 보여준 후 사용자 액션으로 로그인을 진행한다.

### Step 5: feature_list.json 생성

Anthropic harness 패턴의 핵심 — 기능 목록을 JSON으로 관리:

```json
{
  "project": "{{appName}}",
  "created": "{{현재날짜}}",
  "features": [
    {
      "id": "F001",
      "category": "infrastructure",
      "description": "프로젝트 초기 세팅 (granite.config, viewport, 브랜딩)",
      "steps": [
        "granite.config.ts 생성",
        "index.html 메타태그 설정",
        "App.tsx 인트로 화면 패턴 적용"
      ],
      "passes": true
    }
  ]
}
```

Step 1에서 수집한 요구사항을 바탕으로, 필요한 기능을 `features` 배열에 추가한다.
각 기능의 `passes`는 `false`로 초기화한다 (F001만 `true`).

### Step 6: claude-progress.txt 생성

```text
# {{appName}} — 개발 진행 기록

## 프로젝트 정보
- 앱 이름: {{appName}}
- 앱 유형: {{appType}}
- 생성일: {{현재날짜}}

## 세션 기록

### Session 1 — {{현재날짜}}
- 프로젝트 초기화 완료
- granite.config.ts 생성 (navigationBar, brand 설정)
- index.html viewport + 브랜딩 메타태그 설정
- feature_list.json 생성 ({{N}}개 기능 등록)
- 다음 작업: feature_list.json의 F002 구현
```

### Step 7: 초기 커밋

```bash
git add granite.config.ts index.html src/App.tsx feature_list.json claude-progress.txt
git commit -m "feat: initialize {{appName}} with rejection-proof settings"
```

### Step 8: 초기화 완료 보고

다음 형식으로 초기화 결과를 보고한다:

```
═══════════════════════════════════════════
 ✅ 프로젝트 초기화 완료
═══════════════════════════════════════════
 앱 이름: {{appName}}
 앱 유형: {{appType}}
 브랜드 컬러: {{primaryColor}}

 반려방지 세팅:
   ✅ granite.config.ts — navigationBar, brand
   ✅ index.html — viewport user-scalable=no
   ✅ index.html — title, og:title 브랜딩 통일
   ✅ App.tsx — 인트로 화면 패턴 적용
   ✅ feature_list.json — {{N}}개 기능 등록
   ✅ claude-progress.txt — 진행 기록 시작

 📍 다음 단계: /harness-progress로 첫 번째 기능 구현 시작
═══════════════════════════════════════════
```

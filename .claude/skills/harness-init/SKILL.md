---
name: harness-init
description: >
  앱인토스 미니앱 프로젝트의 반려방지 초기화. 토스 심사에서 반려되는 가장 흔한 원인들
  (viewport 핀치줌, 자체 헤더, 브랜딩 불일치, 앱 시작 시 로그인 등)을 프로젝트 시작
  시점에 구조적으로 차단하는 기본 세팅을 자동 생성한다. granite.config.ts, index.html
  메타태그, 인트로 화면 패턴, feature_list.json, claude-progress.txt를 한 번에 세팅.
  Use when: (1) 새 앱인토스 미니앱 프로젝트 시작, (2) granite.config.ts가 아직 없을 때,
  (3) 프로젝트 초기 세팅이 필요할 때, (4) 반려방지 기본 설정을 적용하고 싶을 때.
  Make sure to use this skill whenever the user starts a new AppsInToss project or
  mentions project initialization, even if they don't explicitly say "harness-init".
  Triggers: "초기화", "프로젝트 시작", "init", "세팅", "setup project",
  "새 프로젝트", "new project", "프로젝트 세팅", "반려방지 세팅",
  "granite config 만들기", "프로젝트 설정".
---

# 반려방지 프로젝트 초기화

토스 미니앱 심사 반려의 약 60%는 초기 세팅 누락에서 비롯된다 —
viewport 핀치줌 허용, 네비게이션바 미설정, 브랜딩 불일치, 앱 시작 시 바로 로그인 등.
이 스킬은 이런 문제들을 프로젝트 시작 시점에 원천 차단한다.

---

## Step 0: 프로젝트 정보 수집

사용자에게 세 가지 정보를 확인한다:

1. **앱 이름** (한글) — 예: 출석체크, 행운뽑기, 미션챌린지
2. **앱 유형** — 비게임(TDS 디자인 시스템 필수) / 게임(TDS 선택)
3. **브랜드 메인 컬러** — 6자리 hex (기본: `#3182F6` 토스 블루)

이 정보는 이후 모든 세팅에서 일관되게 사용된다.
브랜딩 불일치(앱 이름이 granite.config, index.html, 공유 메시지에서 다른 경우)는
심사 반려 사유이므로, 여기서 한 번 정의하고 모든 곳에 동일하게 적용하는 것이 핵심이다.

---

## Step 1: granite.config.ts 생성

토스 미니앱의 네비게이션바와 브랜딩을 설정하는 핵심 파일.
자체 헤더나 백버튼을 만들면 "인앱 브라우저처럼 보인다"는 이유로 반려되므로,
공통 네비게이션바 설정만 사용해야 한다.

```typescript
import { defineConfig } from '@apps-in-toss/web-framework';

export default defineConfig({
  appName: '{{appName}}',
  navigationBar: {
    withBackButton: true,    // 뒤로가기 — 첫 화면에서는 앱 종료
    withHomeButton: true,    // 홈 버튼
  },
  brand: {
    displayName: '{{appName}}',   // index.html <title>과 정확히 일치해야 함
    primaryColor: '{{primaryColor}}',
  },
});
```

액세서리 버튼이 필요하면 `initialAccessoryButton`을 추가할 수 있다.
단, 최대 1개이고 모노톤 아이콘만 허용된다 (컬러 아이콘 사용 시 반려).

## Step 2: index.html 메타태그

두 가지를 확인하고 설정한다:

**핀치줌 비활성화** — `user-scalable=no`가 없으면 반려:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

**브랜딩 통일** — `<title>`과 `og:title`이 granite.config.ts의 `displayName`과 정확히 일치:
```html
<title>{{appName}}</title>
<meta property="og:title" content="{{appName}}">
```

기존 viewport 태그가 있으면 교체하고, `<title>` 내용을 앱 이름으로 업데이트한다.

## Step 3: 인트로 화면 패턴 적용

앱 시작 시 바로 `appLogin()`을 호출하면 반려된다.
토스 심사 기준상 사용자에게 먼저 서비스를 소개한 후, 사용자의 명시적 액션으로
로그인을 진행해야 한다.

`src/App.tsx`(또는 라우터 설정)에 인트로/랜딩 화면을 첫 진입점으로 설정한다.
로그인이 필요 없는 앱이라도 인트로 화면은 있는 것이 심사에 유리하다.

```
[앱 시작] → [인트로/랜딩 화면] → [사용자 액션] → [로그인(필요시)] → [메인 화면]
```

## Step 4: feature_list.json 생성

Anthropic harness 패턴의 핵심 — 구현할 기능 목록을 JSON으로 관리하여
세션 간 상태를 추적한다.

```json
{
  "project": "{{appName}}",
  "created": "{{YYYY-MM-DD}}",
  "features": [
    {
      "id": "F001",
      "category": "infrastructure",
      "description": "프로젝트 초기 세팅",
      "steps": ["granite.config.ts", "index.html 메타태그", "인트로 화면"],
      "passes": true
    }
  ]
}
```

Step 0에서 수집한 요구사항을 바탕으로 필요한 기능들을 `features` 배열에 추가한다.
F001(초기 세팅)만 `passes: true`로 설정하고, 나머지는 모두 `false`로 시작한다.

**feature 스키마:**

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | string | `F001` 형식의 고유 ID |
| `category` | string | `infrastructure`, `auth`, `ads`, `payment`, `share`, `media`, `ui`, `logic` |
| `description` | string | 기능 설명 |
| `steps` | string[] | 구현 단계 목록 |
| `passes` | boolean | 완료 여부 (에이전트가 구현 완료 시 `true`로 변경) |

## Step 5: claude-progress.txt 생성

세션 간 컨텍스트를 전달하는 자연어 기록 파일.
다음 세션의 AI 에이전트가 이 파일을 읽고 이전 작업을 이어받는다.

```text
# {{appName}} — 개발 진행 기록

## 프로젝트 정보
- 앱 이름: {{appName}}
- 앱 유형: {{appType}}
- 생성일: {{YYYY-MM-DD}}

## 세션 기록

### Session 1 — {{YYYY-MM-DD}}
- 프로젝트 초기화 완료
- granite.config.ts 생성 (navigationBar, brand 설정)
- index.html viewport + 브랜딩 메타태그 설정
- feature_list.json 생성 ({{N}}개 기능 등록)
- 다음 작업: F002 구현
```

## Step 6: 커밋 + 완료 보고

초기화 파일들을 git commit한 뒤, 생성된 세팅 목록과 등록된 기능 수를 보고한다.
커밋 메시지: `feat: initialize {{appName}} with rejection-proof settings`

완료 후 다음 단계 안내: `/harness-progress`로 첫 번째 기능 구현 시작.

---

## 트러블슈팅

| 상황 | 해결 |
|------|------|
| granite.config.ts가 이미 존재 | 기존 설정을 읽고 누락된 항목만 보완 |
| index.html에 viewport 태그가 여러 개 | 하나만 남기고 `user-scalable=no` 포함 확인 |
| 앱 이름에 영문만 사용 | 토스 심사는 한글 앱 이름을 요구 — 사용자에게 한글 이름 확인 |
| feature_list.json이 이미 존재 | 덮어쓰지 않고 기존 목록에 병합 |

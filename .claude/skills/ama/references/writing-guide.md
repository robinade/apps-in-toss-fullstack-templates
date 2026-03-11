# CLAUDE.md & AGENTS.md 작성 가이드

## 목차
- CLAUDE.md: 정의와 구조
- AGENTS.md: 정의와 구조
- 두 파일의 차이점
- 이 프로젝트의 실제 예시

---

## CLAUDE.md — AI 에이전트를 위한 프로젝트 규칙

CLAUDE.md는 AI 에이전트가 코드를 생성할 때 반드시 따라야 할 **규칙과 제약**을 담는 파일이다.
일종의 계약서: 여기 적힌 규칙은 에이전트가 코드를 쓸 때마다 적용된다.

### 권장 구조

```markdown
## NEVER (절대 금지)
- 위반하면 치명적인 규칙 (심사 반려 사유)
- 예: "alert(), confirm(), prompt() 사용 금지"
- 예: "자체 상단 헤더 구현 금지"

## ALWAYS (필수 준수)
- 모든 상황에서 지켜야 하는 규칙
- 예: "navigationBar에 backButton, homeButton 설정 필수"
- 예: "앱 이름을 모든 위치에서 동일하게 표시"

## CONDITIONAL (해당 시 필수)
- 특정 기능 구현 시에만 적용되는 규칙
- 예: "결제 구현 시 상품 상세 정보를 결제 전에 표시"

## SDK Import Pattern
- 프로젝트 고유 코드 패턴 + WRONG/CORRECT 예시

## Tech Stack
- 프레임워크 버전, 빌드 도구, 주요 의존성
```

### 작성 원칙

**구체적으로 쓴다.** "best practice를 따르라" 대신 실제 규칙을 명시:
```
alert() 사용 금지 — TDS Dialog 또는 shadcn-ui AlertDialog를 대신 사용
```

**WRONG vs CORRECT 코드 예시를 넣는다.** 규칙을 모호하지 않게 만든다:
```typescript
// WRONG
import { someAPI } from '@apps-in-toss/web-framework';

// CORRECT
const { someAPI } = await import('@apps-in-toss/web-framework');
if (someAPI.isSupported() !== true) { /* mock */ return; }
```

**간결하게 유지한다.** CLAUDE.md가 너무 길면 AI가 규칙을 놓칠 수 있다.
200줄을 넘으면 상세 가이드는 별도 파일이나 스킬로 분리하는 것이 좋다.

**심각도 순으로 배치한다.** 심사 반려 사유가 되는 규칙은 NEVER (파일 최상단)에
배치하여 AI가 가장 먼저 인식하게 한다.

---

## AGENTS.md — AI 에이전트를 위한 프로젝트 맥락

AGENTS.md는 AI 에이전트에게 **프로젝트의 구조와 패턴**을 알려주는 파일이다.
CLAUDE.md가 "하지 마/해라"라면, AGENTS.md는 "이 프로젝트는 이렇게 생겼다"이다.

### 권장 구조

```markdown
## Project Overview
SDK 2.0.1 기반 WebView 미니앱 예제 모음.

## Tech Stack
- SDK: @apps-in-toss/web-framework 2.0.1
- Frontend: React 19, TypeScript 5.x, Tailwind CSS 4.x, Zustand 5.x
- Build: ait dev / ait build (granite.config.ts 사용)

## Project Structure
    with-*/       → 단일 기능 SDK 예제
    scenario-*/   → 풀스택 시나리오 예제 (client + server)

## Key Patterns
### 환경 감지
모든 예제는 getOperationalEnvironment() → web | toss | sandbox

### SDK 안전 패턴
1. Dynamic import
2. isSupported() 체크
3. Cleanup 패턴

## Naming Conventions
- 훅: use{Feature}.ts (camelCase)
- 컴포넌트: {Feature}Demo.tsx (PascalCase)
- 스토어: {feature}Store.ts (camelCase)
```

### 작성 원칙

**버전을 명시한다.** React 18과 19에서 생성되는 코드가 다르다.
정확한 버전을 적어야 에이전트가 올바른 코드를 생성한다.

**디렉토리 트리를 보여준다.** 에이전트는 파일 위치를 알아야 한다.
간단한 ASCII 트리가 긴 설명보다 훨씬 유용하다.

**패턴을 문서화하고, 구현은 안 한다.** 패턴을 한 번 보여주면
에이전트가 일관되게 적용한다.

---

## 핵심 차이점

| 관점 | CLAUDE.md | AGENTS.md |
|------|-----------|-----------|
| 목적 | 규칙과 제약 | 맥락과 패턴 |
| 톤 | "하지 마 / 해라" | "이렇게 동작한다" |
| 내용 | NEVER, ALWAYS, CONDITIONAL | 구조, 스택, 컨벤션 |
| 역할 | 강제 (enforcement) | 이해 (understanding) |
| 예시 | "alert() 사용 금지" | "모달은 TDS Dialog 사용" |

두 파일은 함께 동작한다: AGENTS.md가 AI에게 코드베이스를 이해시키고,
CLAUDE.md가 그 안에서 AI가 할 수 있는 것과 없는 것을 제한한다.

---
name: ama
description: >
  앱인토스 풀스택 템플릿 프로젝트의 대화형 온보딩 가이드.
  사용 가능한 모든 스킬(.claude/skills/), Robin SDK 예제(with-*, scenario-*),
  Claude Code 에코시스템 설치법(Superpowers, Ouroboros, OMC),
  CLAUDE.md/AGENTS.md 작성법을 동적으로 스캔하여 안내한다.
  사용자가 궁금한 항목을 선택하면 해당 파일을 읽어 상세 설명을 제공한다.
  "어떤 스킬이 있어?", "뭐부터 해야 해?", "예제 보여줘", "도와줘", "가이드",
  "플러그인 설치", "CLAUDE.md 작성법", "robin 예제" 등의 요청에 트리거된다.
---

# AMA — Ask Me Anything

이 프로젝트의 모든 스킬, 예제, 에코시스템을 대화형으로 안내하는 가이드.
하드코딩된 목록이 아니라 실제 파일을 동적으로 스캔하므로, 프로젝트가 변해도 항상 최신 상태를 반영한다.

**모든 응답은 한국어로 작성한다.**

## 워크플로우

```
Step 1: 스캔 & 표시  →  Step 2: 질문  →  Step 3: 상세 설명  →  Step 4: 반복/종료
(Glob + Read 헤더)      (AskUserQuestion)   (Read 전체 파일)       (추가 질문 또는 끝)
```

### Step 1 — 카탈로그 스캔 및 표시

런타임에 동적으로 카탈로그를 구성한다. 아래 카테고리 구분은 구조 가이드일 뿐,
실제 데이터는 반드시 파일 시스템에서 읽어온다.

**1a. 스킬 스캔**

`Glob(".claude/skills/*/SKILL.md")` 실행. 각 결과의 처음 15줄을 읽어
YAML frontmatter의 `description`을 추출한다. 아래 카테고리로 분류:

| 카테고리 | 이름 패턴 |
|---------|----------|
| 앱인토스 SDK | `appintoss-*` |
| Harness 워크플로우 | `harness-*` |
| Superpowers | `superpower-*`, `using-superpowers` |
| 웹 개발 | 그 외 전부 |

번호가 매겨진 표로 출력: `| # | 스킬 | 명령어 | 설명 |`

**1b. Robin 예제 스캔**

`Glob("apps-in-toss-examples-robin/with-*/README.md")` 와
`Glob("apps-in-toss-examples-robin/scenario-*/README.md")` 실행.
각 README의 3번째 줄 (`> 설명` 라인)을 읽어 한줄 요약을 추출한다.

두 개의 하위 표로 출력:
- `with-*` — 단일 SDK 기능 예제
- `scenario-*` — 풀스택 (client + server) 시나리오 예제

**1c. 에코시스템 가이드 메뉴 표시**

아래 짧은 메뉴를 출력한다 (상세 내용은 reference 파일에 있음):

```
에코시스템 가이드:
  A. CLAUDE.md 작성 베스트 프랙티스
  B. AGENTS.md 작성 베스트 프랙티스
  C. 플러그인 설치법 (Superpowers / Ouroboros / OMC)
  D. 에이전트 세트 (VoltAgent / Agency Agents)
```

### Step 2 — 사용자에게 궁금한 항목 질문

`AskUserQuestion`으로 아래 옵션을 제시:

- **"SDK 스킬 상세"** — 특정 appintoss-* 스킬 설명
- **"Robin 예제 상세"** — 특정 with-*/scenario-* 예제 설명
- **"에코시스템 가이드"** — CLAUDE.md, AGENTS.md, 플러그인 설치, 에이전트 세트
- (사용자가 "Other"로 이름이나 키워드를 직접 입력할 수도 있음)

### Step 3 — 선택에 따른 상세 설명

**스킬 선택 시:**
1. 해당 스킬의 `SKILL.md` 전체를 읽는다
2. 요약: 목적, 핵심 기능 (3-5개), 트리거 키워드, 사용 예시
3. 관련 스킬이 있으면 함께 안내

**Robin 예제 선택 시:**
1. 해당 예제의 `README.md`를 읽는다
2. `Glob`으로 예제 디렉토리의 파일 구조를 확인한다
3. 사용된 SDK 패턴, 환경 감지 방식, 핵심 코드를 설명한다
4. `with-*`(단일 기능, 클라이언트만)인지 `scenario-*`(풀스택, Express 서버 포함)인지 구분

**에코시스템 가이드 선택 시:**
적절한 reference 파일을 읽어 내용을 안내:

- CLAUDE.md / AGENTS.md → [references/writing-guide.md](references/writing-guide.md) 참조
- 플러그인 설치 / 에이전트 세트 → [references/ecosystem-setup.md](references/ecosystem-setup.md) 참조

### Step 4 — 계속 또는 종료

상세 설명 후, `AskUserQuestion`으로 추가 질문이 있는지 묻는다:
- 추가 질문 있음 → Step 2로 복귀
- "끝" / "done" → 세션 종료

## Reference 파일

사용자가 요청할 때만 로드되는 상세 가이드.
메인 스킬을 가볍게 유지하면서 필요 시 깊은 정보를 제공한다.

- **[references/writing-guide.md](references/writing-guide.md)** — CLAUDE.md와 AGENTS.md 작성법, 구조 템플릿, 핵심 원칙
- **[references/ecosystem-setup.md](references/ecosystem-setup.md)** — Superpowers, Ouroboros, OMC 설치 단계별 가이드. OMC의 글로벌 CLAUDE.md 덮어쓰기 주의사항 포함

## 참고 사항

- 모든 플러그인/에이전트 설치 명령어는 **Claude Code CLI 전용**. Lovable, Cursor, Windsurf 등 타 IDE에서는 동작하지 않는다.
- Robin 예제는 `@apps-in-toss/web-framework` SDK 2.0.1 기반이며, dynamic import + `isSupported()` 체크 패턴을 사용한다.
- 비게임 미니앱은 TDS (Toss Design System) 적용이 심사 통과에 필요하다.

# Claude Code 에코시스템 설치 가이드

## 목차
- 플러그인 설치 개요
- Superpowers (초보자 추천)
- Ouroboros (스펙 결정화)
- OMC — Oh-My-ClaudeCode (고급 오케스트레이션)
- 에이전트 세트 (플러그인 없이 사용)
- 중요 참고사항

> **Claude Code 전용** — 아래 설치 명령어는 Claude Code CLI에서만 동작한다.
> Lovable, Cursor, Windsurf 등 타 IDE/플랫폼에서는 해당되지 않는다.

---

## 플러그인 설치 개요

| 플러그인 | 난이도 | 용도 |
|---------|--------|------|
| **Superpowers** | 초급 | 브레인스토밍, 계획 수립, 디버깅, TDD, 코드리뷰 |
| **Ouroboros** | 중급 | 모호한 요구사항을 명확한 스펙으로 결정화 |
| **OMC** | 고급 | 멀티에이전트 오케스트레이션, 병렬 실행 |

처음이라면 Superpowers부터 시작하라. 대부분의 워크플로우를 커버하며 부작용이 없다.

---

## Superpowers

가장 간단하고 범용적인 플러그인. 브레인스토밍, 계획 작성, 계획 실행,
체계적 디버깅, TDD, 코드리뷰를 위한 구조화된 워크플로우를 제공한다.

### 설치법

```bash
# 방법 1: 공식 레지스트리 (가장 간단)
/plugin install superpowers@claude-plugins-official

# 방법 2: 마켓플레이스 경유
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

### 설치 후 사용 가능한 스킬

- `/superpower-brainstorming` — 체계적 아이디어 생성
- `/superpower-writing-plans` — 구현 계획 작성
- `/superpower-executing-plans` — 단계별 계획 실행
- `/superpower-systematic-debugging` — 근본 원인 분석 워크플로우

---

## Ouroboros

소크라테스식 질문을 통해 모호한 아이디어를 정확한 스펙으로 변환한다.
"뭘 만들고 싶은지는 아는데 정확히 어떻게 해야 할지 모르겠을 때" 유용하다.

### 설치법

```bash
# 터미널에서 (Claude Code 채팅이 아닌 터미널):
claude plugin marketplace add Q00/ouroboros
claude plugin install ouroboros@ouroboros
```

### 초기 설정 (Claude Code 채팅에서)

```
ooo setup
```

### 사용법

```
ooo interview "출석체크 미니앱을 만들고 싶어"
```

인터뷰어가 모호함이 충분히 줄어들 때까지 질문을 이어가고,
최종적으로 구조화된 스펙 문서를 생성한다.

---

## OMC — Oh-My-ClaudeCode

고급 멀티에이전트 오케스트레이션 레이어. autopilot, ralph loop,
ultrawork 병렬 실행, 팀 조정 등 다양한 전문 에이전트를 제공한다.

### 설치법

```bash
# Claude Code 채팅에서:
/plugin marketplace add https://github.com/Yeachan-Heo/oh-my-claudecode
/plugin install oh-my-claudecode
/omc-setup
```

### 설치 범위 선택 — 반드시 주의!

`/omc-setup` 실행 시 **"유저스코프(글로벌)"** vs **"프로젝트 스코프"** 선택 질문이 나온다.

**유저스코프를 선택하면:**
- 기존 글로벌 `~/.claude/CLAUDE.md`가 **OMC 전용으로 완전히 덮어씌워진다**
- 기존에 작성해둔 커스텀 규칙과 지시사항이 전부 사라진다
- 백업 없이는 복구할 수 없다

**권장 방법:**
- **프로젝트 스코프**를 선택하여 글로벌 CLAUDE.md를 보존하라
- 또는 설치 전에 `~/.claude/CLAUDE.md`를 백업해두라
- 설치 과정에서 나오는 각 질문을 꼼꼼히 읽고 응답하라

**결론:** 처음 시작한다면 Superpowers만으로 충분하다.
OMC는 고급 오케스트레이션이 필요할 때만 설치하라.

---

## 에이전트 세트 (플러그인 없이 사용)

플러그인 설치 없이 서브에이전트만 추가하고 싶다면,
에이전트 정의 파일을 `.claude/agents/`에 직접 넣으면 된다.

### 옵션 1: VoltAgent (추천)

저장소: `https://github.com/VoltAgent/awesome-claude-code-subagents`

코드리뷰, 아키텍처, 테스팅, 디버깅 등 전문 에이전트가 모여 있는 컬렉션.

### 옵션 2: Agency Agents

저장소: `https://github.com/msitarzewski/agency-agents`

다른 전문 분야에 특화된 에이전트 세트.

### 사용법

1. 저장소에서 에이전트 파일을 클론/다운로드
2. `.md` 에이전트 정의 파일을 프로젝트의 `.claude/agents/` 디렉토리에 복사
3. Claude Code에서 바로 사용 가능

---

## 중요 참고사항

- 플러그인 명령어 (`/plugin install`, `/plugin marketplace`)는
  **Claude Code CLI 전용**이다. Lovable, Cursor, Windsurf 등 타 IDE에서는 동작하지 않는다.
- 에이전트 정의 파일 (`.claude/agents/*.md`)은 Claude Code의
  에이전트 시스템을 지원하는 모든 환경에서 사용 가능하다.
- 플러그인 조합 가능: Superpowers + Ouroboros는 함께 잘 동작한다.
  OMC 추가는 선택 사항이며 복잡도가 올라간다.

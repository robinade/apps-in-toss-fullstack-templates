# Harness Engineering 가이드

> 이 보일러플레이트에 적용된 harness engineering의 설계 철학, 구성 요소, 사용법을 설명한다.

## 설계 철학

### "나중에 검증이 아니라, 처음부터 반려당하지 않게"

일반적인 개발 워크플로우:
```
개발 → 완성 → 검수 제출 → 반려 → 수정 → 재제출 → ...
```

Harness Engineering 워크플로우:
```
반려방지 초기화 → 규칙 내재화 구현 → 기능별 즉시 검증 → 최종 확인 → 통과
```

핵심 차이점은 **심사 규칙이 사후 체크리스트가 아니라 워크플로우 자체에 내장**되어 있다는 것이다.

### Anthropic Harness 패턴

[Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)에서 영감을 받은 패턴:

1. **점진적 구현**: 세션당 하나의 기능만 작업
2. **상태 문서화**: `feature_list.json` + `claude-progress.txt`로 세션간 상태 유지
3. **롤백 가능성**: git 커밋 기반으로 문제 시 안전하게 되돌리기
4. **자동 검증**: 각 기능 완료 시 규칙 대비 자동 체크

## 3-레이어 구조

### Layer 1: 기본 (CLAUDE.md + Skills)

**플러그인 없이** clone만으로 동작하는 핵심 harness:

| 구성 요소 | 역할 |
|-----------|------|
| `CLAUDE.md` | NEVER/ALWAYS 규칙 + Harness Workflow 정의 |
| `/harness-workflow` | 7단계 워크플로우 마스터 스킬 |
| `/harness-init` | 반려방지 프로젝트 초기화 |
| `/harness-progress` | 점진적 구현 + 세션간 상태 추적 |
| `/harness-validate` | NEVER/ALWAYS 규칙 자동 검증 |
| `/appintoss-*` (7개) | 기존 기능별 구현 가이드 |

### Layer 2: superpowers (권장)

[obra/superpowers](https://github.com/obra/superpowers) 플러그인을 설치하면
TDD, 코드리뷰, 체계적 계획 수립 등 추가 워크플로우를 사용할 수 있다.

**설치:**

```bash
# Claude Code 터미널에서
claude plugin marketplace add obra/superpowers-marketplace
claude plugin install superpowers@superpowers-marketplace
```

**harness와의 시너지:**
- `/superpowers:writing-plans` → 기능별 구현 계획 수립
- `/superpowers:test-driven-development` → TDD 기반 기능 구현
- `/superpowers:verification-before-completion` → 기능 완료 전 검증
- `/superpowers:requesting-code-review` → 기능별 코드 리뷰

### Layer 3: ouroboros (권장)

[Q00/ouroboros](https://github.com/Q00/ouroboros) 플러그인을 설치하면
Socratic 인터뷰 → 스펙 결정화 → 실행 → 평가의 진화적 루프를 사용할 수 있다.

**설치:**

```bash
# 터미널에서
claude plugin marketplace add Q00/ouroboros
claude plugin install ouroboros@ouroboros

# Claude Code 세션에서
ooo setup
```

**harness와의 시너지:**
- `ooo interview` → 1단계(요구사항 정의)에서 체계적 요구사항 수집
- `ooo seed` → 요구사항을 구조화된 스펙으로 결정화
- `ooo evaluate` → 구현 결과 품질 평가

## 7단계 워크플로우 상세

### Quick Start

```
# 1. 보일러플레이트 clone
git clone <this-repo> my-mini-app
cd my-mini-app

# 2. Claude Code 시작
claude

# 3. 워크플로우 시작
> "출석체크 미니앱을 만들고 싶어"
# → /harness-workflow가 자동 호출되어 7단계 가이드 시작
```

### 단계별 흐름도

```
┌─────────────────┐
│ 1. 요구사항 정의 │ ← ooo interview (선택)
└────────┬────────┘
         ▼
┌─────────────────┐
│ 2. 초기화       │ ← /harness-init (필수)
│  granite.config │    반려방지 세팅 자동 생성
│  viewport       │
│  브랜딩         │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 3. SDK 블록 선택│ ← robin 예제 카탈로그 참조
│  with-* 조합    │    /appintoss-* 스킬 호출
└────────┬────────┘
         ▼
┌─────────────────┐
│ 4. TDS 디자인   │ ← /appintoss-tds-mobile (비게임 필수)
└────────┬────────┘
         ▼
┌─────────────────┐
│ 5. 점진적 구현  │ ← /harness-progress (반복)
│  세션당 1기능   │    feature_list.json 추적
│  progress 추적  │    git commit 기반 롤백
└────────┬────────┘
         ▼
┌─────────────────┐
│ 6. 검증 루프    │ ← /harness-validate (반복)
│  NEVER 체크     │    위반 → 수정 → 재검증
│  ALWAYS 체크    │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 7. 최종 심사    │ ← /appintoss-nongame-launch-checklist
│  11단계 검수    │
└─────────────────┘
```

## FAQ

**Q: superpowers/ouroboros 없이도 사용할 수 있나요?**
A: 네. Layer 1(CLAUDE.md + Skills)만으로 핵심 워크플로우가 동작합니다.

**Q: 게임 미니앱에도 적용되나요?**
A: 네. 4단계(TDS)만 선택사항이고 나머지는 동일하게 적용됩니다.

**Q: 기존 프로젝트에도 적용할 수 있나요?**
A: `/harness-workflow`가 프로젝트 상태를 자동 감지하여 적절한 단계부터 시작합니다.

## 참고 자료

- [Anthropic: Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [obra/superpowers](https://github.com/obra/superpowers) — Claude Code 스킬/워크플로우 시스템
- [Q00/ouroboros](https://github.com/Q00/ouroboros) — Socratic interview + evolutionary loop
- `docs/effective-harnesses-for-long-running-agents.md` — Anthropic 블로그 한국어 번역

---
name: harness-progress
description: >
  앱인토스 미니앱 점진적 구현 + 세션간 상태 추적 스킬.
  Anthropic harness 패턴: 세션당 1기능, feature_list.json 기반 추적,
  claude-progress.txt 업데이트, git 커밋 기반 롤백 가능성 보장.
  Triggers: "진행상황", "다음 기능", "progress", "next feature",
  "어디까지 했지", "이어서", "continue", "resume"
---

# 점진적 구현 + Progress 추적

> Anthropic harness 패턴: **세션당 하나의 기능만 구현한다.**

## 세션 시작 프로토콜

이 스킬이 호출되면 **반드시** 다음 순서를 따른다:

### 1. 현재 상태 파악

```bash
# 1-1. 작업 디렉토리 확인
pwd

# 1-2. 진행 기록 읽기
cat claude-progress.txt

# 1-3. 기능 목록 읽기
cat feature_list.json

# 1-4. 최근 커밋 확인
git log --oneline -10
```

### 2. 진행 상태 표시

```
═══════════════════════════════════════════
 📊 진행 상태
═══════════════════════════════════════════
 완료: {{completed}}/{{total}} 기능
 현재 세션: #{{session_number}}

 [✅] F001: 프로젝트 초기 세팅
 [✅] F002: 토스 로그인 구현
 [🔄] F003: 보상형 광고 연동       ← 이번 세션
 [ ] F004: 출석 캘린더 UI
 [ ] F005: 포인트 리워드 지급
═══════════════════════════════════════════
```

### 3. 다음 기능 선택

`feature_list.json`에서 `passes: false`인 **첫 번째 기능**을 선택한다.
이미 진행 중인 기능(`🔄`)이 있으면 그것을 계속한다.

**절대 2개 이상의 기능을 동시에 작업하지 않는다.**

### 4. 기능 구현

선택된 기능의 `steps`를 순서대로 구현한다.

구현 시 반드시 준수할 규칙:
- **SDK Safety Pattern**: Dynamic import + isSupported 체크 (CLAUDE.md 참조)
- **NEVER 규칙**: alert() 금지, 자체 헤더 금지, 앱 시작 시 로그인 금지 등
- **ALWAYS 규칙**: 네비게이션바 설정, 브랜딩 통일 등
- **관련 스킬 호출**: 로그인 → `/appintoss-login`, 광고 → `/appintoss-rewarded-ad` 등

**robin 예제 참조**: `apps-in-toss-examples-robin/with-{{feature}}/` 디렉토리에서 패턴을 참조한다.

### 5. 기능 완료 처리

기능 구현이 완료되면:

#### 5-1. feature_list.json 업데이트

해당 기능의 `passes`를 `true`로 변경:

```json
{
  "id": "F003",
  "category": "ads",
  "description": "보상형 광고 연동",
  "steps": ["loadFullScreenAd 구현", "showFullScreenAd 구현", "보상 콜백 처리"],
  "passes": true
}
```

#### 5-2. claude-progress.txt 업데이트

```text
### Session {{N}} — {{현재날짜}}
- F003: 보상형 광고 연동 완료
  - loadFullScreenAd + showFullScreenAd 구현
  - userEarnedReward 콜백 처리
  - 웹 환경 mock 동작 구현
- 다음 작업: F004 출석 캘린더 UI
```

#### 5-3. Git 커밋

```bash
git add -A
git commit -m "feat(F003): 보상형 광고 연동 완료"
```

커밋 메시지 형식: `feat(F{{NNN}}): {{기능 설명}}`

### 6. 세션 종료

한 기능이 완료되면 세션을 종료하고 다음 세션에서 `/harness-progress`를 다시 호출한다.

만약 기능 구현 도중 컨텍스트가 부족해지면:
1. 현재까지의 작업을 커밋
2. `claude-progress.txt`에 **미완성 상태와 남은 작업**을 상세히 기록
3. 다음 세션에서 이어서 진행

```text
### Session {{N}} — {{현재날짜}} (미완성)
- F003: 보상형 광고 연동 — 진행 중
  - ✅ loadFullScreenAd 구현 완료
  - ❌ showFullScreenAd 미구현
  - ❌ 보상 콜백 미처리
- 다음 세션에서 F003 계속
```

## feature_list.json 스키마

```json
{
  "project": "string — 프로젝트 이름",
  "created": "string — 생성 날짜 (YYYY-MM-DD)",
  "features": [
    {
      "id": "string — F001 형식",
      "category": "string — infrastructure|auth|ads|payment|share|media|ui|logic",
      "description": "string — 기능 설명",
      "steps": ["string[] — 구현 단계 목록"],
      "passes": "boolean — 완료 여부 (에이전트만 수정 가능)"
    }
  ]
}
```

## 롤백 전략

문제가 발생하면 git을 활용하여 안전하게 롤백한다:

```bash
# 마지막 기능 구현 전으로 롤백
git log --oneline -5
git revert HEAD

# feature_list.json에서 해당 기능 passes를 false로 되돌리기
# claude-progress.txt에 롤백 기록 추가
```

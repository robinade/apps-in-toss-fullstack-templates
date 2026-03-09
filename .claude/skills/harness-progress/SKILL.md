---
name: harness-progress
description: >
  앱인토스 미니앱 점진적 구현 관리자. Anthropic harness 패턴을 적용하여 세션당 하나의
  기능만 집중 구현하고, feature_list.json과 claude-progress.txt로 세션 간 상태를 추적한다.
  컨텍스트 한계 안에서 품질을 유지하면서 복잡한 미니앱을 안정적으로 완성하는 핵심 도구.
  Use when: (1) 다음 구현할 기능 선택, (2) 이전 세션 이어서 작업,
  (3) 현재 진행 상황 확인, (4) 기능 구현 완료 후 상태 업데이트,
  (5) 새 세션을 시작하면서 어디까지 했는지 파악할 때.
  Make sure to use this skill whenever the user asks about progress, wants to continue
  work from a previous session, or needs to implement the next feature in sequence.
  Triggers: "진행상황", "다음 기능", "progress", "next feature",
  "어디까지 했지", "이어서", "continue", "resume", "다음 작업",
  "현재 상태", "뭐 해야돼", "what's next", "이전 작업".
---

# 점진적 구현 + 세션 간 상태 추적

AI 에이전트의 컨텍스트 윈도우는 유한하다. 한 세션에서 5개 기능을 동시에 구현하면
각 기능의 품질이 떨어지고, 문제 발생 시 어디서 잘못됐는지 추적이 어렵다.

Anthropic의 harness 패턴은 이 문제를 해결한다:
- **세션당 1기능**: 집중도 유지, 깊은 구현 품질 보장
- **JSON 기반 추적**: feature_list.json으로 기계적 상태 관리
- **자연어 기록**: claude-progress.txt로 다음 세션에 컨텍스트 전달
- **git 기반 롤백**: 기능별 커밋으로 문제 시 안전하게 되돌리기

---

## 세션 시작 프로토콜

스킬 호출 시 아래 순서로 현재 상태를 파악한다.

### 1. 상태 파일 읽기

`claude-progress.txt`와 `feature_list.json`을 읽고, git log 최근 10개를 확인한다.
이 세 가지로 이전 세션의 작업 내용, 미완성 기능, 마지막 커밋을 파악할 수 있다.

### 2. 진행 상태 표시

사용자에게 전체 진행 상황을 보여준다 — 완료된 기능, 진행 중인 기능, 남은 기능.
진행 중(`passes: false`)인 첫 번째 기능이 이번 세션의 작업 대상이다.

### 3. 작업 대상 결정

- `claude-progress.txt`에 "미완성" 또는 "진행 중"으로 기록된 기능이 있으면 → 이어서 진행
- 없으면 → `feature_list.json`에서 `passes: false`인 첫 번째 기능 선택

한 세션에서 여러 기능을 동시에 작업하지 않는다.
작은 기능이라도 완료 → 커밋 → 상태 업데이트 순서를 지킨다.

---

## 기능 구현 가이드라인

### SDK Safety Pattern

모든 `@apps-in-toss/web-framework` 호출은 CLAUDE.md에 정의된 패턴을 따른다:
```
Dynamic import → isSupported() 체크 → 사용 → cleanup
```
Static import를 사용하면 웹 환경에서 크래시하고, 심사에서도 반려된다.

### 관련 스킬 활용

구현하는 기능에 대응하는 전용 스킬이 있으면 호출한다:
- 로그인 → `/appintoss-login`
- 보상형 광고 → `/appintoss-rewarded-ad`
- 배너 광고 → `/appintoss-banner-ad`
- 포인트 리워드 → `/appintoss-promotion-reward`
- TDS 디자인 → `/appintoss-tds-mobile`

### robin 예제 참조

`apps-in-toss-examples-robin/with-{{feature}}/` 디렉토리에 프로덕션 품질의
레퍼런스 코드가 있다. 구현 전에 해당 예제의 패턴을 참조한다.

---

## 기능 완료 처리

기능 구현이 끝나면 세 가지를 업데이트한다.

### 1. feature_list.json

해당 기능의 `passes`를 `true`로 변경한다.

### 2. claude-progress.txt

세션 기록을 추가한다. 핵심은 **다음 세션의 에이전트가 읽고 바로 이해할 수 있게**
작성하는 것이다:

```text
### Session N — YYYY-MM-DD
- F003: 보상형 광고 연동 완료
  - loadFullScreenAd + showFullScreenAd 구현
  - userEarnedReward 콜백으로 보상 처리
  - 웹 환경 mock 동작 확인
- 다음 작업: F004 출석 캘린더 UI
```

### 3. Git 커밋

커밋 메시지 형식: `feat(F{{NNN}}): {{기능 설명}}`

기능별로 커밋하면 문제 발생 시 `git revert`로 해당 기능만 되돌릴 수 있다.
여러 기능을 하나의 커밋에 섞으면 롤백이 어려워진다.

---

## 미완성 세션 처리

컨텍스트가 부족해지거나 세션이 끊기면:

1. 현재까지의 작업을 커밋한다
2. `claude-progress.txt`에 **미완성 상태와 남은 작업을 구체적으로** 기록한다
3. `feature_list.json`의 `passes`는 `false`로 유지한다

```text
### Session N — YYYY-MM-DD (미완성)
- F003: 보상형 광고 연동 — 진행 중
  - ✅ loadFullScreenAd 구현 완료
  - ✅ showFullScreenAd 구현 완료
  - ❌ userEarnedReward 콜백 미처리
  - ❌ 웹 환경 mock 미구현
- 다음 세션에서 F003의 남은 작업부터 계속
```

구체적으로 뭘 했고 뭐가 남았는지 기록해야 다음 세션에서 중복 작업 없이 이어갈 수 있다.

---

## 트러블슈팅

| 상황 | 해결 |
|------|------|
| feature_list.json이 없음 | `/harness-init`을 먼저 실행하여 프로젝트 초기화 |
| claude-progress.txt가 없음 | 새로 생성하고 현재 상태를 기록 |
| feature_list.json과 실제 코드 상태 불일치 | 코드를 기준으로 feature_list.json 동기화 |
| 이전 세션이 미완성으로 끝남 | progress 기록을 읽고 남은 작업부터 이어서 진행 |
| 기능 구현 후 버그 발견 | `git revert`로 해당 커밋 되돌리고, `passes`를 `false`로 변경 후 재구현 |

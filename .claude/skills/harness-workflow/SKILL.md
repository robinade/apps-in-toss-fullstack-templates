---
name: harness-workflow
description: >
  앱인토스 미니앱 개발의 전체 라이프사이클을 관리하는 마스터 워크플로우.
  토스 심사 반려를 구조적으로 방지하면서 7단계로 미니앱을 완성한다.
  프로젝트 상태를 자동 감지하여 신규/진행중/완료 어디서든 적절한 단계부터 시작.
  Use when: (1) 새 앱인토스 미니앱 프로젝트 시작, (2) 기존 미니앱 개발 재개,
  (3) 미니앱 개발 전체 흐름 안내, (4) 어디서부터 시작해야 할지 모를 때,
  (5) 심사 통과를 위한 체계적 개발이 필요할 때.
  Make sure to use this skill whenever the user mentions 미니앱 만들기, 앱 개발,
  harness, 워크플로우, 프로젝트 시작, "어디서부터", or asks about the development
  process for AppsInToss apps, even if they don't explicitly say "harness".
  Triggers: "새 미니앱", "미니앱 만들기", "new mini-app", "harness", "워크플로우",
  "workflow", "앱 만들기", "프로젝트 시작", "start project", "어디서부터",
  "앱인토스 개발", "미니앱 개발 시작", "앱 만들고 싶어", "토스 앱 만들기".
---

# 앱인토스 Harness Workflow

토스 미니앱 심사는 UI, 인증, 외부 연결 등 수십 가지 규칙을 검수한다.
완성 후 심사에서 반려당하면 수정 비용이 크기 때문에, 이 워크플로우는
**개발 시작 시점부터 심사 규칙을 내재화**하여 반려 가능성을 원천 차단한다.

## 프로젝트 상태 감지

스킬 호출 시 파일 존재 여부로 현재 상태를 판단하고 적절한 단계로 진입한다.

| 감지 조건 | 상태 | 진입 단계 |
|-----------|------|----------|
| `granite.config.ts` 없음 | 신규 | 1단계 |
| `granite.config.ts` 있음 + `feature_list.json` 없음 | 초기화만 완료 | 3단계 |
| `feature_list.json`에 `passes: false` 항목 존재 | 구현 진행중 | 5단계 |
| `feature_list.json`의 모든 항목 `passes: true` | 구현 완료 | 6단계 |

`claude-progress.txt`가 있으면 함께 읽어서 이전 세션 컨텍스트를 파악한다.

---

## 7단계 워크플로우

### 1단계: 요구사항 정의

사용자에게 세 가지를 확인한다:
- 어떤 미니앱을 만드는지 (출석체크, 복권, 미션 등)
- 게임 / 비게임 여부 (비게임이면 TDS 디자인 시스템 필수)
- 핵심 기능 (로그인, 광고, 결제, 공유, 카메라 등)

ouroboros 플러그인이 있으면 `ooo interview`로 더 체계적인 요구사항 수집이 가능하다.

### 2단계: 반려방지 초기화 → `/harness-init`

이 단계를 건너뛰면 나중에 viewport, 네비게이션바, 브랜딩 불일치 등으로 반려된다.
`/harness-init`이 granite.config.ts, index.html 메타태그, 인트로 화면 패턴,
feature_list.json, claude-progress.txt를 한 번에 생성한다.

### 3단계: SDK 블록 선택

`apps-in-toss-examples-robin/` 카탈로그에서 필요한 블록을 선택한다.
각 `with-*` 디렉토리에 프로덕션 품질의 레퍼런스 코드가 있다.

| 카테고리 | 블록 | 언제 필요한가 |
|----------|------|-------------|
| 인증 | `with-app-login` | 사용자 식별이 필요한 대부분의 앱 |
| 광고 | `with-rewarded-ad`, `with-banner-ad` | 광고 수익화 |
| 결제 | `with-in-app-purchase` | 유료 아이템/서비스 |
| 공유 | `with-share-link`, `with-share-reward` | 바이럴/초대 |
| 미디어 | `with-camera`, `with-album-photos` | 사진/카메라 기능 |
| 위치 | `with-location-once`, `with-location-tracking` | 위치 기반 서비스 |
| UI | `with-navigation-bar`, `with-back-event` | 모든 앱에서 참조 |

선택한 블록을 `feature_list.json`에 기능 항목으로 등록한다.
각 블록에 대응하는 전용 스킬이 있으면 자동 호출한다:
- 로그인 → `/appintoss-login`
- 보상형 광고 → `/appintoss-rewarded-ad`
- 배너 광고 → `/appintoss-banner-ad`
- 포인트 리워드 → `/appintoss-promotion-reward`

### 4단계: TDS 디자인 적용 → `/appintoss-tds-mobile`

비게임 미니앱은 토스 디자인 시스템(TDS)을 적용해야 토스 UX와 일관성을 유지한다.
TDS 미적용 자체가 반려 사유는 아니지만, 토스답지 않은 UI는 심사에서 불리하다.
게임 미니앱은 선택사항.

### 5단계: 점진적 구현 → `/harness-progress`

AI 에이전트의 컨텍스트 한계를 고려한 Anthropic harness 패턴을 적용한다.
한 세션에 여러 기능을 동시에 작업하면 품질이 떨어지고 롤백이 어려워지므로,
세션당 하나의 기능만 집중 구현한다.

`/harness-progress`가 feature_list.json 기반 추적, progress 기록,
git 커밋 관리를 처리한다. 이 단계를 기능 수만큼 반복한다.

### 6단계: 검증 루프 → `/harness-validate`

CLAUDE.md에 정의된 NEVER/ALWAYS/CONDITIONAL 규칙을 코드베이스에서 자동 스캔한다.
위반이 발견되면 수정하고 재검증하는 루프를 모든 항목 통과까지 반복한다.

각 기능 구현 직후에도 실행할 수 있고, 전체 구현 완료 후 최종 점검으로도 실행한다.

### 7단계: 최종 심사 → `/appintoss-nongame-launch-checklist`

11단계 최종 검수 체크리스트. 이 단계를 통과하면 출시 준비 완료.

---

## 자주 쓰는 조합 (레시피)

| 미니앱 유형 | SDK 블록 조합 | 참고 시나리오 |
|------------|-------------|-------------|
| 출석체크 | login + storage + rewarded-ad + promotion | `scenario-attendance-reward` |
| 바이럴 리워드 | login + share-reward + contacts-viral | `scenario-share-viral` |
| 미션/이벤트 | login + storage + promotion + rewarded-ad | `scenario-mission-system` |
| 커머스 | login + in-app-purchase + push-notification | — |
| 콘텐츠/미디어 | login + camera + album-photos + storage | — |

---

## 상태 표시

진행 상황을 사용자에게 보여줄 때 체크리스트 형태로 현재 단계를 표시한다.
5단계에서는 기능별 진행률(완료/전체)도 함께 보여준다.

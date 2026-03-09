---
name: harness-workflow
description: >
  앱인토스 미니앱 개발 harness 워크플로우 마스터 스킬.
  7단계 구조화된 워크플로우를 통해 "처음부터 반려 없이" 미니앱을 개발한다.
  Anthropic harness 패턴(세션당 1기능, progress 추적, 점진적 구현)을 앱인토스에 맞춤 적용.
  Triggers: "새 미니앱", "미니앱 만들기", "new mini-app", "harness", "워크플로우",
  "workflow", "앱 만들기", "프로젝트 시작", "start project"
---

# 앱인토스 Harness Workflow

> 핵심 원칙: **"나중에 검증이 아니라, 처음부터 반려당하지 않게 만든다."**

## 워크플로우 시작

이 스킬이 호출되면 아래 순서로 **프로젝트 상태를 자동 감지**한다:

### 상태 감지

1. `granite.config.ts` 존재 여부 확인
2. `feature_list.json` 존재 여부 확인
3. `claude-progress.txt` 존재 여부 확인
4. git log로 최근 커밋 확인

### 상태별 분기

**Case A: 신규 프로젝트 (granite.config.ts 없음)**
→ "새 미니앱 프로젝트를 시작합니다." 안내 후 **1단계부터** 시작

**Case B: 초기화 완료 (granite.config.ts 있음, feature_list.json 없음)**
→ "프로젝트가 초기화되어 있습니다. 기능 목록을 생성합니다." 안내 후 **3단계부터** 시작

**Case C: 구현 중 (feature_list.json 있음)**
→ `claude-progress.txt`와 `feature_list.json`을 읽고 진행상황 표시 후 **5단계** 계속

**Case D: 구현 완료 (모든 feature passes: true)**
→ "모든 기능이 구현되었습니다. 검증을 시작합니다." 안내 후 **6단계** 진행

## 7단계 상세 가이드

### 1단계: 요구사항 정의

AskUserQuestion으로 질문:

```
1. 어떤 미니앱을 만드시나요? (간단한 설명)
2. 게임인가요, 비게임인가요?
3. 필요한 핵심 기능은? (로그인, 광고, 결제, 공유 등)
```

- ouroboros 플러그인이 설치되어 있으면 `ooo interview`를 권장
- 응답을 바탕으로 필요한 SDK 블록과 시나리오 패턴 결정

### 2단계: 초기화

**반드시 `/harness-init` 스킬을 호출하라.**
이 스킬이 granite.config.ts, 브랜딩, viewport, 반려방지 기본 세팅을 자동 생성한다.

### 3단계: SDK 블록 선택

1단계에서 파악한 요구사항을 바탕으로 `apps-in-toss-examples-robin/` 카탈로그에서 필요한 블록을 선택한다.

**SDK 블록 카탈로그 (robin 예제 기반):**

| 카테고리 | 블록 | 사용 조건 |
|----------|------|----------|
| 인증 | `with-app-login` | 사용자 식별 필요 시 |
| 광고 | `with-rewarded-ad`, `with-banner-ad` | 수익화 필요 시 |
| 결제 | `with-in-app-purchase` | 유료 아이템 판매 시 |
| 공유 | `with-share-link`, `with-share-reward` | 바이럴 필요 시 |
| 미디어 | `with-camera`, `with-album-photos` | 사진/카메라 필요 시 |
| 위치 | `with-location-once`, `with-location-tracking` | 위치 기반 서비스 시 |
| UI | `with-navigation-bar`, `with-back-event` | 항상 참조 |

선택된 블록을 `feature_list.json`에 기능 항목으로 등록한다.

**스킬 자동 호출:**
- 로그인 필요 → `/appintoss-login` 호출
- 광고 필요 → `/appintoss-rewarded-ad` 또는 `/appintoss-banner-ad` 호출
- 리워드 필요 → `/appintoss-promotion-reward` 호출

### 4단계: TDS 디자인 적용

비게임 미니앱은 **반드시** `/appintoss-tds-mobile` 스킬을 호출하여 TDS 디자인 시스템을 적용한다.
게임 미니앱은 선택사항이나 권장한다.

### 5단계: 점진적 구현

**반드시 `/harness-progress` 스킬을 호출하라.**
이 스킬이 세션당 1기능 원칙, progress 추적, 커밋 관리를 자동화한다.

핵심 규칙:
- **세션당 하나의 기능만** 구현
- 매 기능 완료 시 `feature_list.json` 업데이트
- 매 기능 완료 시 `claude-progress.txt` 업데이트
- 설명적 커밋 메시지와 함께 git commit

### 6단계: 기능별 검증 루프

**반드시 `/harness-validate` 스킬을 호출하라.**
이 스킬이 CLAUDE.md의 NEVER/ALWAYS 규칙 대비 자동 위반 탐지를 수행한다.

위반 항목이 발견되면:
1. 위반 내용과 수정 방법 제시
2. 수정 후 재검증
3. 모든 위반 해소될 때까지 반복

### 7단계: 출시 전 최종 심사

**반드시 `/appintoss-nongame-launch-checklist` 스킬을 호출하라.**
11단계 최종 검수를 통과해야 출시 가능하다.

## 워크플로우 상태 표시

현재 진행 상태를 다음 형식으로 표시한다:

```
═══════════════════════════════════════════
 🏗️ 앱인토스 Harness Workflow
═══════════════════════════════════════════
 [✅] 1. 요구사항 정의
 [✅] 2. 초기화 (반려방지 세팅)
 [✅] 3. SDK 블록 선택
 [🔄] 4. TDS 디자인 적용       ← 현재
 [ ] 5. 점진적 구현 (0/5 기능)
 [ ] 6. 기능별 검증 루프
 [ ] 7. 출시 전 최종 심사
═══════════════════════════════════════════
```

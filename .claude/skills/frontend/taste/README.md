---
name: taste-skills-guide
description: Taste Skill 컬렉션 사용법 가이드 (한글). AI가 생성하는 프론트엔드 코드의 디자인 품질을 프리미엄 수준으로 끌어올리는 4개 스킬 모음.
---

# Taste Skill 사용법 가이드

> 출처: [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill)
> AI가 만드는 프론트엔드 코드를 "템플릿 수준"에서 "$150k 에이전시 수준"으로 끌어올리는 스킬 모음

## 스킬 목록

이 폴더에는 4개의 스킬이 포함되어 있습니다:

| 파일 | 스킬 이름 | 용도 |
|------|-----------|------|
| `taste-skill.md` | design-taste-frontend | **메인 스킬.** 새 프로젝트 UI를 처음부터 프리미엄으로 생성 |
| `soft-skill.md` | high-end-visual-design | 고급 에이전시 스타일의 비주얼 디자인 (더블베젤, 스프링 물리, 비대칭 레이아웃) |
| `redesign-skill.md` | redesign-existing-projects | 기존 프로젝트의 디자인을 감사하고 업그레이드 |
| `output-skill.md` | full-output-enforcement | AI가 코드를 생략하거나 축약하지 않도록 강제 |

---

## 1. taste-skill (메인 디자인 스킬)

**언제 사용하나:** 새 페이지, 컴포넌트, 랜딩페이지를 처음부터 만들 때

**핵심 기능:**
- 레이아웃, 타이포그래피, 색상, 간격, 모션, 전체 비주얼 품질을 제어
- AI의 흔한 디자인 편향(센터 정렬, 3칼럼 카드, Inter 폰트 등)을 자동 교정
- Bento 그리드, 마그네틱 버튼, 글래스모피즘 등 고급 패턴 적용

**설정값 (파일 상단에서 조정 가능):**

```
DESIGN_VARIANCE: 8   (1=완벽한 대칭, 10=예술적 비대칭)
MOTION_INTENSITY: 6   (1=정적, 10=시네마틱 애니메이션)
VISUAL_DENSITY: 4     (1=갤러리처럼 여유로움, 10=대시보드처럼 빽빽함)
```

| 값 범위 | DESIGN_VARIANCE | MOTION_INTENSITY | VISUAL_DENSITY |
|---------|-----------------|------------------|----------------|
| 1-3 | 깔끔한 센터 정렬, 표준 그리드 | 거의 없음, hover만 | 넓고 여유로움 |
| 4-7 | 오프셋, 다양한 비율 | 페이드인, 부드러운 스크롤 | 일반 앱/웹 수준 |
| 8-10 | 비대칭, 대담한 여백 | 마그네틱, 스프링 물리 | 빽빽한 대시보드 |

**사용 예시:**
```
이 스킬을 참고해서 SaaS 랜딩페이지를 만들어줘
@taste-skill.md
```

---

## 2. soft-skill (하이엔드 비주얼)

**언제 사용하나:** "비싸 보이는" 디자인이 필요할 때. 에이전시/포트폴리오/럭셔리 브랜드 수준의 UI

**핵심 기능:**
- 3가지 비주얼 아키타입: Ethereal Glass (SaaS/AI), Editorial Luxury (라이프스타일), Soft Structuralism (포트폴리오)
- 3가지 레이아웃 아키타입: Asymmetrical Bento, Z-Axis Cascade, Editorial Split
- "더블베젤(Doppelrand)" 카드 구조: 외부 쉘 + 내부 코어로 물리적 깊이감
- 커스텀 cubic-bezier 트랜지션, 스태거드 리빌 애니메이션

**사용 예시:**
```
포트폴리오 사이트를 럭셔리하게 만들어줘
@soft-skill.md
```

---

## 3. redesign-skill (기존 프로젝트 리디자인)

**언제 사용하나:** 이미 만들어진 웹사이트/앱의 디자인을 개선할 때

**핵심 기능:**
- 기존 코드를 스캔하여 AI 디자인의 흔한 안티패턴을 자동 진단
- 타이포그래피, 색상, 레이아웃, 인터랙티비티, 콘텐츠, 아이콘 등 전체 감사
- 기존 스택을 유지하면서 점진적으로 개선 (프레임워크 교체 없음)

**개선 우선순위 (리스크 최소, 효과 최대 순):**
1. 폰트 교체 — 가장 즉각적인 효과
2. 색상 팔레트 정리 — 과포화/불일치 제거
3. hover/active 상태 추가 — 인터페이스에 생동감
4. 레이아웃 및 간격 조정 — 그리드, max-width, 일관된 패딩
5. 제네릭 컴포넌트 교체 — 클리셰 패턴을 현대적으로
6. 로딩/빈 상태/에러 상태 추가 — 완성도 높이기
7. 타이포그래피 스케일 다듬기 — 프리미엄 마무리

**사용 예시:**
```
현재 프로젝트 UI를 감사하고 개선해줘
@redesign-skill.md
```

---

## 4. output-skill (출력 완전성 강제)

**언제 사용하나:** AI가 코드를 생략하거나 `// ...`, `// rest of code` 같은 축약을 하지 않게 하고 싶을 때

**핵심 기능:**
- `// ...`, `// TODO`, `// similar to above` 등 금지 패턴 차단
- "나머지는 같은 패턴입니다" 같은 프로즈 축약도 차단
- 토큰 한도 접근 시 깔끔한 중단점에서 멈추고 `[PAUSED]` 표시

**사용 예시:**
```
전체 코드를 빠짐없이 작성해줘
@output-skill.md
```

---

## 조합 사용법

여러 스킬을 동시에 적용할 수 있습니다:

```
# 새 프로젝트를 프리미엄으로 + 코드 생략 없이
@taste-skill.md @output-skill.md
SaaS 대시보드 메인 페이지를 만들어줘

# 기존 프로젝트를 리디자인 + 럭셔리하게
@redesign-skill.md @soft-skill.md
현재 랜딩페이지를 감사하고 하이엔드로 업그레이드해줘
```

---

## 공통 금지 패턴 (4개 스킬 공통)

이 스킬들이 AI에게 금지하는 주요 패턴:

- Inter, Roboto, Arial 폰트 사용
- 이모지 사용
- 보라색/네온 AI 그래디언트
- 3칼럼 균등 카드 레이아웃
- `#000000` 순수 검정색
- `h-screen` (iOS Safari 버그) → `min-h-[100dvh]` 사용
- `John Doe`, `Acme Corp` 같은 제네릭 데이터
- "Elevate", "Seamless", "Unleash" 같은 AI 마케팅 클리셰
- Unsplash 깨진 링크 → `picsum.photos` 사용
- `top`, `left` 애니메이션 → `transform`, `opacity`만 허용

---

## 참고

- 원본 저장소: https://github.com/Leonxlnx/taste-skill
- 제작자: [@lexnlin](https://x.com/lexnlin)

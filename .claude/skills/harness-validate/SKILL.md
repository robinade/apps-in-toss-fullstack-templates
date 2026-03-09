---
name: harness-validate
description: >
  앱인토스 미니앱 반려방지 자동 검증 스킬.
  CLAUDE.md의 NEVER/ALWAYS/CONDITIONAL 규칙 대비 코드베이스를 자동 스캔하여
  위반 항목을 탐지하고 수정 방법을 제시한다. 기능 구현 후 즉시 실행 권장.
  Triggers: "검증", "반려 체크", "validate", "심사 점검", "규칙 체크",
  "rule check", "반려 방지", "위반 체크"
---

# 반려방지 자동 검증

> CLAUDE.md의 NEVER/ALWAYS 규칙을 코드에서 자동 탐지한다.

## 검증 프로토콜

이 스킬이 호출되면 아래 **모든 검증 항목**을 순서대로 실행한다.

### NEVER 규칙 검증 (위반 시 심사 반려)

#### N1: alert/confirm/prompt 사용 금지

```bash
# src/ 디렉토리에서 alert(), confirm(), prompt() 호출 검색
grep -rn "alert\s*(" src/ --include="*.tsx" --include="*.ts" || echo "✅ PASS"
grep -rn "confirm\s*(" src/ --include="*.tsx" --include="*.ts" || echo "✅ PASS"
grep -rn "prompt\s*(" src/ --include="*.tsx" --include="*.ts" || echo "✅ PASS"
```

위반 시 수정: `shadcn-ui AlertDialog` 또는 `TDS Dialog`로 교체

#### N2: 자체 헤더/백버튼/햄버거 메뉴 금지

```bash
# 커스텀 헤더 패턴 검색
grep -rn "<header\|<Header\|<AppBar\|<TopBar\|<Navbar" src/ --include="*.tsx" || echo "✅ PASS"
# 커스텀 백버튼 패턴 검색
grep -rn "goBack\|navigate(-1)\|history.back" src/ --include="*.tsx" --include="*.ts" || echo "✅ PASS"
# 햄버거 메뉴 검색
grep -rn "hamburger\|HamburgerMenu\|MenuIcon.*menu" src/ --include="*.tsx" || echo "✅ PASS"
```

위반 시 수정: 모두 제거하고 `granite.config.ts`의 `navigationBar` 설정만 사용

#### N3: 앱 시작 시 바로 로그인 금지

```bash
# useEffect에서 appLogin 직접 호출 검색
grep -rn "useEffect.*appLogin\|useEffect.*login" src/App.tsx src/main.tsx || echo "✅ PASS"
```

위반 시 수정: 인트로/랜딩 화면을 먼저 표시한 후 사용자 액션으로 로그인

#### N4: 외부 앱/브라우저 이동 금지 (핵심 기능)

```bash
# window.open, location.href 등 외부 이동 검색
grep -rn "window\.open\|location\.href\|window\.location" src/ --include="*.tsx" --include="*.ts" || echo "✅ PASS"
```

위반 시 수정: 미니앱 내에서 완결되도록 변경 (법률 고지/공공기관 링크만 예외)

#### N5: 앱 설치 유도 금지

```bash
# 설치 유도 문구 검색
grep -rn "앱.*설치\|앱.*다운로드\|마켓.*링크\|play\.google\|apps\.apple\|앱스토어" src/ --include="*.tsx" --include="*.ts" || echo "✅ PASS"
```

위반 시 수정: 해당 문구/링크 전체 제거

#### N6: Static SDK import 금지

```bash
# @apps-in-toss/web-framework의 static import 검색
grep -rn "^import.*from.*@apps-in-toss/web-framework" src/ --include="*.tsx" --include="*.ts" || echo "✅ PASS"
```

위반 시 수정: `const { api } = await import('@apps-in-toss/web-framework')` 패턴으로 변경

### ALWAYS 규칙 검증 (필수 준수)

#### A1: viewport user-scalable=no

```bash
grep -n "user-scalable=no" index.html || echo "❌ FAIL: index.html에 user-scalable=no 없음"
```

#### A2: navigationBar 설정

```bash
grep -n "withBackButton.*true" granite.config.ts || echo "❌ FAIL: withBackButton 미설정"
grep -n "withHomeButton.*true" granite.config.ts || echo "❌ FAIL: withHomeButton 미설정"
```

#### A3: 브랜딩 통일 (앱 이름 일치)

```bash
# granite.config.ts에서 displayName 추출
BRAND_NAME=$(grep "displayName" granite.config.ts | sed "s/.*'\(.*\)'.*/\1/")
# index.html의 title과 비교
grep -n "$BRAND_NAME" index.html || echo "❌ FAIL: index.html 앱이름 불일치"
```

#### A4: 인트로 화면 존재 여부

```bash
# App.tsx 또는 라우터에서 인트로/온보딩/랜딩 컴포넌트 존재 확인
grep -rn "Intro\|Onboarding\|Landing\|Welcome" src/ --include="*.tsx" || echo "⚠️ WARN: 인트로 화면 미확인"
```

### 검증 결과 리포트

모든 검증 완료 후 다음 형식으로 결과를 출력한다:

```
═══════════════════════════════════════════
 🔍 반려방지 검증 결과
═══════════════════════════════════════════
 NEVER 규칙 (위반 시 반려):
   ✅ N1: alert/confirm/prompt 미사용
   ✅ N2: 자체 헤더/백버튼 없음
   ✅ N3: 앱 시작 시 바로 로그인 안 함
   ❌ N4: 외부 브라우저 이동 발견 (2건)
      → src/pages/Help.tsx:45 — window.open(...)
      → src/pages/Settings.tsx:78 — location.href = ...
   ✅ N5: 앱 설치 유도 없음
   ✅ N6: Static SDK import 없음

 ALWAYS 규칙 (필수 준수):
   ✅ A1: viewport user-scalable=no
   ✅ A2: navigationBar 설정 완료
   ✅ A3: 브랜딩 통일 (앱이름 일치)
   ✅ A4: 인트로 화면 존재

 결과: 1건 위반 (N4)
 📍 위반 수정 후 `/harness-validate` 재실행 필요
═══════════════════════════════════════════
```

### 검증 루프

위반이 발견되면:
1. 위반 항목별 수정 방법 제시 (위 각 항목의 "위반 시 수정" 참조)
2. 수정 구현
3. `/harness-validate` 재실행
4. 모든 항목 ✅ PASS될 때까지 반복

모든 항목이 통과하면:
```
📍 다음 단계: /appintoss-nongame-launch-checklist로 최종 심사 검증
```

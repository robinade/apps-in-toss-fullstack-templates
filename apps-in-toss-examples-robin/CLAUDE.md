# AppsInToss Examples — Claude Code Instructions

## Project Context
SDK 2.0.1 기반 WebView 미니앱 예제 모음. 각 예제는 standalone 프로젝트.

## Rules
- 각 예제는 독립적 — 다른 예제의 코드를 import하지 않음
- 새 예제 생성 시 `_template/` 또는 `_scenario-template/`를 복사하여 시작
- SDK API 호출은 반드시 dynamic import + `isSupported()` 체크
- 웹 환경에서도 동작하는 mock 동작 필수 제공
- Tailwind CSS 4.x 사용 (globals.css에 @import 'tailwindcss')
- granite.config.ts의 appName은 디렉토리명과 일치

## SDK API Reference (공식 문서 URL)
- 광고 로드: loadFullScreenAd — https://developers-apps-in-toss.toss.im/bedrock/reference/framework/광고/loadAppsInTossAdMob.html
- 광고 표시: showFullScreenAd — https://developers-apps-in-toss.toss.im/bedrock/reference/framework/광고/showAppsInTossAdMob.html
- 통합 광고: IntegratedAd — https://developers-apps-in-toss.toss.im/bedrock/reference/framework/광고/IntegratedAd.html
- 배너 광고: BannerAd — https://developers-apps-in-toss.toss.im/bedrock/reference/framework/광고/BannerAd.html
- 공유: contactsViral — https://developers-apps-in-toss.toss.im/bedrock/reference/framework/친구초대/contactsViral.html
- 환경: getOperationalEnvironment()
- 로그인: appLogin — https://developers-apps-in-toss.toss.im/bedrock/reference/framework/로그인/appLogin.html
- 스토리지: Storage.setItem(), Storage.getItem()
- 프로모션: executePromotion — https://developers-apps-in-toss.toss.im/api/executePromotion.html
- 인앱결제: IAP — https://developers-apps-in-toss.toss.im/bedrock/reference/framework/인앱결제/IAP.html
- 권한: permission — https://developers-apps-in-toss.toss.im/bedrock/reference/framework/권한/permission.html
- 뒤로가기: back-event — https://developers-apps-in-toss.toss.im/bedrock/reference/framework/이벤트제어/back-event.html
- 네비게이션바: NavigationBar — https://developers-apps-in-toss.toss.im/bedrock/reference/framework/UI/NavigationBar.html

## Naming Conventions
- 훅: `use{Feature}.ts` (camelCase)
- 컴포넌트: `{Feature}Demo.tsx` (PascalCase)
- 스토어: `{feature}Store.ts` (camelCase)
- 예제 디렉토리: `with-{feature}` (단일), `scenario-{name}` (시나리오)

## SDK Import Pattern (MUST follow)
```typescript
// ✅ CORRECT: Dynamic import + isSupported
const { loadFullScreenAd } = await import('@apps-in-toss/web-framework');
if (loadFullScreenAd.isSupported() !== true) { /* mock */ return; }

// ❌ WRONG: Static import at top level
import { loadFullScreenAd } from '@apps-in-toss/web-framework';
```

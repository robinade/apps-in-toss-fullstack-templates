# AGENTS.md — AppsInToss Examples (Robin Edition)

## Project Overview

SDK 2.0.1 기반 WebView 미니앱 예제 모음. 앱인토스(Toss Mini-App) 플랫폼용.

## Tech Stack

- **SDK**: `@apps-in-toss/web-framework` 2.0.1
- **Frontend**: React 19.2.3, TypeScript 5.x, Tailwind CSS 4.x, Zustand 5.x
- **Build**: `ait dev` / `ait build` (via granite.config.ts)
- **Server** (scenarios only): Express 4.x, better-sqlite3, concurrently

## Project Structure

    _template/           → Single-feature example boilerplate
    _scenario-template/  → Fullstack scenario boilerplate (client + server)
    with-*/              → 23 single-feature SDK examples
    scenario-*/          → 6 fullstack use-case scenario examples
    tds-mobile/          → TDS (Toss Design System) mobile reference

## Key Patterns

### Environment Detection
Every example uses `getOperationalEnvironment()` to detect `web` | `toss` | `sandbox`:
- `web`: Browser dev mode — uses mock data, console.log
- `sandbox`: Toss test environment — uses test ad IDs
- `toss`: Production — uses real SDK APIs

### SDK Safety Pattern (Dynamic Import)
All SDK calls follow this 3-step pattern:

    // Step 1: Dynamic import (bundle size optimization)
    const sdk = await import('@apps-in-toss/web-framework');

    // Step 2: isSupported check (web environment graceful degradation)
    if (sdk.someAPI.isSupported() !== true) { return; }

    // Step 3: cleanup pattern (memory leak prevention)
    const cleanup = sdk.someAPI({ onEvent, onError });
    return () => cleanup?.();

### Standard Hook Interface

    interface UseFeatureReturn {
      status: 'idle' | 'loading' | 'ready' | 'error';
      error: Error | null;
      isSupported: boolean;
      environment: 'web' | 'toss' | 'sandbox';
    }

### DemoLayout (3-section UI)
All examples use `DemoLayout` component with: Header → Status Panel → Action Area → Event Log

## For AI Agents

- Each `with-*` directory is a **standalone** project with its own `package.json`
- Each `scenario-*` directory is a **fullstack** project: run `npm run dev` at root to start both client and server
- **Do NOT** share dependencies between examples — each is independent
- Reference `_template/` or `_scenario-template/` when creating new examples
- All SDK API references: https://developers-apps-in-toss.toss.im/llms.txt

## Commands

    # Single-feature example
    cd with-{feature} && npm install && npm run dev

    # Scenario example (fullstack)
    cd scenario-{name} && npm run install:all && npm run dev

## Official Documentation

- SDK Overview: https://developers-apps-in-toss.toss.im/llms.txt
- Full Docs: https://developers-apps-in-toss.toss.im/llms-full.txt
- 광고 (Ads): https://developers-apps-in-toss.toss.im/ads/develop.html
- 프로모션 (Promotion): https://developers-apps-in-toss.toss.im/promotion/develop.html
- 로그인 (Login): https://developers-apps-in-toss.toss.im/login/develop.html
- 공유리워드 (Share): https://developers-apps-in-toss.toss.im/bedrock/reference/framework/친구초대/contactsViral.html

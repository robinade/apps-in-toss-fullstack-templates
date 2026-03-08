# Lovable Knowledge Section (Copy-Paste This)

아래 내용을 Lovable 프로젝트의 Settings > Custom Knowledge에 붙여넣으세요.

---

## Mandatory Project Rules

This project builds AppsInToss (토스 미니앱). Before writing any code, you MUST read and follow the rule files in `docs/lovable-rules/`. Read ALL of them at the start of every task.

### Reference Files (MUST READ)

| File | Content |
|------|---------|
| `docs/lovable-rules/00-core-workflow.md` | MCP-first policy, default workflow, multi-command rules |
| `docs/lovable-rules/01-slash-commands.md` | All slash commands and stage rules |
| `docs/lovable-rules/02-appintoss-compliance.md` | AppsInToss SDK rules + review compliance (CRITICAL) |
| `docs/lovable-rules/03-frontend-design.md` | Frontend, design, Remotion rules |
| `docs/lovable-rules/04-work-style.md` | Persona, reflection, prohibited actions |

### Critical Inline Rules (Always Apply)

**NEVER:**
- No `alert()`/`confirm()` → custom modal only
- No custom back button/header/hamburger → common nav bar only
- No pinch zoom → `user-scalable=no`
- No `appLogin()` on app start → intro screen first
- No Toss OAuth tokens on client → server-only, issue own JWT
- No external navigation for core features → complete within mini-app
- No app install promotion of any kind
- No share links to own website → `getTossShareLink()`
- No subscription-misleading wording; UI amount = actual charge

**ALWAYS:**
- `navigationBar: { withBackButton: true, withHomeButton: true }`
- App name identical across displayName, title, og:title, console
- SDK: dynamic import + `isSupported()` check, never static import
- Ads: load → show order mandatory
- Every output ends with Reflection

**WORKFLOW:** ref → Exa → Context7 → firecrawl → Synthesize → Reflection

When you see a `/slash command`, it is a mandatory execution trigger — load the corresponding Skill and execute it. Multiple commands run cumulatively.

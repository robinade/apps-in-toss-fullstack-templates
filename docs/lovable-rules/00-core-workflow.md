# Core Workflow & MCP-First Policy

## Core Rules

- Always use the relevant **MCP tools and Skills before answering, designing, or coding**.
- Any `/slash command` is a **mandatory execution trigger**, not plain text.
- If multiple commands appear, **execute all of them cumulatively**, usually in written order.
- If a command needs a prerequisite, **insert that prerequisite automatically**.
- Minimize duplicate MCP calls, but never skip required behavior.
- Every final output must end with **Reflection**.

## MCP-First Policy

Use these first whenever relevant:

| Tool | Purpose |
|------|---------|
| `ref` | Indexed Skills/docs |
| `Exa` | External best practices, examples, patterns |
| `Context7` | Official library/framework docs |
| `firecrawl` | External pages, docs, public resources |

## Default Workflow

1. `ref` → load relevant Skill(s)
2. `Exa` → research best practices
3. `Context7` → verify official docs if libraries/frameworks are involved
4. `firecrawl` → collect extra context from external docs/sites if needed
5. Synthesize and perform the task
6. Add **Reflection**

## Multi-Command Rule

If multiple commands are present, execute all of them and pass earlier outputs into later stages.

Examples:
- `/brainstorming /research /plan` → brainstorm → research → write plan
- `/research /plan /execute` → research → plan → execute
- `/debug /research` → debug systematically + investigate external solutions
- `/design /plan` → define UI direction → document the plan

## Auto-Trigger Rule

Treat the following as `/execute`:
- `plan approved`, `approved`, `approve the plan`
- `implement it`, `build it`, `go ahead`, `execute the plan`

## Workflow Checklist

- Identify slash commands and execution order
- Identify the task stage
- Load Skill(s) with `ref`
- Research with `Exa`
- Gather external context with `firecrawl` if needed
- Verify official docs with `Context7` if needed
- Apply a design Skill for frontend work
- Synthesize all sources
- Verify that MCP/Skill findings are reflected in the result
- Add Reflection

## Never Do

- Never guess APIs or architecture from memory alone
- Never use a library without checking official docs when needed
- Never skip the relevant Skill for the current stage
- Never make production-level decisions without external research

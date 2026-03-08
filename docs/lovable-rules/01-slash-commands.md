# Slash Commands & Stage Rules

## High-Level Commands

### `/brainstorming`
- Use `Skill_Superpower_brainstorming` + `ref` + `Exa`
- Use `Exa` at least twice from different angles
- Provide multiple options with pros/cons, differentiation, difficulty, risk
- End with one recommendation

### `/research`
- Use relevant Skill(s) first + `Exa` + `ref` + `firecrawl` if needed + `Context7` if needed
- Use `Exa` at least twice with different keywords/angles
- Present findings as **evidence → interpretation → implications**

### `/plan`
- Use `Skill_Superpower_writing-plans` + `ref` + `Exa` + `Context7` if needed + `firecrawl` if needed
- No code, Markdown only
- Avoid over-engineering, design only what was requested
- Separate **Presentation / Business Logic**
- Required output: Overview, Detailed use cases, Major modules and responsibilities, `mermaid` diagram, Implementation Plan

### `/execute`
- Use `Skill_Superpower_executing-plans` + `ref` + `Exa` + `Context7`
- Execute against the approved plan when available
- If no plan exists, create a minimal one first
- Verify actual libraries with `Context7`
- Validate and reflect after execution

### `/debug`
- Use `Skill_Superpower_systematic-debugging` + `ref` + `Exa` + `Context7`
- Separate symptoms, reproduction, impact
- Research known issues with `Exa`, verify docs/change history with `Context7`
- Prioritize root causes, propose fixes, include prevention

### `/design`
- Default: `Skill_frontend-design` + `ref` + `Exa` + `Context7` if needed
- Output: UI/UX direction and structure

### `/design/diverge`
- Use `Skill_VS Design Diverge`

### `/design/opus`
- Use `Skill_frontend-for-opus`

### `/remotion`
- Must use BOTH: `Skill_remotion-best-practices_part1` AND `Skill_remotion-best-practices_part2`
- Using only one is not allowed
- Use `ref` + `Exa` + `Context7`

### `/reflect`
- Expand the Reflection section

## Low-Level MCP Commands

| Command | Action |
|---------|--------|
| `/ref` | Force `ref` |
| `/exa` | Force `Exa` |
| `/context7` | Force `Context7` |
| `/firecrawl` | Force `firecrawl` |

If explicitly written, these must not be omitted.

## Development Planning Rule

When designing implementation:
1. Analyze the **current codebase implementation** first
2. Use `firecrawl` to gather as much relevant context as possible
3. Combine internal findings + external research before planning
4. Group business logic and modularize properly
5. Avoid over-engineering
6. Separate **Presentation / Business Logic**
7. Respond in Markdown only, with **no code**

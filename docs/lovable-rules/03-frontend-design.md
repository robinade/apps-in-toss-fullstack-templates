# Frontend, Design & Remotion Rules

## Frontend Rules

If the task includes frontend work, apply a design Skill:

| Command | Skill |
|---------|-------|
| `/design` | `Skill_frontend-design` |
| `/design/diverge` | `Skill_VS Design Diverge` |
| `/design/opus` | `Skill_frontend-for-opus` |

Also combine `Exa` + `Context7` when relevant.

## Remotion Rule

For any Remotion task, **both** must be used:
- `Skill_remotion-best-practices_part1`
- `Skill_remotion-best-practices_part2`

Using only one is **not allowed**.

## Development Planning Rule

When designing implementation:

1. Analyze the **current codebase implementation** first
2. Use `firecrawl` to gather as much relevant context as possible
3. Combine internal findings + external research before planning
4. Group business logic and modularize properly
5. Avoid over-engineering
6. Separate **Presentation / Business Logic**
7. Respond in Markdown only, with **no code**

Required output:
- Overview
- Detailed use cases
- Major modules and responsibilities
- `mermaid` diagram
- Implementation Plan

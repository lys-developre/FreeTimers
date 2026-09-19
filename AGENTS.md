<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## FreeTimers

FreeTimers is a personal, local-first, mobile-first exploration planner. Start
with `docs/README.md`, then read only the canonical documents relevant to the
task.

Non-negotiable rules:

- Deterministic code calculates travel feasibility; the LLM only explains.
- Unknown or stale data is never presented as safe.
- No secrets or personal data enter Git, fixtures, logs, or captures.
- External data is validated and carries provenance and freshness.
- Domain code remains independent of React, Next.js, and providers.
- Critical domain and connector behavior is test-first.
- Product UI copy is Spanish; code and canonical technical docs are English.

Canonical validation:

```text
npm test
npm run lint
npx tsc --noEmit
npm run build
```

Use `docs/protocols/README.md` for Definition of Done and change procedures.

## Product UI

Before creating or substantially changing a user interface, read
`docs/design/README.md` and the canonical documents it links.

FreeTimers is a personal, local-first, mobile-first cartographic planning
instrument. Do not turn it into a generic SaaS dashboard, travel marketplace,
or social feed. Time, return feasibility, uncertainty, and accessibility take
priority over decoration.

Use `.github/instructions/ui.instructions.md` for scoped implementation rules
and the prompt files under `.github/prompts/` for screen design and product UI
review.

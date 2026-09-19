# FreeTimers Copilot instructions

Read `AGENTS.md` before changing this repository. Use `docs/README.md` to locate
canonical product and engineering decisions.

- Preserve the personal, local-first, mobile-first product direction.
- Keep deterministic feasibility outside the LLM.
- Never promote unknown or stale information to safe.
- Never add real secrets or personal data to code, tests, docs, logs, or
  captures.
- Respect domain, application, adapter, and UI boundaries.
- Validate all external and persisted data at runtime.
- Use synthetic fixtures.
- Prefer small, complete vertical changes over speculative infrastructure.
- Do not add dependencies or abstractions without a concrete need.
- Update canonical documentation when behavior or architecture changes.
- Run the smallest relevant tests, lint, typecheck, and build before concluding.

Scoped rules under `.github/instructions/` apply to relevant files. Reusable
workflows under `.github/prompts/` are manual tools, not replacements for tests
or CI.


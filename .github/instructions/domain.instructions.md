---
description: Deterministic domain rules and TDD requirements
applyTo: "src/domain/**/*.{ts,tsx}"
---

# Domain rules

- Keep domain modules pure and independent of React, Next.js, browser APIs,
  storage, HTTP, provider SDKs, and LLMs.
- Represent impossible, unknown, stale, and unsupported states explicitly.
- Use named units for time, distance, money, and coordinates where confusion is
  harmful.
- Write or update behavior-focused tests before changing critical rules.
- Cover boundary equality, cross-day windows, timezones, invalid input, and
  missing data.
- Never let recommendation affinity upgrade deterministic feasibility.
- Follow `docs/data/README.md`, `docs/architecture/README.md`, and
  `docs/protocols/README.md`.


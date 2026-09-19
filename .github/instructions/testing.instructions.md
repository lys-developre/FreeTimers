---
description: Test structure, fixtures, and quality rules
applyTo: "**/*.{test,spec}.{ts,tsx}"
---

# Testing rules

- Test observable behavior, boundaries, and harmful failures.
- Use synthetic deterministic fixtures with no personal data or credentials.
- Do not call live providers in the normal suite.
- Control clock, timezone, randomness, geolocation, and network explicitly.
- Avoid fixed sleeps and implementation-detail assertions.
- Test unknown, stale, partial, offline, denied, timeout, and unsupported states
  where relevant.
- A snapshot is not a substitute for behavioral assertions.
- Follow `docs/testing/README.md`.


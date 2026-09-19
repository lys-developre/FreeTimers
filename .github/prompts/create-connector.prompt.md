---
name: Create an external connector
description: Design and implement a secure provider adapter with contracts and fixtures
agent: agent
---

Create or update an external provider connector.

Before coding:

1. Read `REQUIREMENTS-EXTERNAL.md`, `docs/architecture/README.md`,
   `docs/security/README.md`, `docs/data/README.md`, and
   `docs/testing/README.md`.
2. Confirm license, attribution, quotas, credentials, privacy impact, coverage,
   and provider terms.
3. Define a provider-independent port and normalized result.
4. Define timeout, cancellation, retry, rate, cache, expiry, payload, and
   no-coverage behavior.
5. Identify whether the call must be server-only.
6. Create synthetic or legally reusable fixtures.

Implement contract tests first. Validate all provider responses. Do not convert
provider failure into an empty result. Update `.env.example`, external
requirements, and attribution documentation when applicable.


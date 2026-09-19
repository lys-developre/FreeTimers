---
name: Pre-integration security check
description: Review a proposed external integration before credentials or personal data are introduced
agent: agent
---

Perform a security-focused review before enabling a real provider.

Read `docs/security/README.md`, `docs/data/README.md`,
`docs/architecture/README.md`, `docs/protocols/README.md`, and
`REQUIREMENTS-EXTERNAL.md`.

Check:

- Trust boundaries and data flow.
- Public versus server-only configuration.
- SSRF, XSS, injection, prompt injection, and quota abuse.
- Runtime validation and payload limits.
- Location/calendar minimization.
- Logging and browser artifacts.
- Cache freshness and failure claims.
- Dependency and license risk.
- Revocation and provider disablement.

Report findings by severity and confidence. Do not add credentials. If fixes are
requested, implement the smallest verified changes and update the threat model.


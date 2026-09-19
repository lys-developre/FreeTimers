---
name: Create an architecture decision
description: Record a significant decision with alternatives, consequences, and reversal strategy
agent: agent
---

Determine whether the requested choice is cross-cutting, expensive to reverse,
or changes a security/privacy boundary. If not, document it near the relevant
code or canonical document instead of creating an ADR.

For a valid ADR:

1. Inspect existing ADR numbering.
2. Use `docs/architecture/decisions/README.md`.
3. Describe context without assuming the decision.
4. Compare credible alternatives.
5. Record the decision and why it fits current requirements.
6. Include consequences, security/privacy impact, and reversal strategy.
7. Link affected canonical documentation.

Do not fabricate benchmarks or claim implementation is complete.


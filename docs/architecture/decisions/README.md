# Architecture decision records

**Status:** Active

**Last reviewed:** 2026-09-19

[Architecture](../README.md) · [Documentation index](../../README.md)

Create one numbered ADR for decisions that are expensive to reverse or affect
multiple areas.

File name:

```text
NNNN-short-decision-title.md
```

Template:

```markdown
# NNNN: Decision title

- Status: Proposed | Accepted | Superseded
- Date: YYYY-MM-DD

## Context
## Decision
## Alternatives considered
## Consequences
## Security and privacy impact
## Reversal strategy
## Evidence and affected documents
```

Do not use ADRs for routine implementation details.
An Accepted ADR records an approved choice, not completed implementation.
Superseded ADRs link to their replacement, which links back. Accepted changes
must update the affected canonical pages; an ADR must not become a conflicting
second source of instructions.

## Resumen en español

Los ADR documentan decisiones costosas de revertir. Deben explicar contexto,
alternativas, consecuencias, impacto de seguridad y estrategia de reversión.

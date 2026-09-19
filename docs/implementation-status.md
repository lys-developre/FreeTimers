# Implementation status

**Status:** Active  
**Last reviewed:** 2026-09-19

[Documentation index](./README.md)

This is a source-inspected snapshot, not a test-run report or release
certification. Update it when capabilities change and link the implementation
and tests that demonstrate the change.

| Capability | Current state | Evidence or target |
| --- | --- | --- |
| Prototype home | Three synthetic missions, fixed window and preferences, editable budget | [Page](../src/app/page.tsx) |
| Filtering and ranking | Compares declared duration/cost and matching tags; not round-trip feasibility | [Domain](../src/domain/missions.ts) |
| Deterministic return feasibility | Implemented domain slice: fresh route evidence, asymmetric legs, margin classification, active evaluation time, and invalid-input rejection | [Feasibility domain](../src/domain/feasibility.ts), [Tests](../src/domain/feasibility.test.ts) |
| Plan input validation | Implemented domain slice for timestamps, timezone, margin, hub/origin coordinates, transport, travelers and money | [Plan domain](../src/domain/plan.ts), [Tests](../src/domain/plan.test.ts) |
| Security baseline utilities | Implemented reusable environment, provider URL, payload-size and diagnostic redaction controls; not yet wired to external adapters | [Security utilities](../src/config/security.ts), [Tests](../src/config/security.test.ts) |
| Quality tooling | Dependency-free documentation validator and explicit `typecheck` script implemented; coverage, CI, CodeQL and E2E remain future gates | [Validation commands](./testing/README.md#quality-gates), [Validator](../scripts/validate-docs.mjs) |
| Automated behavior tests | Four examples: elapsed time, duration, budget and affinity | [Tests](../src/domain/missions.test.ts) |
| Saved/active mission | React memory only; reload loses these choices | [Page state](../src/app/page.tsx) |
| Local persistence, import/export | Not implemented | [Data target](./data/README.md#persistence-and-migrations) |
| GPS, maps, isochrones, return margin | Not implemented | [Feasibility target](./data/feasibility.md) |
| Live activities, weather, calendar, LLM | No connectors or credentials consumed | [Architecture target](./architecture/README.md) |
| Installable/offline PWA | Not implemented; local-first is a target, not offline availability | [Operations](./operations/README.md#operational-limitations) |
| Validation commands | Test, lint, build scripts; TypeScript CLI | [Manifest](../package.json) |
| CI validation | GitHub Actions workflow runs docs validation, tests, lint, typecheck, build and high-severity production dependency audit; secret scanning, CodeQL, coverage and E2E remain pending | [Workflow](../.github/workflows/ci.yml), [Testing gates](./testing/README.md#quality-gates) |
| Public setup and environment | Example provides placeholders for optional providers and local configuration | [Environment example](../.env.example) |
| Design system | Documented target, prototype styles have not been migrated | [Tokens](./design/design-system.md), [CSS](../src/app/globals.css) |

## Known gaps that must not be mistaken for guarantees

- The prototype's “Zona segura” badge is assigned from ranking position, not
  routing. Its score is a heuristic, not a probability of enjoyment or safety.
- Displayed weekday text and the fixed timestamp range are not consistently
  derived from the same source.
- Runtime validation and the four feasibility states now exist for the focused
  domain slices, with twenty-seven repository tests passing. Provider freshness,
  schedules, vehicle cost/autonomy, persistence, map zones and application
  integration remain unimplemented.
- Native-map, persistence, accessibility, deployment and security readiness
  require their own evidence before being marked implemented.
- The security baseline utilities are tested but are not a deployment boundary
  until Route Handlers, adapters, headers and runtime configuration use them.

These are implementation follow-ups, not fixed by documenting the target.
Do not use this demo to make real travel or return-time decisions.

## Recording completion

For each capability, attach source/test links, the exact validation performed,
and limitations. A temporary agent todo or an earlier conversational claim is
not implementation evidence. Do not label an entire roadmap complete because
one prototype path works.

## Resumen en español

El prototipo contiene tres misiones sintéticas, filtros básicos y estado en
memoria. Aún no existen mapa, GPS, persistencia, PWA offline ni proveedores.
La etiqueta actual de seguridad no calcula la vuelta y no debe usarse para
decidir viajes reales. Este registro distingue código existente de objetivos.

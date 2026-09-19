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
| Vehicle configuration | Domain validation, bounded cost estimation, form conversion and a persisted multi-vehicle library are implemented for car, motorcycle and bicycle; route-based cost integration remains pending | [Vehicle domain](../src/domain/vehicles.ts), [Form conversion](../src/application/vehicle-configuration.ts), [Vehicle library](../src/application/vehicle-library.ts), [Screen](../src/app/page.tsx), [Tests](../src/application/vehicle-library.test.ts) |
| Mobile plan configurator | Implemented persisted controls for time window, budget, travelers, transport, selectable vehicle profiles and manual hub; no map or GPS | [Screen](../src/app/page.tsx), [Specification](./design/plan-now.md) |
| Security baseline utilities | Implemented reusable environment, provider URL, payload-size and diagnostic redaction controls; not yet wired to external adapters | [Security utilities](../src/config/security.ts), [Tests](../src/config/security.test.ts) |
| Quality tooling | Dependency-free documentation validator and explicit `typecheck` script implemented; coverage, CI, CodeQL and E2E remain future gates | [Validation commands](./testing/README.md#quality-gates), [Validator](../scripts/validate-docs.mjs) |
| Automated behavior tests | Four examples: elapsed time, duration, budget and affinity | [Tests](../src/domain/missions.test.ts) |
| Saved/active mission | Persisted locally with the current configurator state; lifecycle remains a prototype toggle | [Page state](../src/app/page.tsx), [Local envelope](../src/adapters/local-state.ts) |
| Adaptive active mission | Multi-point refresh, confirmed visit progress and deterministic shortening are specified but not implemented | [Product behavior](./product/README.md), [Feasibility refresh](./data/feasibility.md#active-mission-refresh) |
| Voice and AI permissions | Default severity-aware voice, optional regional Bardeo profile and denied-by-default modular AI permissions are specified but not implemented | [Voice and tone](./design/voice-and-tone.md), [LLM boundary](./architecture/README.md#llm-boundary) |
| Local persistence, import/export | Versioned local-state envelope, IndexedDB current-state adapter and configurator JSON import/export implemented; migrations beyond version 1 and multi-tab conflict handling remain unimplemented | [Envelope](../src/adapters/local-state.ts), [IndexedDB adapter](../src/adapters/indexed-db.ts), [Screen](../src/app/page.tsx), [Tests](../src/adapters/local-state.test.ts), [Data target](./data/README.md#persistence-and-migrations) |
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
  domain slices, with forty-nine repository tests passing. Provider freshness,
  schedules, route-based vehicle costing, map zones and application integration
  remain unimplemented.
- The local-state module and IndexedDB adapter preserve the current valid
  configurator state across reloads. JSON import/export is available as a
  recovery path; it is not an encrypted backup and does not solve migrations
  beyond version 1 or multi-tab conflict resolution.
- The active-mission control does not yet track visit progress, watch current
  position, reroute remaining points or recommend an early return.
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

El prototipo contiene tres misiones sintéticas, filtros básicos, una biblioteca
local de vehículos, persistencia mediante IndexedDB y
exportación/importación JSON validada. Aún no existen mapa, GPS, PWA offline ni
proveedores.
La etiqueta actual de seguridad no calcula la vuelta y no debe usarse para
decidir viajes reales. Este registro distingue código existente de objetivos.

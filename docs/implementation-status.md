# Implementation status

**Status:** Active  
**Last reviewed:** 2026-09-19

[Documentation index](./README.md)

This is a source-inspected snapshot, not a test-run report or release
certification. Update it when capabilities change and link the implementation
and tests that demonstrate the change.

| Capability | Current state | Evidence or target |
| --- | --- | --- |
| Prototype home | Three synthetic missions, editable planning inputs and a dedicated active-mission surface | [Page](../src/app/page.tsx), [Active mission view](../src/app/active-mission-view.tsx) |
| Filtering and ranking | Compares declared duration/cost and matching tags; not round-trip feasibility | [Domain](../src/domain/missions.ts) |
| Deterministic return feasibility | Implemented domain slice: fresh route evidence, asymmetric legs, margin classification, active evaluation time, and invalid-input rejection | [Feasibility domain](../src/domain/feasibility.ts), [Tests](../src/domain/feasibility.test.ts) |
| Plan input validation | Implemented domain slice for timestamps, timezone, margin, hub/origin coordinates, transport, travelers and money | [Plan domain](../src/domain/plan.ts), [Tests](../src/domain/plan.test.ts) |
| Vehicle configuration | Domain validation, bounded cost estimation, form conversion and a persisted multi-vehicle library are implemented for car, motorcycle and bicycle; route-based cost integration remains pending | [Vehicle domain](../src/domain/vehicles.ts), [Form conversion](../src/application/vehicle-configuration.ts), [Vehicle library](../src/application/vehicle-library.ts), [Screen](../src/app/page.tsx), [Tests](../src/application/vehicle-library.test.ts) |
| Mobile plan configurator | Implemented mobile-first controls for time window, budget, travelers, transport, selectable vehicle profiles and manual hub, with progressive tablet/desktop layouts; no map or GPS | [Screen](../src/app/page.tsx), [Styles](../src/app/page.module.css), [Specification](./design/plan-now.md) |
| Security baseline utilities | Implemented reusable environment, provider URL, payload-size and diagnostic redaction controls; not yet wired to external adapters | [Security utilities](../src/config/security.ts), [Tests](../src/config/security.test.ts) |
| Quality tooling | Dependency-free documentation validator and explicit `typecheck` script implemented; coverage, CI, CodeQL and E2E remain future gates | [Validation commands](./testing/README.md#quality-gates), [Validator](../scripts/validate-docs.mjs) |
| Automated behavior tests | Fifty-nine tests cover domain, application, storage and security behavior with synthetic fixtures | [Tests](../src/domain/active-mission.test.ts), [Persistence tests](../src/adapters/local-state.test.ts) |
| Saved/active mission | A validated plan snapshot, revision, visits, checklist and lifecycle are persisted locally; schema version 1 migrates to version 2 without inventing legacy progress | [Page state](../src/app/page.tsx), [Local envelope](../src/adapters/local-state.ts), [Tests](../src/adapters/local-state.test.ts) |
| Adaptive active mission | Implemented state machine supports preparation, confirmed arrival/departure, skip, return and completion plus revision-bound itinerary proposals; live route recalculation and automatic proposals remain pending | [Domain](../src/domain/active-mission.ts), [Tests](../src/domain/active-mission.test.ts), [Feasibility refresh](./data/feasibility.md#active-mission-refresh) |
| Active mission support | Dedicated mobile-first surface implements fixed deadline/margin visibility, preparation-first checklist ordering on compact screens and manual visit progress; desktop exposes route and checklist together; GPS, actual-cost journal, learned profiles, voice and offline packages remain specified targets | [Screen](../src/app/active-mission-view.tsx), [Styles](../src/app/active-mission-view.module.css), [Active mission specification](./design/active-mission.md) |
| Mission media | Images and videos are explicitly deferred; no local reference, copy or cloud synchronization is implemented | [Active mission scope](./design/active-mission.md#permission-and-privacy-behavior) |
| Voice and AI permissions | Default severity-aware voice, optional regional Bardeo profile and denied-by-default modular AI permissions are specified but not implemented | [Voice and tone](./design/voice-and-tone.md), [LLM boundary](./architecture/README.md#llm-boundary) |
| Local persistence, import/export | Schema version 2 persists the active-mission record and validates nested plan/vehicle references; version 1 migration, IndexedDB and JSON import/export are implemented; multi-tab conflict handling remains pending | [Envelope](../src/adapters/local-state.ts), [IndexedDB adapter](../src/adapters/indexed-db.ts), [Screen](../src/app/page.tsx), [Tests](../src/adapters/local-state.test.ts), [Data target](./data/README.md#persistence-and-migrations) |
| Route coverage contract | Implemented domain slice: route requests, coverage classification, freshness and expiry validation, and conversion to feasibility evidence; live map rendering and provider-backed routing remain pending | [Routing domain](../src/domain/routing.ts), [Tests](../src/domain/routing.test.ts), [Feasibility target](./data/feasibility.md) |
| Synthetic routing adapter | Implemented adapter with deterministic synthetic fixtures, unsupported-area handling and missing-route fallbacks; no real route provider or map layer yet | [Adapter](../src/adapters/synthetic-routing.ts), [Tests](../src/adapters/synthetic-routing.test.ts) |
| GPS, maps, isochrones, return margin | Not implemented | [Feasibility target](./data/feasibility.md) |
| Live activities, weather, calendar, LLM | No connectors or credentials consumed | [Architecture target](./architecture/README.md) |
| Installable/offline PWA | Not implemented; local-first is a target, not offline availability | [Operations](./operations/README.md#operational-limitations) |
| Validation commands | Test, lint, build scripts; TypeScript CLI | [Manifest](../package.json) |
| CI validation | GitHub Actions workflow runs docs validation, tests, lint, typecheck, build and high-severity production dependency audit; secret scanning, CodeQL, coverage and E2E remain pending | [Workflow](../.github/workflows/ci.yml), [Testing gates](./testing/README.md#quality-gates) |
| Public setup and environment | Example provides placeholders for optional providers and local configuration | [Environment example](../.env.example) |
| Design system | Semantic color, typography, spacing, focus, touch, safe-area, forced-color and reduced-motion foundations are implemented across the current planning and active-mission surfaces | [Tokens](./design/design-system.md), [Global CSS](../src/app/globals.css), [Planning CSS](../src/app/page.module.css), [Mission CSS](../src/app/active-mission-view.module.css) |

## Known gaps that must not be mistaken for guarantees

- The prototype's “Zona segura” badge is assigned from ranking position, not
  routing. Its score is a heuristic, not a probability of enjoyment or safety.
- Displayed weekday text and the fixed timestamp range are not consistently
  derived from the same source.
- Runtime validation and the four feasibility states now exist for the focused
  domain slices, with fifty-nine repository tests passing. Provider freshness,
  schedules, route-based vehicle costing, map zones and application integration
  remain unimplemented.
- The local-state module and IndexedDB adapter preserve the current valid
  configurator and active mission across reloads. JSON import/export is
  available as a recovery path; it is not an encrypted backup and does not
  solve future migrations or multi-tab conflict resolution.
- The active-mission mode tracks only explicit visit progress. It does not yet
  watch current position, request real routes, reroute remaining points or
  recommend an early return.
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
local de vehículos y superficies mobile-first adaptables para planificar y
seguir una misión activa con checklist y progreso confirmado. Incluye
persistencia mediante IndexedDB y exportación/importación JSON validada, y ya
existe un contrato de rutas y cobertura que valida frescura, expiración y
estados de cobertura antes de que la evidencia pueda alimentar la viabilidad.
También hay un adaptador sintético de rutas para devolver resultados reales de
entorno controlado sin depender de proveedores externos ni de un mapa visual.
Aún no existen mapa real, GPS, PWA offline ni proveedores de rutas en vivo.
La etiqueta actual de seguridad no calcula la vuelta y no debe usarse para
decidir viajes reales. Este registro distingue código existente de objetivos.

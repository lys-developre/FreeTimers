# Testing strategy

**Status:** Decision  
**Last reviewed:** 2026-09-19

[Documentation index](../README.md) · [Definition of done](../protocols/README.md)

The current suite has four prototype domain tests. The layers and flows below
are required as their features ship, not a description of existing coverage.
See [implementation status](../implementation-status.md).

## TDD approach

Use intelligent TDD:

1. State observable behavior and harmful failure modes.
2. Write the smallest meaningful failing test.
3. Implement domain behavior.
4. Refactor while tests remain green.
5. Add integration or browser coverage only where it verifies a real boundary.

Run the new test before implementation and confirm it fails for the intended
behavior, not a syntax/import/setup error. Record the red and green commands
in the change evidence. Tests written after implementation are useful regression
tests, but must not be described as demonstrated test-first development.

Do not test implementation details or create snapshots with no behavioral value.

## Test layers

### Unit

Pure domain rules:

- Windows across dates, timezones, and daylight-saving changes.
- Margin and feasibility boundaries.
- Activity schedules and wait time.
- Travelers and budget.
- Vehicle cost and autonomy.
- Mission transitions and recommendation feedback.
- LLM output cannot upgrade deterministic status.

Start return tests from the [feasibility acceptance cases](../data/feasibility.md#acceptance-cases-for-tdd).
Use injected clocks, exact boundary values and asymmetric routes, not only
typical durations.

### Contract

Provider adapters using synthetic/legal fixtures:

- Valid response normalization.
- Missing and malformed fields.
- Timeout and rate limit.
- Partial and stale response.
- Unsupported coverage.
- Oversized GeoJSON and invalid coordinates.

No live API is required for the normal test suite.

### Integration

- Route Handlers and environment validation.
- IndexedDB repositories and migrations.
- Application use cases across ports.
- Cache keys, expiry, and cancellation.
- Import/export validation.
- A late response cannot replace a newer plan revision even if cancellation
  did not stop the response.
- Quota/write/migration failure preserves existing data and produces visible
  error feedback; export/import round trips use synthetic records.
- Unauthorized remote provider access is rejected before consuming quota.
- Provider errors and telemetry never disclose keys, precise personal
  coordinates or raw request payloads.

### Component

- Planner validation.
- GPS permission states.
- Loading, empty, stale, offline, and error behavior.
- Keyboard operation and focus.
- Map textual equivalent.

### E2E

Minimum critical flows:

1. Create a plan in demo mode.
2. Evaluate activities.
3. Activate or save a mission.
4. Restore an active mission.
5. Recalculate return status.
6. Operate without network or GPS.

For offline flows, assert both what remains available and what must become
unknown. Do not pass a test merely because cached green geometry is visible.
Until persistence and routing exist, these are pending flows.

## Fixtures

- Synthetic by default.
- Stable and minimal.
- No author coordinates, calendars, tokens, or photos.
- Include provider license/source when derived from reusable public samples.
- Store raw provider fixtures only in test directories.
- Version fixtures with the adapter contract.

## Coverage

Coverage is diagnostic, not the goal. High-risk domain branches require direct
tests regardless of aggregate percentage.

Initial policy:

- Report line, branch, function, and statement coverage.
- Set thresholds only after a baseline.
- Never exclude difficult domain code merely to improve percentage.
- Generated code and type-only files may be excluded with justification.

## Quality gates

Current local commands:

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run validate:docs
```

Planned CI also includes:

- Coverage.
- Dependency audit.
- Secret scan.
- CodeQL.
- Accessibility checks.
- Minimum E2E smoke flow.

## Validation by change type

This matrix is the canonical selection rule for the Definition of Done.
Combine rows for mixed changes. Start with the smallest relevant tests, then
escalate when changed boundaries or failures require broader coverage.

| Change | Required evidence |
| --- | --- |
| Prose-only documentation | `npm run validate:docs`, consistency with source and whitespace |
| Runnable examples or agent instructions | Documentation checks plus validation of affected examples/rules; application checks only if affected |
| Domain/application logic | Relevant unit/integration tests, lint, typecheck, production build |
| Provider or server boundary | Contract/error/privacy tests, runtime configuration validation, lint, typecheck, build |
| UI or CSS | Relevant tests, lint, typecheck, build and real-browser responsive/state/accessibility checks |
| Storage/schema | Migration/import/rollback and failure tests with synthetic prior versions; lint, typecheck, build |
| Dependencies or build/deployment configuration | Reproducible install in the chosen runtime, affected tests, lint, typecheck, build and relevant deployment smoke checks |

For documentation examples, verify the actual claim: arithmetic for a formula,
supported scripts for a command and type completeness for a contract sketch.
Clearly mark pseudocode and unimplemented contracts. Do not contact a live
provider or mutate personal data simply to validate a documentation example.

Record commands, outcome and any blocked checks in the change summary. A
missing runner is pending validation, not a pass. Production/release acceptance
also requires the complete [operations checklist](../operations/README.md#release-process).

## Flaky test policy

- Do not blindly retry a failing test.
- Quarantine only with an issue, owner, and expiry.
- Control time, randomness, network, and geolocation.
- Await observable state instead of fixed sleeps.
- Browser captures remain in ignored local directories.

## Resumen en español

El TDD parte de comportamiento observable y fallos dañinos. El dominio usa tests
unitarios; proveedores, tests de contrato con fixtures; límites, integración; y
los flujos críticos, E2E. No se usan APIs reales en la suite normal ni datos
personales en fixtures.
Los casos pendientes no son cobertura existente. `npm run validate:docs` comprueba
enlaces, anclas, metadatos, resumen en español y espacios sobrantes. Cada cambio selecciona sus
comprobaciones con la matriz: la prosa requiere validar enlaces y coherencia,
no reconstruir una aplicación sin cambios. El TDD demostrado registra el fallo
correcto antes de implementar y el paso a verde después.

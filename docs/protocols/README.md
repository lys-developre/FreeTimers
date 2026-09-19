# Engineering protocols

**Status:** Decision  
**Last reviewed:** 2026-09-19

[Documentation index](../README.md) · [Validation matrix](../testing/README.md#validation-by-change-type)

## Non-negotiables

1. The LLM never calculates or upgrades travel feasibility.
2. Unknown, stale, or unsupported data is never presented as safe.
3. No real secret or personal datum enters Git, fixtures, screenshots, or logs.
4. Every external record carries provenance and freshness.
5. The map is never the only representation of decision-critical information.
6. Critical domain behavior is test-first.
7. External inputs and outputs are validated at boundaries.
8. Secret-bearing providers are called only from server-only modules.
9. External failure never becomes an empty or success-shaped fallback.
10. A dependency requires a concrete need, maintenance review, and license check.
11. Product behavior and canonical documentation change together.
12. A feature is unfinished without loading, empty, error, stale, offline, and
    unsupported behavior where applicable.

## Definition of done

A change is done when:

- The requested outcome is implemented (or documented for a documentation task).
- The checks selected by the [validation matrix](../testing/README.md#validation-by-change-type)
  pass; source changes include relevant tests, lint, typecheck and build.
- External failures are explicit.
- Accessibility and responsive behavior are verified for UI changes.
- Security/privacy impact is reviewed.
- No sensitive artifacts are untracked or staged.
- Documentation and `.env.example` are updated when required.
- Browser behavior is verified for Next.js UI changes.
- Remaining limitations are stated honestly.

Apply only the relevant gates, but record any omitted required check and why it
is blocked. Do not call a feature complete because its specification exists.
Documentation-only work verifies its own links/contracts without claiming the
application is production-ready.

## Change protocol

1. Read the relevant canonical documents.
2. Inspect existing code and prior patterns.
3. Define acceptance criteria and harmful failure modes.
4. Write or update tests for domain and adapter behavior.
5. Implement the smallest coherent vertical slice.
6. Validate locally.
7. Review the diff for secrets, personal data, generated files, and scope creep.
8. Update canonical documentation, implementation status and ADRs when affected.

For documentation changes, follow [ownership and conflict resolution](../README.md#authority-and-conflict-resolution).
Do not silently turn a proposal into a product decision. Significant new
behavior, cost, provider selection or privacy tradeoffs require maintainer
approval; clarifications must preserve existing decisions.

## External connector protocol

Before adding a connector:

1. Confirm license, terms, attribution, cost, and quotas.
2. Define a provider-independent port.
3. Collect synthetic or legally reusable fixtures.
4. Validate provider payloads.
5. Define timeout, cancellation, retry, cache, expiry, and rate behavior.
6. Define no-coverage, partial, stale, and failure states.
7. Keep secrets server-only.
8. Add contract tests before live integration.
9. Display provenance and update time.
10. Document configuration and revocation.

## Security review protocol

Review:

- Trust boundaries and changed data flows.
- Secrets and public environment variables.
- Input/output validation.
- SSRF, XSS, injection, prompt injection, and quota abuse.
- Logs and diagnostic artifacts.
- Dependency and supply-chain risk.
- Location/calendar minimization.
- Failure behavior and stale-data claims.

Security findings are ranked by impact, exploitability, and confidence. Critical
or high findings block external deployment.

## Resumen en español

Los protocolos recogen reglas no negociables, Definition of Done, flujo de
cambios, incorporación de conectores y revisión de seguridad. Estas reglas deben
estar respaldadas por código, tests y CI, no solo por instrucciones para agentes.

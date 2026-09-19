# Engineering standards

**Status:** Decision  
**Last reviewed:** 2026-09-19

[Documentation index](../README.md) · [Architecture](../architecture/README.md)

## Priorities

1. Correctness and user safety.
2. Privacy and security.
3. Clarity and maintainability.
4. Reliability.
5. Measured performance.
6. Scalability through replaceable boundaries.

Do not add complexity to appear sophisticated.

## TypeScript

- Strict type checking remains enabled.
- Avoid `any`, unsafe double casts, and non-null assertions without proof.
- Model domain states as discriminated unions.
- Use branded or explicit unit types where confusion would be harmful.
- Parse untrusted runtime data; TypeScript types do not validate JSON.
- Public functions and contracts use meaningful names and explicit return types
  when inference obscures a boundary.

## Module design

- One responsibility per module.
- Pure domain functions first.
- Side effects live in adapters.
- Components do not fetch arbitrary providers.
- Reuse existing patterns before adding utilities.
- Extract an abstraction after a repeated stable concept exists, not before.
- Circular dependencies are not allowed.

## Error handling

Use typed categories:

- Validation.
- Permission.
- Network.
- Timeout.
- Rate limit.
- Provider unavailable.
- Unsupported coverage.
- Stale data.
- Internal invariant.

Errors include safe context and a recoverable action. Do not:

- Swallow errors.
- Return empty arrays for provider failure.
- Log secrets or precise personal data.
- Expose provider internals directly to users.
- Retry validation, permission, or unsupported errors.

## Performance

Measure before optimizing. Product budgets include:

- Planner remains interactive while map and external data load.
- Map and heavy browser libraries load lazily.
- Input changes debounce and cancel obsolete work.
- Identical route/isochrone requests use cache.
- Activity lists virtualize or cluster only when measured density requires it.
- LLM explanation never blocks deterministic results.
- Avoid unnecessary client components and broad rerenders.

Record baseline bundle size, Core Web Vitals, map update time, and route latency
before setting numeric release gates.

### Measurement contract

Every performance change records:

| Measurement | Evidence required |
| --- | --- |
| Initial client cost | Production build, compressed bytes, route and loaded chunks |
| Interaction responsiveness | Device, viewport, throttling, cold/warm state and measured duration |
| Map update | Input revision to matching geometry display, separated from provider latency |
| Routing | Provider/profile, cache state, request count, latency distribution and errors |
| Memory | Repeated map mount/unmount and mission transitions, listener/worker cleanup |
| Cost | Requests/tokens per plan edit session and configured limits |

Use synthetic scenarios, the same environment before/after and repeated runs;
report median and tail values with sample count rather than one favorable run.
Do not fabricate results or label a lab Lighthouse score as field Core Web Vitals.
Before release, the maintainer approves numeric budgets for a named target
device/network; no baseline or threshold is currently established.

## Scalability

Initial scale is one user and a public cloneable repository. Prepare for growth
through:

- Provider ports.
- Normalized data.
- Cache boundaries.
- Stateless secret-bearing Route Handlers where practical.
- Versioned persistence.
- Bounded payloads and concurrency.

Do not introduce distributed queues, microservices, or PostgreSQL until measured
requirements justify them.
Before a provider ships, set numeric request/concurrency, payload, cache and
feature-count limits with tests. If coverage or computation exceeds those
limits, show the limit and an actionable alternative; never silently truncate
and label the result complete. Large-window support is bounded by provider
coverage and resources, not promised as infinite.

## Observability

Structured events may include:

- Operation name.
- Provider.
- Duration.
- Cache hit/miss.
- Result category.
- Error code.
- Correlation ID.

They must not include:

- Tokens.
- Full coordinates.
- Calendar content.
- User photos.
- Raw LLM prompts containing personal context.

Write development traces/captures only to an explicitly ignored artifact
directory such as `.playwright-mcp/`; arbitrary log paths are not automatically
ignored. Ignore rules do not make sensitive captures acceptable. Retain only
sanitized evidence needed for diagnosis and remove it when no longer required.

## Dependencies

Before adding a package, record:

- Problem solved.
- Why platform/existing code is insufficient.
- Maintenance and release activity.
- License.
- Security posture.
- Client bundle and runtime impact.
- Removal or replacement path.

Use the package manager and commit the lockfile. Avoid unmaintained packages for
security-critical boundaries.
Resolve engine/peer conflicts rather than bypassing them with `--force` or
`--legacy-peer-deps`. The manifest, lockfile and documented runtime must describe
one reproducible toolchain.

## Documentation

- Explain decisions and constraints, not obvious syntax.
- Update canonical docs with behavior.
- Use an ADR for cross-cutting, expensive-to-reverse choices.
- English is canonical; public principal documents include a Spanish summary.

## Resumen en español

La ingeniería prioriza corrección, seguridad, claridad, fiabilidad y rendimiento
medido. El dominio es puro, los efectos viven en adaptadores y los errores son
tipados. La escalabilidad se logra con límites sustituibles, no con
microservicios prematuros. Toda dependencia debe justificarse.
Las mediciones separan interacción local y latencia de proveedor, con escenario,
dispositivo y muestras reproducibles. No hay umbrales de rendimiento aprobados
todavía; cada integración debe fijar límites explícitos antes de publicarse.

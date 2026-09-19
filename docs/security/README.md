# Security and privacy

**Status:** Decision  
**Last reviewed:** 2026-09-19

[Documentation index](../README.md) · [Private reporting policy](../../SECURITY.md)

This document specifies required controls; it is not a security audit or a
claim that they are implemented. Consult [implementation status](../implementation-status.md).

## Implemented baseline

The current domain-independent baseline is implemented in
[security.ts](../../src/config/security.ts) and covered by
[security tests](../../src/config/security.test.ts):

- optional LLM configuration fails when an enabled provider has no real key;
- secret-looking `NEXT_PUBLIC_*` names are rejected;
- provider URLs require HTTP(S), have no embedded credentials, and match an
  explicit host allowlist;
- local provider URLs require an explicit development option;
- payload sizes are bounded before parsing;
- sensitive fields are redacted recursively for diagnostic structures.

These helpers are not yet wired to a Route Handler or external adapter.
Therefore they do not certify a deployment, authenticate a remote instance,
configure CSP, or replace provider-specific response schemas.

## Security objectives

- Never publish the author's personal data or credentials.
- Minimize precise location and calendar disclosure.
- Keep secret-bearing integrations server-only.
- Treat provider and LLM content as untrusted.
- Prevent incorrect confidence in safety-critical planning.
- Make a cloned installation safe with its owner's credentials.

## Protected assets

- API keys and OAuth tokens.
- Current and historical location.
- Calendar availability and event content.
- Personal vehicles and travel patterns.
- Saved and completed missions.
- Photos and generated memories.
- Provider quota and billing accounts.

## Trust boundaries

```text
Browser <-> local storage
Browser <-> Next.js Route Handlers <-> secret-bearing providers / optional LLM
Browser <-> approved public map/tile/data providers (when permitted)
```

All boundary inputs and outputs require schema validation. Provider text and
GeoJSON are data, never executable markup or trusted instructions.

## Deployment boundaries

- A public source repository is not a public hosted service. Anyone may clone
  their own single-user instance; this does not authorize exposing the author's
  instance, database or credentials.
- A localhost development server is not a production security boundary. LAN
  access for a phone must be deliberately configured; real GPS generally
  requires a secure browser context. Do not expose the dev server publicly.
- Before enabling secret-bearing endpoints on a remotely reachable instance,
  require owner-only access at the application or deployment perimeter. No
  multiuser account system is implied. Rate limits and CORS are not
  authentication.
- State-changing endpoints need method/origin checks and CSRF protection
  appropriate to the chosen authentication. Restrict forwarded headers and
  trusted proxies explicitly.
- Direct public API calls still disclose IP, viewport and/or location. Review
  those disclosures and licensing even when no key is required.
- A lost or compromised device, malicious extension or XSS can expose browser
  storage. Local-first is not an encryption or device-security guarantee.

## Principal threats and controls

| Threat | Required controls |
| --- | --- |
| Secret in client bundle | Server-only modules, environment validation, no `NEXT_PUBLIC_` secrets |
| Secret in Git | `.env*` ignore plus `.env.example` exception, secret scanning, diff review |
| SSRF through proxy | Fixed provider hosts and paths; reject arbitrary URLs and protocols |
| XSS from activities/LLM | Render as text; sanitize explicitly approved rich content |
| Prompt injection | Structured minimal input; no tools or secrets; schema-validated output |
| Malicious GeoJSON | Schema, coordinate, feature-count, and payload-size limits |
| Quota exhaustion | Debounce, cancellation, cache, concurrency and rate limits |
| Location leakage | Minimize precision, persistence, logs, and provider disclosure |
| Stale safety result | Expiry, visible freshness, unknown state, mandatory recalculation |
| Supply-chain compromise | Lockfile, review dependencies, automated updates and scanning |

For SSRF defenses, validate redirects too; disallow private/link-local targets
and metadata endpoints for hosted-provider adapters. A deliberately configured
local routing engine is a separate server-side deployment capability, never a
URL supplied by the browser. Bound response bodies before parsing and constrain
outbound access where the host supports it.

## Secret management

Versioned:

- `.env.example` with fake placeholders and descriptions.

Ignored:

- `.env`
- `.env.local`
- `.env.development`
- `.env.development.local`
- `.env.production`
- `.env.production.local`

Rules:

- Missing mandatory configuration fails explicitly.
- Optional providers expose disabled capability, not fake data.
- Secrets are never logged or returned to clients.
- Rotation and revocation steps are documented per provider.
- Client-visible environment variables are considered public.
- Production secrets belong to the deployment platform secret store.
- `.gitignore` does not remove previously tracked secrets. Inspect tracked
  content and history as well as current files before publishing; rotate any
  exposed credential regardless of later deletion.
- CI for untrusted pull requests must not receive real credentials or execute
  untrusted changes with privileged tokens. Use synthetic fixtures and minimum
  workflow permissions.

## Privacy model

- Manual location is always available.
- GPS permission is requested in context.
- Calendar integration requests read-only minimum scope.
- Calendar event bodies are not stored when occupied intervals suffice.
- Precise location is retained only for an active mission by default.
- Logs omit coordinates, tokens, calendar text, and memory content.
- Local export is explicit and warns about sensitive contents.
- Delete-all-local-data is available before public release.

Saving a mission must not retain a precise travel trace by accident. Separate
public activity coordinates from personal hub/current-location fields and
document retention for each. Store only the hub needed for return or an
explicitly opted-in favorite; delete obsolete observations when a mission ends.
Strip location metadata from any publicly shared demo media. Raw diagnostic
captures stay in ignored directories and still must use synthetic data.

## Security headers

Before external deployment, configure and test:

- Content Security Policy with explicit map, tile, and provider hosts.
- `Referrer-Policy`.
- `X-Content-Type-Options`.
- Frame restrictions.
- Permissions Policy for geolocation and other sensitive APIs.
- HTTPS-only production operation.

CSP must be tested with the actual map worker and styles. Do not weaken it to
`*` merely to make a provider work.

## Incident response

If a secret or personal datum is committed:

1. Stop publication and access.
2. Revoke or rotate the credential immediately.
3. Assess logs and provider usage.
4. Remove the data from the current tree.
5. Propose history cleanup when necessary; obtain explicit maintainer approval
   and coordinate with collaborators before rewriting public history.
6. Document the incident without reproducing the secret.
7. Add a control preventing recurrence.

Public vulnerability reporting belongs in root `SECURITY.md`. Do not request
sensitive vulnerability details in public issues.

## Pre-release checklist

- Secret scan passes.
- No personal fixtures or captures exist.
- Environment validation distinguishes public and private values.
- Route Handlers use allowlisted providers.
- Payload and timeout limits exist.
- Logs are redacted.
- CSP and permission policies are tested.
- Dependency audit has no unaccepted high/critical issue.
- Threat model reflects current flows.

For each control, record the owner, implementation/configuration link, test or
manual evidence, review date, and remaining gap in the release/PR checklist.
An unchecked required control blocks the relevant deployment; merely having this
document does not satisfy it. Verify a usable private reporting channel before
public release rather than assuming one exists on the owner's profile.

## Resumen en español

La seguridad protege claves, GPS, calendario, vehículos, misiones y recuerdos.
Los proveedores y el LLM son no confiables; se validan entradas y salidas. Los
secretos viven solo en servidor, la ubicación se minimiza y los datos caducados
nunca sostienen una afirmación de seguridad.
Publicar código no equivale a publicar una instancia personal: un despliegue
remoto con claves necesita acceso privado. Local-first no cifra los datos por
sí solo. Cada control debe demostrarse con evidencia, no con esta lista.

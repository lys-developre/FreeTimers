# Operations

**Status:** Draft  
**Last reviewed:** 2026-09-19

This document distinguishes current commands from planned public deployment.

[Documentation index](../README.md) · [Implementation status](../implementation-status.md)

## Local development

Prerequisites:

- Node.js 24 LTS is the recommended development baseline for the current
  lockfile. The root manifest declares `>=20.9.0`, but that is not a complete
  toolchain guarantee: installed Vite 8 requires Node `^20.19.0 || >=22.12.0`,
  and Vitest 4 supports Node 20, 22 or 24+. Avoid unsupported odd releases.
  npm's `engines` field is normally advisory, not strict enforcement.
- npm.

The manifest and public quick start still need alignment with a tested runtime
policy before release. Recheck resolved package engines when updating the lockfile.

Current setup:

```bash
git clone <your-clone-url> FreeTimers
cd FreeTimers
npm ci
npm run dev
```

Replace `<your-clone-url>` with the actual repository URL; it is not an
executable literal. See [current validation commands](../testing/README.md#quality-gates).
Run checks sequentially; build/type generation can write shared output.

For a local production smoke test, run `npm run build`, then `npm start` and
open the URL printed by the server in a browser. Stop only the process you
started. This verifies the demo, not the planned providers.

## Configuration

The application must run in demo mode without credentials.
[.env.example](../../.env.example) contains a public template for optional
providers and local configuration. Values are placeholders; copy it to
`.env.local` only after selecting and documenting the provider you enable.

Create local configuration from the versioned example:

```bash
cp .env.example .env.local
```

PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Every variable documents:

- Purpose.
- Public or server-only classification.
- Required or optional status.
- Provider setup URL.
- Rotation/revocation procedure.

Never commit `.env.local`.
Do not overwrite an existing local file when copying the template.
Use standard environment filenames supported by the runtime, not `.envdev` or
`.envprod`. Local ignored files are not a substitute for a production secret
store or validation.

## Deployment model

Planned supported model:

- Next.js deployment capable of Route Handlers.
- HTTPS.
- Server-side environment secret store.
- Explicit outbound provider allowlist.
- Persistent personal data remains in the browser unless a future opt-in sync
  design is approved.

A static export cannot safely support secret-bearing providers.

### Before exposing an instance

1. Choose and document the supported deployment host and Node runtime.
2. Enforce [owner-only access](../security/README.md#deployment-boundaries) for
   a secret-bearing instance; public source does not require anonymous access.
3. Configure HTTPS, secrets, security headers and permitted providers.
4. Verify GPS on the intended phone; `localhost` on the phone refers to the
   phone, not the developer's computer.
5. Verify current browser storage, export and migration behavior. Different
   hostnames/origins may not share stored missions.
6. Run a credential-free smoke flow and provider tests with the owner's
   configuration, without publishing captures or values.
7. Document rollback and recovery before releasing.

There is no deployment target or verified hosted production configuration yet.

## Release process

Before a tagged release:

1. CI passes.
2. Dependency and secret scans pass.
3. Documentation matches behavior.
4. Demo mode works without credentials.
5. Environment changes appear in `.env.example`.
6. Data migrations are tested.
7. Known limitations are published.
8. Changelog and version are updated.

Semantic Versioning will start when a public release contract exists.
The current CI workflow runs documentation validation, tests, lint, typecheck,
build and a high-severity production dependency audit. Secret scanning, CodeQL,
coverage and E2E remain pending gates; record pass/fail/pending evidence against
each release gate.
Before rollback, check schema compatibility; never assume old code can read a
newer database. Back up data and do not downgrade a schema destructively.

## Backup and restore

Planned local-first backup:

- Explicit JSON export.
- Schema version.
- Validation before import.
- Warning that exports may contain sensitive location and mission data.
- No automatic cloud upload.
- Preview and conflict behavior before mutation.

## Troubleshooting

Current demo troubleshooting:

- Installation/engine error: compare Node against the resolved toolchain;
  use `npm ci` with the lockfile, not forced peer-dependency workarounds.
- Port already in use: inspect the printed URL and reuse the known project
  server; do not terminate unrelated processes.
- Saved state disappears: this is the current in-memory prototype behavior.
- Build fails fetching fonts: the current layout loads Google fonts at build
  time; check network access and report the dependency. Offline build support
  is not implemented.

For future live integrations, diagnose in this order:

1. Environment capability report without values.
2. Browser permission state.
3. Network and provider coverage.
4. Data freshness.
5. Route Handler status.
6. Browser and server logs, redacted.

Never request users to post `.env` files or unredacted exports in issues.

## Operational limitations

- PWA background location is unreliable, especially when closed.
- Public routing APIs have quotas and range limits.
- Offline map coverage is not guaranteed until explicitly implemented.
- Real-time traffic may be absent.
- Public transport is not implemented; a future selector must keep it disabled
  until a real GTFS/OTP integration exists.

## Resumen en español

El proyecto debe funcionar en modo demo sin credenciales. Los secretos se
configuran localmente y el despliegue necesita servidor para proveedores
privados. Las copias serán exportaciones locales versionadas y nunca se pedirán
archivos `.env` o exportaciones personales en issues públicos.
El mínimo declarado de Node no garantiza todas las herramientas: se recomienda
Node 24 LTS. El despliegue remoto necesita HTTPS y acceso privado; todavía no hay
una configuración de producción validada.

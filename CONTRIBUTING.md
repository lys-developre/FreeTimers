# Contributing to FreeTimers

FreeTimers welcomes focused contributions that preserve its personal,
local-first, mobile-first, safety-conscious direction.

## Before contributing

Read:

1. [`AGENTS.md`](./AGENTS.md)
2. [`docs/README.md`](./docs/README.md)
3. The relevant product, architecture, security, data, testing, or design docs
4. [`docs/protocols/README.md`](./docs/protocols/README.md)

## Setup

```bash
npm ci
npm run dev
```

No credentials are needed for demo mode. Copy `.env.example` to `.env.local`
only when enabling an optional provider.

## Development

- Keep changes focused.
- Use English identifiers and canonical technical documentation.
- Product UI copy is Spanish.
- Add tests before or with critical domain and adapter behavior.
- Use synthetic fixtures.
- Never include real location, calendar, token, vehicle, photo, or export data.
- Add an ADR for significant, cross-cutting decisions.
- Update documentation with behavior.

## Validation

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

UI changes also require browser verification and the checks in
[`docs/design`](./docs/design/README.md).

## Pull requests

Describe:

- Problem and user impact.
- Scope and non-goals.
- Security/privacy implications.
- Tests and manual validation.
- Screenshots only with synthetic data and only when safe to publish.
- Known limitations.

Do not submit generated artifacts, `.env` files, browser logs, or personal
exports.

## Reporting bugs

Provide synthetic reproduction data. Never paste credentials, precise personal
locations, calendar content, or private exports into an issue.

## Resumen en español

Las contribuciones deben ser enfocadas, usar fixtures sintéticos, actualizar
tests y documentación y respetar privacidad, seguridad y arquitectura.
Ejecuta tests, lint, TypeScript y build antes del PR.


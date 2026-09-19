# FreeTimers

FreeTimers is a personal, local-first, mobile-first application for finding
experiences that fit the time you actually have.

> What is worth experiencing with the time I have?

The project combines deterministic reachability and return-time calculations,
activity discovery, living Secondary Missions, and optional AI explanations.
It is not a travel marketplace or social network.

## Status

FreeTimers is an early prototype. The current interface uses synthetic demo
missions. Live maps, routing, activities, persistence, and LLM providers are
planned and documented but not yet connected.

## Principles

- Return feasibility is calculated deterministically.
- The LLM never overrides safety-critical results.
- Unknown and stale data remain explicit.
- Personal data stays local whenever possible.
- Demo mode works without credentials.
- External providers are replaceable adapters.
- Mobile UX and accessibility are first-class requirements.

## Quick start

Requirements:

- Node.js 20.9 or newer.
- npm.

```bash
git clone <repository-url>
cd FreeTimers
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

## Configuration

No credentials are required for demo mode.

macOS/Linux:

```bash
cp .env.example .env.local
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Fill only the optional providers you enable. Never commit `.env.local`. Values
prefixed with `NEXT_PUBLIC_` are visible in the browser and must not contain
secrets.

## Documentation

Start at [`docs/README.md`](./docs/README.md).

- [Product](./docs/product/README.md)
- [Design and UX](./docs/design/README.md)
- [Architecture](./docs/architecture/README.md)
- [Security and privacy](./docs/security/README.md)
- [Data contracts](./docs/data/README.md)
- [Engineering standards](./docs/engineering/README.md)
- [Testing](./docs/testing/README.md)
- [Operations](./docs/operations/README.md)
- [Protocols and Definition of Done](./docs/protocols/README.md)
- [External requirements](./REQUIREMENTS-EXTERNAL.md)

## Contributing and security

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) and
[`SECURITY.md`](./SECURITY.md). Never publish credentials, precise personal
locations, calendars, or exports in issues.

## License

[MIT](./LICENSE)

## Resumen en español

FreeTimers es una herramienta personal para descubrir experiencias compatibles
con tu tiempo, presupuesto, movilidad y margen de regreso. El proyecto está en
fase inicial y usa datos sintéticos. Funciona en modo demo sin credenciales y
prioriza privacidad, seguridad, accesibilidad y arquitectura mantenible.

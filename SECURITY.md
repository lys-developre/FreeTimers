# Security policy

## Supported versions

FreeTimers is pre-release software. Security fixes currently target the default
branch only.

## Reporting a vulnerability

Do not open a public issue containing vulnerability details, credentials,
location data, calendar data, or personal exports.

Until private GitHub vulnerability reporting is enabled, contact the repository
owner privately through the contact method published on their GitHub profile.
Include:

- A concise description.
- Affected commit or version.
- Reproduction steps using synthetic data.
- Expected impact.
- Suggested mitigation, if known.

Do not access data that is not yours, exhaust provider quotas, or perform
destructive testing.

## Response expectations

The maintainer will acknowledge a valid private report when available, assess
severity, coordinate a fix, and disclose it after remediation. As this is a
personal open-source project, no service-level response time is guaranteed.

## Scope

Particularly important areas:

- Secret exposure.
- Precise location or calendar leakage.
- SSRF in provider endpoints.
- XSS from activity or LLM content.
- Incorrect elevation of stale/unknown travel data to safe.
- Import/export data handling.
- Dependency and workflow compromise.

See [`docs/security`](./docs/security/README.md) for the project's security
model.

## Resumen en español

No publiques vulnerabilidades, claves, ubicaciones o exportaciones personales
en issues. Repórtalas de forma privada al propietario mediante el contacto de su
perfil de GitHub y utiliza datos sintéticos para reproducirlas.


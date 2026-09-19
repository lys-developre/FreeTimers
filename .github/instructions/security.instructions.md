---
description: Security, privacy, and external-boundary rules
applyTo: "{src/app/api/**,src/adapters/**,src/config/**,*.env*,.github/workflows/**}"
---

# Security rules

- Treat client, storage, provider, imported, and LLM data as untrusted.
- Validate requests and responses at runtime.
- Keep credentials in server-only environment variables.
- Never proxy a client-provided arbitrary URL.
- Allowlist provider hosts, paths, methods, and protocols.
- Bound timeout, payload size, feature count, concurrency, retries, and cache.
- Redact tokens, coordinates, calendar text, and memory content from logs.
- Return typed failures; never return empty success-shaped fallbacks.
- Update `.env.example` with fake values when configuration changes.
- Follow `docs/security/README.md` and `REQUIREMENTS-EXTERNAL.md`.


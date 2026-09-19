# FreeTimers documentation

**Status:** Active  
**Canonical language:** English  
**Last reviewed:** 2026-09-19

This directory is the canonical knowledge base for FreeTimers. Agent-specific
files must point here instead of duplicating project rules.

## Documentation map

| Area | Purpose | Entry point |
| --- | --- | --- |
| Product | Vision, terminology, mission lifecycle, and roadmap | [Product](./product/README.md) |
| Design | UX, visual direction, responsive behavior, and accessibility | [Design](./design/README.md) |
| Architecture | System boundaries, local-first model, adapters, and LLM limits | [Architecture](./architecture/README.md) |
| Security | Threats, secrets, privacy, and incident handling | [Security](./security/README.md) |
| Data | Domain records, validation, provenance, freshness, and migrations | [Data](./data/README.md) |
| Engineering | Coding, errors, performance, scalability, and observability | [Engineering](./engineering/README.md) |
| Testing | TDD, fixtures, contracts, E2E, and quality gates | [Testing](./testing/README.md) |
| Operations | Local setup, configuration, deployment, recovery, and releases | [Operations](./operations/README.md) |
| Protocols | Non-negotiables and repeatable change procedures | [Protocols](./protocols/README.md) |

External providers and credentials are catalogued in
[`REQUIREMENTS-EXTERNAL.md`](../REQUIREMENTS-EXTERNAL.md).
That Spanish inventory is supporting research, not an approved provider
selection or a substitute for the canonical contracts below.

## Start with the task

Read [implementation status](./implementation-status.md) first. Then use this
minimum reading route rather than loading the entire documentation tree:

| Task | Read in order | Expected evidence |
| --- | --- | --- |
| Understand the product | [Product](./product/README.md), [status](./implementation-status.md) | Distinguish the demo from the target experience |
| Change travel decisions | [Feasibility](./data/feasibility.md), [data](./data/README.md), [testing](./testing/README.md) | Boundary tests before implementation |
| Create a screen | [Design index](./design/README.md), [screen template](./design/screen-spec-template.md) | Screen specification and browser checks |
| Add a provider | [Architecture](./architecture/README.md), [security](./security/README.md), [connector protocol](./protocols/README.md#external-connector-protocol) | Contract tests, license review, failure behavior |
| Change persistence | [Data](./data/README.md), [privacy](./security/README.md#privacy-model) | Migration, import, quota and recovery tests |
| Investigate performance | [Engineering](./engineering/README.md#performance) | Reproducible before/after measurements |
| Run or deploy | [Operations](./operations/README.md), [security gates](./security/README.md#pre-release-checklist) | Smoke test and applicable release gates |
| Change documentation | This index, [validation matrix](./testing/README.md#validation-by-change-type) | Valid links, accurate claims and updated summaries |

## Authority and conflict resolution

- Each area entry point owns the decisions in its documentation-map row.
- [Protocols](./protocols/README.md#non-negotiables) owns cross-cutting
  invariants; [feasibility](./data/feasibility.md) owns classification mathematics.
- [Testing](./testing/README.md#validation-by-change-type) owns validation
  selection. Other checklists link to it.
- Source and tests establish what exists today, not what should exist.
  Divergence from a Decision is a tracked implementation gap, not permission to
  silently weaken the decision.
- Agent entry points are navigation aids, not additional product specifications.
- If two decisions conflict, stop the affected change, identify both sections,
  and ask the maintainer. Do not choose the longer or newer text automatically.

## Document status

- **Active:** maintained reference for current behavior, navigation or process.
- **Decision:** approved target that new work must follow.
- **Draft:** proposal that must not be treated as implemented.
- **Historical:** retained for context and superseded by a linked decision.

Status describes the document's authority, not feature completion. An Active
guide can describe an available process; a Decision can be entirely unimplemented.
Use the implementation-status register for capability availability. Drafts are
not binding decisions.

## Maintenance rules

- Update documentation in the same change as the affected behavior.
- Prefer links over duplicated rules.
- Put enforceable constraints in code, tests, configuration, or CI.
- Record significant irreversible decisions in `architecture/decisions/`.
- Never include real coordinates, tokens, calendars, vehicles, or personal
  exports.
- Raw browser captures and diagnostic artifacts remain local and ignored and
  use synthetic data. Deliberate public demo assets require separate privacy,
  metadata and license review; they are not raw diagnostic captures.
- Every document under `docs/` has status, last-review date and a Spanish
  summary. A changed decision also updates its summary and inbound references.
- The change author maintains affected pages; the maintainer approves decisions
  and exceptions. Review relevant pages on behavior changes and before releases,
  not through automatic date updates.
- Add a document only when it has a distinct owner topic or a reusable contract.
  Split oversized pages by responsibility, not by an arbitrary file count.
- Explain measured performance with environment, procedure and results. Do not
  treat a checklist, passing build, or agent review as proof of full compliance.
- Documentation-only work follows the
  [validation matrix](./testing/README.md#validation-by-change-type).

## Agent usage

Agents start at [`AGENTS.md`](../AGENTS.md), then read only the documents
relevant to the task. Copilot receives scoped instructions from `.github`.
`CLAUDE.md` delegates to the same entry point. No model receives a separate copy
of project truth.

## Resumen en español

Esta carpeta es la fuente canónica para humanos, Copilot, Claude y otros
agentes. La documentación se organiza por producto, diseño, arquitectura,
seguridad, datos, ingeniería, pruebas, operaciones y protocolos. Los archivos
específicos de cada agente solo apuntan aquí; no duplican reglas.
Empieza por el estado real y la ruta de lectura según tu tarea. El estado de un
documento no demuestra que una función exista. Cada área tiene autoridad
definida; los conflictos se consultan, no se resuelven por intuición del agente.

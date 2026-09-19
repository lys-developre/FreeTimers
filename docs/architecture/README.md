# Architecture

**Status:** Decision  
**Last reviewed:** 2026-09-19

[Documentation index](../README.md) · [Current implementation](../implementation-status.md)

## Goals

- Keep critical planning deterministic and testable.
- Preserve local-first privacy.
- Isolate external providers behind replaceable contracts.
- Allow demo operation without credentials.
- Fail explicitly when data is missing or stale.
- Scale by replacing adapters, not rewriting the domain.

## Layers

Import direction (not runtime call order):

```text
app composition -> UI + application + concrete adapters
UI              -> application contracts
application     -> domain + application-owned ports
adapters        -> application-owned ports + domain
domain          -> no framework/provider/browser dependencies
```

The composition root injects concrete adapters into use cases. Calls go outward
through ports at runtime, but domain imports never point outward. Port examples
below describe intended contracts; they are not implemented interfaces yet.

Active-mission orchestration also separates:

- immutable plan constraints and deterministic evaluation;
- current observations such as position and confirmed progress;
- normalized provider evidence;
- reviewed historical observations;
- presentation, voice and optional LLM explanations.

The LLM never receives responsibility for combining these into feasibility.
Application use cases assemble a validated plan snapshot and invoke dedicated
engines before exposing structured facts to presentation.

### Domain

Pure TypeScript rules for:

- Time windows.
- Return margin.
- Feasibility.
- Activity duration and schedules.
- Budget and traveler calculations.
- Vehicles, consumption, and autonomy.
- Mission state transitions.

The domain does not import React, Next.js, browser APIs, databases, HTTP
clients, or provider SDKs.

### Application

Orchestrates use cases:

- Build or update a plan.
- Evaluate activities.
- Activate, save, dismiss, or complete a mission.
- Refresh an active mission.
- Resurface saved missions.

Application code depends on domain types and ports, not concrete providers.

### Adapters

Adapters normalize external behavior:

- Geolocation.
- Routing, isochrones, and matrices.
- Map rendering.
- Activities and events.
- Weather and natural phenomena.
- IndexedDB.
- Optional server-side LLM.

Each adapter validates external responses before returning internal records.

### App and components

The Next.js `app` layer composes routes and server boundaries. Components render
application state and invoke use cases. They do not contain provider-specific
business rules.

## Dependency rules

- Dependencies point inward toward domain.
- Domain never depends on adapters.
- UI never calls secret-bearing providers directly.
- Route Handlers expose narrow use cases, not generic proxies.
- No client-provided arbitrary URL may be fetched server-side.
- Normalized records cross adapter boundaries; provider payloads do not.

## Local-first model

Local state is the default authority for:

- Preferences.
- Vehicles.
- Plans.
- Saved and active missions.
- Cached normalized provider data.

IndexedDB is the intended persistent store. Every persisted schema has a
version. Precise live position is not retained beyond the active mission unless
explicitly enabled.

The application must remain useful without accounts. Optional server
functionality exists to protect secrets and query providers, not to establish a
multiuser backend.

Local-first does not mean offline-only or encrypted storage. Tile, geocoding,
routing and LLM calls can disclose data. The browser's storage can be cleared or
evicted; exports and recovery must exist before promising durable storage.
See [deployment boundaries](../security/README.md#deployment-boundaries).

## Planning data flow

```text
User input/GPS
  -> validate plan
  -> calculate remaining time
  -> request normalized routes/isochrones
  -> derive round-trip reachability (not an outbound isochrone alone)
  -> load normalized activities
  -> route each candidate or use a matrix
  -> evaluate activity duration, schedule, cost, and return
  -> rank only within deterministic constraints
  -> optionally ask LLM to explain structured results
  -> render map plus textual equivalent
```

Requests made obsolete by new input are cancelled. Last valid results may stay
visible as stale, never as current.
Attach a plan revision and evaluation timestamp to results; discard late
responses for older revisions even when request cancellation fails. Evaluate
time with an injected clock, and refresh on resume before showing current status.

During an active multi-point mission, the application loop is:

```text
recent origin + current time + confirmed progress
  -> create a new plan revision
  -> route only the remaining sequence
  -> reserve the route to the fixed hub
  -> retain, shorten, skip or end remaining visits deterministically
  -> publish the newest result if its revision is still current
```

The original itinerary is context, not authority. The fixed deadline, hub,
margin and current evidence govern the next decision. GPS updates location but
never mark a point visited; progress changes require explicit user action.

See the [feasibility contract](../data/feasibility.md) for asymmetric travel,
activity time, uncertainty and map classification.

## Provider ports

Illustrative port signatures (pseudocode; request/result schemas must be defined
for each implemented capability, not copied as compiling declarations):

```ts
interface RoutingProvider {
  getIsochrones(request: IsochroneRequest): Promise<IsochroneResult>;
  getRoute(request: RouteRequest): Promise<RouteResult>;
  getMatrix(request: MatrixRequest): Promise<MatrixResult>;
}

interface ActivityProvider {
  search(request: ActivitySearchRequest): Promise<ActivityResult>;
}

interface WeatherProvider {
  getConditions(request: WeatherRequest): Promise<WeatherResult>;
}
```

Contracts return provenance, queried time, expiry, coverage, and confidence.
Provider errors are typed and never converted into empty success results.

## LLM boundary

The LLM may:

- Propose activities or itinerary adjustments as unvalidated candidates.
- Explain why an activity fits.
- Compare already evaluated options.
- Summarize uncertainty.
- Produce optional narrative text.

The LLM may not:

- Calculate routes, time, cost, or feasibility.
- Invent activities, schedules, sources, or weather.
- Override unknown or unviable states.
- Receive secrets, raw calendar content, or unnecessary precise location.
- Execute provider URLs supplied by external content.

Every proposed activity or adjustment passes through deterministic validation
with fresh provider evidence before it can be shown as viable or offered for
confirmation. The model never inserts a proposal into the active plan directly.
Presentation profiles may transform validated structured facts into regional
or humorous language, but severity, values and required actions are immutable.

LLM output is untrusted external data and must be schema-validated and rendered
as text.

## Architectural decisions

Significant choices use [ADRs](./decisions/README.md) with:

- Context.
- Decision.
- Alternatives.
- Consequences.
- Security and privacy impact.
- Reversal strategy.

## Resumen en español

La arquitectura separa dominio puro, casos de uso, adaptadores y UI. Los datos
externos se normalizan y validan. La persistencia es local-first, los secretos
solo viven en servidor y el LLM únicamente explica resultados deterministas.
Los proveedores son sustituibles mediante contratos internos.
Las dependencias de código apuntan al dominio y los puertos; la composición
inyecta adaptadores. Cada resultado identifica su revisión para descartar
respuestas antiguas. Una isócrona de ida no demuestra que se pueda volver.

# Data contracts

**Status:** Decision  
**Last reviewed:** 2026-09-19

[Documentation index](../README.md) · [Feasibility contract](./feasibility.md)

The records below are canonical contracts, not a complete runtime schema.
The first implemented plan and feasibility slices are in
[the plan module](../../src/domain/plan.ts) and
[the feasibility module](../../src/domain/feasibility.ts); broader records
remain targets until migrated with tests.

## Principles

- Internal records are provider-independent.
- Unknown is represented explicitly, not as zero, empty text, or false.
- Every external value carries provenance and freshness.
- Dates are stored as ISO timestamps with offsets or as instants plus timezone.
- Money uses integer minor units and an ISO currency.
- Distances and durations use named units.
- Runtime validation occurs at storage, HTTP, and provider boundaries.

## Core records

### Plan

```ts
type Money = {
  minorUnits: number;
  currency: string;
};

type Plan = {
  id: string;
  startsAt: string;
  returnDeadline: string;
  timeZone: string;
  returnMarginMinutes: number;
  origin: PlanLocation;
  hub: PlanLocation;
  transport:
    | { mode: "walking" }
    | { mode: "car" | "motorcycle" | "bicycle"; vehicleId?: string };
  travelers: number;
  budget: Money;
};
```

The runtime validation for these fields is implemented in
[createPlan](../../src/domain/plan.ts). It does not persist data or call
providers.

Constraints:

- Deadline is after start.
- Margin is non-negative and shorter than the window.
- Travelers is a positive integer.
- Budget is non-negative.
- Hub coordinates are valid and include source/accuracy.

Money amounts must be safe integers with a supported ISO currency and its
minor-unit scale. Keep shared costs (fuel, tolls, parking) separate from
per-traveler costs (tickets, meals); multiply only the latter by travelers.
Unknown components remain unknown. Do not compare or sum mixed currencies
without a dated conversion policy.

### Location

```ts
type PlanLocation = {
  latitude: number;
  longitude: number;
  label?: string;
  source: "gps" | "manual" | "geocoded";
  accuracyMeters?: number;
  observedAt?: string;
};
```

Coordinates use WGS84. Precision sent to providers is no greater than required.
Latitude must be finite within [-90, 90] and longitude within [-180, 180].
GeoJSON positions are `[longitude, latitude]`, not the field order above.
GPS observations require observed time and accuracy; manual locations must not
pretend to have GPS accuracy.

Store an IANA timezone for schedules and user-facing dates alongside instants.
Ambiguous or nonexistent local times during DST require explicit resolution;
never silently assume the server's timezone.

### Vehicle

Modes:

- Car.
- Motorcycle.
- Bicycle.
- Walking.
- Public transport when a real provider exists.

A personal motor vehicle may include fuel type, consumption, usable range, and
cost assumptions. Missing values produce an unknown cost/range component, not
zero.
The current [vehicle domain](../../src/domain/vehicles.ts) validates synthetic
car, motorcycle and bicycle records and returns unknown cost when energy or
range data is unavailable. It does not infer fuel prices, autonomy or
mechanical safety.

### Activity

Required:

- Stable internal ID.
- Title.
- Coordinates.
- Start/end or opening schedule when applicable.
- Estimated duration or explicit unknown.
- Source status.
- Provenance.

Optional:

- Cost.
- Category.
- Description.
- Booking URL.
- Accessibility information.
- Weather sensitivity.

### Mission

Stores:

- Activity snapshot/reference.
- Recommendation origin.
- Lifecycle state.
- Save reason.
- Preparation state.
- Required conditions.
- Evaluation history.
- Completion and memory references.

### Feasibility

```ts
type FeasibilityStatus = "safe" | "tight" | "unviable" | "unknown";
```

The result contains outbound time, return time, wait, activity duration, margin,
evaluated time, route freshness, and reasons. Missing required inputs force
`unknown`.
Use the [canonical classification and acceptance cases](./feasibility.md);
the current implementation covers only the numeric route-evidence slice.
Do not infer safety from recommendation score or availability of coordinates.

## Validation

Validate:

- UI input before creating a plan.
- JSON parsed from IndexedDB or imports.
- Route Handler requests and responses.
- Every external provider response.
- LLM structured output.
- GeoJSON structure, coordinates, feature count, and size.

Validation errors are typed and user-correctable when possible. Never silently
coerce an invalid timestamp, coordinate, cost, or duration.

## Provenance

External records include:

```ts
type Provenance = {
  provider: string;
  sourceUrl?: string;
  fetchedAt: string;
  expiresAt?: string;
  license?: string;
  attribution?: string;
  confidence: "verified" | "reported" | "estimated" | "unknown";
};
```

Derived data records its algorithm/version and source record IDs.
`verified` describes source evidence, not guaranteed safety. Missing expiry is
not infinite validity: live routing and other time-sensitive evidence require
an explicit expiry policy before supporting feasibility. Unknown license means
reuse is unapproved, not unrestricted.

## Freshness and caching

- Weather and live events expire quickly.
- Static places and historical context may live longer.
- Routes expire according to provider capability and traffic assumptions.
- Cache keys include provider, profile, normalized origin, ranges, relevant
  options, and schema version.
- Stale data may support context but not a fresh safety claim.
- Cache entries have size and count limits.

For return evaluation, include destination/hub, departure instant or declared
time bucket, schedule version and freshness policy. Approximate origin keys
are acceptable for discovery only when their error bounds are documented; do
not reuse an approximate route as an exact safety result. A derived result
expires no later than its earliest required input and is invalidated when
relevant plan fields change.

## Persistence and migrations

The first persistence slice is implemented in
[`src/adapters/local-state.ts`](../../src/adapters/local-state.ts). It defines a
version-1 JSON envelope for the plan, vehicles, saved mission IDs and active
mission ID. Export validates the complete state and enforces a payload limit;
import parses untrusted JSON, rejects unsupported versions and revalidates
nested plans and vehicles before returning data. This is a contract boundary,
not durable storage: IndexedDB integration, migrations beyond version 1,
atomic writes and reload restoration are still pending.

IndexedDB schemas are versioned. Migrations:

- Are deterministic and tested against previous fixtures.
- Never discard personal data silently.
- Back up or export before destructive migration.
- Can fail with a recoverable message.

Imports include application schema version and are validated before mutation.
Apply changes atomically, leave existing records intact on failure, reject
unsupported future versions and define duplicate-ID handling before importing.
Bound import size and record count. Keep old-version synthetic fixtures to test
migrations. Handle quota exhaustion, unavailable storage and multiple-tab
conflicts explicitly; never acknowledge a durable save before commit.

Browser storage is not a backup. Origin changes can separate databases, and
private browsing or eviction may erase them. Deletion must cover all owned
stores and caches; cached tile retention also obeys provider licensing.

## Data minimization

- Store occupied calendar intervals instead of event contents when possible.
- Avoid storing precise location history.
- Do not store complete provider payloads unless required for debugging and
  legally permitted.
- Diagnostic fixtures are synthetic or explicitly reusable.

## Resumen en español

Los datos internos son independientes del proveedor. Unknown es un estado
explícito. Fechas, dinero, distancia y duración tienen formatos y unidades
definidos. Cada dato externo conserva procedencia, confianza y caducidad; todos
los límites validan en runtime y las migraciones de IndexedDB son versionadas.
El contrato de viabilidad distingue ida y vuelta, y el origen actual no cambia
el hub. Precios desconocidos no son cero; se separan costes compartidos y por
persona. Las importaciones y migraciones conservan los datos ante fallos.

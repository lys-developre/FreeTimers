# Active mission state contract

**Status:** Active  
**Deterministic contract:** Yes
**Last reviewed:** 2026-09-19

[Data contracts](./README.md) ·
[Implementation](../../src/domain/active-mission.ts) ·
[Tests](../../src/domain/active-mission.test.ts) ·
[Experience specification](../design/active-mission.md)

## English contract

<!-- contract-section:purpose -->
### Purpose and authority

The active-mission state machine records confirmed itinerary progress without
confusing GPS observations, model suggestions or provider responses with user
decisions. It preserves the validated plan snapshot and assigns a monotonically
increasing revision to every accepted state change.

The domain module is authoritative for implemented transitions. Adaptive
routing, automatic geofence proposals and multidimensional itinerary
optimization remain specified targets.

<!-- contract-section:sources -->
### Decision sources

| State change | Authoritative source | Non-authoritative signal |
| --- | --- | --- |
| Mission creation | User-confirmed validated plan and visit list | Recommendation score |
| Checklist completion | Explicit user action | GPS or LLM |
| Mission start | Explicit user action after readiness | Time alone |
| Arrival/departure | Explicit confirmation | GPS may propose later |
| Skip visit | Explicit user confirmation | Provider/LLM may recommend |
| Begin return | Explicit user confirmation | Deterministic engine may recommend |
| Itinerary replacement | Accepted proposal for current revision | Obsolete route response |
| Completion | Explicit user action after return state | GPS proximity to hub |

<!-- contract-section:model -->
### State model

Mission states:

```text
preparing -> active -> returning -> completed
```

Visit states:

```text
pending -> arrived -> completed
pending -> skipped
```

`in_progress` is reserved for a future explicit transition and may be accepted
when validating evolved records; current commands do not infer it.

Checklist items are `required` or `optional`. Pending required items make the
mission not ready but do not alter temporal feasibility.

<!-- contract-section:invariants -->
### Invariants and rationale

- Mission, visit and checklist IDs are non-empty and unique within scope.
- Revision begins at 1 and increases once per accepted mutation.
- The plan snapshot, hub, deadline and margin are preserved by progress
  commands.
- Start is permitted only from `preparing` with all required items complete.
- Arrival applies only to a pending visit in an active mission.
- Departure requires confirmed arrival and cannot precede it.
- Skip applies only to a pending visit.
- Beginning return skips remaining pending visits but preserves completed data.
- Completion applies only after return has begun.
- A proposal applies only when `baseRevision` equals the current revision.

These rules prevent inferred progress, dangling chronology and late provider
results from silently rewriting a newer plan.

<!-- contract-section:algorithm -->
### Command processing

Each command:

1. Validates current mission state.
2. Validates command identifiers, timestamps and payload.
3. Applies one immutable state transition.
4. Preserves unrelated records.
5. Increments the revision exactly once.
6. Returns a new mission value or throws an explicit error.

An itinerary proposal contains its base revision, complete proposed visit list,
reasons and creation time. Acceptance revalidates the proposal and rejects it
if any intervening action changed the mission.

<!-- contract-section:failures -->
### Failure and uncertainty

Invalid transitions throw errors and leave the previous value untouched. This
domain does not convert failures to no-op success. GPS, routing and LLM output
cannot call confirmation commands without the explicit application-level
consent required by the product specification.

Readiness and temporal feasibility are independent:

- required checklist pending -> not ready;
- route missing or stale -> feasibility unknown;
- both can occur simultaneously and must remain separately visible.

<!-- contract-section:evidence -->
### Implementation evidence and remaining limits

Tests cover immutable constraints, checklist readiness and editing, manual
progress, skipping, return/completion, runtime parsing and obsolete proposals.
Schema version 2 persists the complete active mission and migrates version 1
without inventing progress. The UI exposes preparation, checklist, manual
visit progress, return and completion while keeping missing route feasibility
explicitly unknown. GPS proposals, proposal comparison and adaptive route
evaluation remain to be implemented.

## Contrato completo en español

<!-- contract-section:purpose -->
### Propósito y autoridad

La máquina de estados de misión activa registra progreso confirmado sin
confundir observaciones GPS, sugerencias del modelo o respuestas de proveedores
con decisiones del usuario. Conserva la fotografía del plan validado y asigna
una revisión creciente a cada cambio aceptado.

El módulo de dominio manda sobre las transiciones implementadas. Routing
adaptativo, propuestas por geocerca y optimización multidimensional siguen
siendo objetivos especificados.

<!-- contract-section:sources -->
### Fuentes de decisión

| Cambio | Fuente autoritativa | Señal no autoritativa |
| --- | --- | --- |
| Crear misión | Plan y visitas validados y confirmados | Score de recomendación |
| Completar checklist | Acción explícita | GPS o LLM |
| Iniciar misión | Acción explícita tras estar lista | Solo el reloj |
| Llegada/salida | Confirmación explícita | El GPS podrá proponer |
| Omitir visita | Confirmación explícita | Proveedor/LLM puede recomendar |
| Iniciar regreso | Confirmación explícita | El motor puede recomendar |
| Reemplazar itinerario | Propuesta aceptada de revisión actual | Respuesta obsoleta |
| Completar misión | Acción explícita tras regresar | Cercanía GPS al hub |

<!-- contract-section:model -->
### Modelo de estados

Estados de misión:

```text
preparing -> active -> returning -> completed
```

Estados de visita:

```text
pending -> arrived -> completed
pending -> skipped
```

`in_progress` queda reservado para una transición explícita futura; los
comandos actuales no lo infieren.

Los elementos de checklist son obligatorios u opcionales. Un obligatorio
pendiente impide estar listo, pero no modifica la viabilidad temporal.

<!-- contract-section:invariants -->
### Invariantes y motivos

- IDs de misión, visita y checklist son no vacíos y únicos en su ámbito.
- La revisión empieza en 1 y aumenta una vez por mutación.
- Plan, hub, límite y margen se conservan durante el progreso.
- Solo se inicia desde `preparing` con obligatorios completados.
- Solo una visita pendiente de una misión activa admite llegada.
- La salida requiere llegada y no puede precederla.
- Solo una visita pendiente puede omitirse.
- Iniciar regreso omite pendientes y conserva completadas.
- Solo se completa después de iniciar regreso.
- Una propuesta solo aplica si `baseRevision` coincide con la revisión actual.

Así se evita progreso inferido, cronología imposible y respuestas tardías que
reescriban un plan más nuevo.

<!-- contract-section:algorithm -->
### Procesamiento de comandos

Cada comando:

1. Valida el estado actual.
2. Valida IDs, timestamps y payload.
3. Aplica una transición inmutable.
4. Conserva registros ajenos.
5. Incrementa exactamente una revisión.
6. Devuelve un valor nuevo o lanza error explícito.

Una propuesta contiene revisión base, lista completa propuesta, motivos y
momento de creación. La aceptación la revalida y la rechaza si ocurrió cualquier
cambio intermedio.

<!-- contract-section:failures -->
### Fallos e incertidumbre

Una transición inválida lanza error y no altera el valor anterior. El dominio no
convierte fallos en éxito vacío. GPS, routing y LLM no pueden ejecutar comandos
de confirmación sin el consentimiento exigido en aplicación.

Preparación y viabilidad son independientes:

- checklist obligatorio pendiente -> no listo;
- ruta ausente o caducada -> viabilidad desconocida;
- ambos pueden coexistir y deben mostrarse por separado.

<!-- contract-section:evidence -->
### Evidencia y límites pendientes

Los tests cubren restricciones inmutables, preparación y edición de checklist,
progreso manual, omisión, regreso/completado, parseo runtime y propuestas
obsoletas. El esquema 2 persiste la misión completa y migra la versión 1 sin
inventar progreso. La UI ofrece preparación, checklist, progreso manual,
regreso y finalización, mostrando la viabilidad de ruta ausente como
desconocida. Propuestas GPS, comparación y evaluación adaptativa de rutas
siguen pendientes.

## Resumen en español

La misión activa conserva las restricciones de regreso, exige confirmaciones
para el progreso y usa revisiones para rechazar propuestas obsoletas. Checklist
y viabilidad permanecen como dimensiones independientes.

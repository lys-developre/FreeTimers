# Return feasibility contract

**Status:** Decision  
**Deterministic contract:** Yes
**Last reviewed:** 2026-09-19

[Data contracts](./README.md) · [Documentation index](../README.md)

## English contract

<!-- contract-section:purpose -->
### Purpose and authority

This is the canonical calculation specification, not an implemented API.
It assesses temporal feasibility under stated route assumptions, not physical
safety or a probability of arriving. The LLM cannot change its result.

<!-- contract-section:sources -->
### Decision sources

| Input | Required source | Trust condition |
| --- | --- | --- |
| Start, deadline, hub and margin | Validated plan | Explicit current revision |
| Evaluation time | Injected application clock | Recorded with the result |
| Current origin | Recent GPS or confirmed manual location | Valid coordinates, age and accuracy |
| Outbound and return duration | Normalized routing evidence | Correct profile/departure and unexpired |
| Wait and schedule | Validated activity/provider record | Applicable date, timezone and freshness |
| Remaining stay | User-confirmed progress plus validated duration model | Elapsed time is not counted again |
| Breaks | Deterministic policy and explicit known needs | Included rather than hidden |

Affinity, model prose and map color are never calculation sources.

<!-- contract-section:inputs -->
### Inputs and time semantics

- `departure`: planned start for future planning; `max(now, startsAt)` during
  an active mission, using an injected evaluation clock. Never calculate
  remaining time from the original start after the mission has begun.
- `deadline`: fixed return instant, with the user's display timezone.
- `hub`: intended return point. GPS movement changes current origin, not hub.
- `margin`: non-negative user reserve before the deadline.
- `outbound`: route from departure position to candidate.
- `wait`: delay until admission/start; event end and opening constraints also
  apply.
- `stay`: estimated remaining activity duration, not time already spent.
- `return`: route from candidate to hub at expected return departure time.
- `breaks`: required rest, refuelling or other known travel overhead.

Calculate in consistent exact units; round for display only. Validate finite,
non-negative durations, valid coordinates and timestamps, and an ordered window.
Invalid user input is an actionable validation error, not `unviable` or zero.
Missing or invalid provider evidence gives `unknown`.

<!-- contract-section:classification -->
### Classification

```text
remaining = deadline - departure
required = outbound + wait + stay + return + breaks
slack = remaining - required

valid required evidence AND slack >= margin -> safe
valid required evidence AND 0 <= slack < margin -> tight
valid required evidence AND slack < 0 -> unviable
missing, stale or unsupported required evidence -> unknown
```

Evaluate known hard blockers separately: a confirmed cancellation or expired
deadline remains a blocker even if route data is also missing. Never hide a
known blocker behind an optimistic result. Keep reasons for every assessment.

With a zero margin, equality at the deadline qualifies as `safe` by the formula
but the UI must state “sin margen de reserva”; it must not imply resilience.
Do not expose a probability or “almost impossible” claim without a validated
probabilistic model.

<!-- contract-section:map -->
### Map versus activity

- The general area represents mobility only: `wait = stay = 0`. Clearly label
  this assumption; it does not mean an activity fits there.
- Outbound and return routes may differ. Do not double outbound travel time or
  halve the window and call the resulting isochrone a verified round trip.
- Once a mission starts, outbound origin is current GPS/manual location while
  return destination remains hub. Concentric outbound rings cannot represent
  that entire problem.
- Candidate isochrones can bound a search. Final zones require a round-trip
  method with documented sampling, resolution and coverage. Unverified gaps
  stay unknown rather than becoming red or green through interpolation.
- Do not paint everything outside provider coverage as unviable.
- Re-evaluate each selected activity using its schedule, remaining duration and
  both route legs. Its assessment takes precedence over the general area.
- Long windows are not continuous driving allowances. Required rest and
  overnight needs must be represented; missing assumptions prevent a confident
  feasible recommendation.

<!-- contract-section:constraints -->
### Other constraints

Time, budget, vehicle suitability, autonomy, access and relevant conditions have
separate results. A temporal `safe` result is not overall suitability.
Unknown price is not free. Known insufficient range or a confirmed closure
cannot be overridden by affinity, a green mobility zone or an LLM explanation.
Display missing constraints and block any overall “ready” claim they prevent.

<!-- contract-section:active-refresh -->
### Active-mission refresh

On resume, obtain a recent position (or explicitly confirmed manual position),
current time and fresh return evidence. Time already spent is deducted from
the remaining window automatically; do not add the full activity duration again.
GPS alone does not prove when an activity started or ended. Keep elapsed-time
inference separate from user-confirmed progress.

For a mission with multiple visit points, evaluate the remaining ordered
sequence from the current origin and current time. Confirmed completed or
skipped points consume their recorded time but are not routed again. For every
remaining prefix, include travel between points, remaining stay/wait time,
known breaks and a fresh route from the final retained point to the fixed hub.
Choose only a prefix that preserves the required return classification; a point
that makes the return unknown, tight or unviable cannot be retained under a
stronger label from an earlier evaluation.

Refresh is event-driven while the application is active: meaningful position
change, confirmed point progress, elapsed-time threshold, route expiry,
schedule/condition change, plan edit and application resume each create a new
plan revision. Throttle GPS and network work according to movement, freshness,
battery and provider limits. “Real time” does not promise continuous background
execution while the browser or PWA is suspended.

Every result identifies plan revision, evaluated time, route assumptions,
freshness and algorithm version. Reject obsolete results. Do not move hub
silently or promise background monitoring when the PWA is closed.

<!-- contract-section:acceptance -->
### Acceptance cases for TDD

Synthetic minutes; all evidence is valid unless stated otherwise:

| Case | Remaining / margin | Required | Expected |
| --- | --- | --- | --- |
| Exact reserve | 120 / 20 | 100 | `safe`, slack 20 |
| Inside reserve | 120 / 20 | 101 | `tight`, slack 19 |
| Exact deadline | 120 / 20 | 120 | `tight`, slack 0 |
| Too late | 120 / 20 | 121 | `unviable` |
| No reserve | 120 / 0 | 120 | `safe` with no-reserve warning |
| Return evidence expired | 120 / 20 | Not trusted | `unknown`, no green activity |
| Asymmetric legs | 120 / 20 | 30 out + 20 stay + 80 return | `unviable`; doubling 30 is invalid |
| Active mission | 60 / 10 | 0 out + 15 remaining stay + 35 return | `safe`, no repeat of elapsed stay |
| Active multi-stop plan | 90 / 15 | next point 20 + stay 25 + later point 25 + return 35 | Drop the later point; retained sequence must preserve return margin |

Also test cross-midnight/DST, scheduled waiting, cancellation, unknown prices,
insufficient range, rest requirements, no coverage and out-of-order requests.
These cases are a test specification; do not report them as passing tests until
they exist in code.

## Contrato completo en español

<!-- contract-section:purpose -->
### Propósito y autoridad

Este es el contrato canónico del cálculo, no una API completamente implementada.
Evalúa viabilidad temporal bajo supuestos de ruta declarados, no seguridad
física ni probabilidad de llegada. El LLM no puede modificar el resultado.

<!-- contract-section:sources -->
### Fuentes de decisión

| Entrada | Fuente requerida | Condición de confianza |
| --- | --- | --- |
| Inicio, límite, hub y margen | Plan validado | Revisión actual explícita |
| Hora de evaluación | Reloj inyectado por aplicación | Registrada en el resultado |
| Origen actual | GPS reciente o ubicación manual confirmada | Coordenadas, edad y precisión válidas |
| Duración de ida y vuelta | Evidencia normalizada de routing | Perfil/hora correctos y no caducada |
| Espera y horario | Registro validado de actividad/proveedor | Fecha, zona y frescura aplicables |
| Estancia restante | Progreso confirmado y duración validada | No se vuelve a contar tiempo transcurrido |
| Descansos | Política determinista y necesidades conocidas | Se incluyen, no se ocultan |

Afinidad, prosa del modelo y color del mapa nunca son fuentes del cálculo.

<!-- contract-section:inputs -->
### Entradas y semántica temporal

- `departure`: inicio planeado en planificación futura; `max(now, startsAt)`
  durante una misión activa usando un reloj inyectado. Nunca se calcula el
  tiempo restante desde el inicio original una vez comenzada la misión.
- `deadline`: instante fijo de regreso con zona horaria de presentación.
- `hub`: destino de regreso. El movimiento GPS cambia el origen, no el hub.
- `margin`: reserva no negativa elegida por el usuario.
- `outbound`: ruta desde la posición de salida hasta el candidato.
- `wait`: espera hasta admisión/inicio, incluyendo restricciones de horario.
- `stay`: duración restante, no tiempo ya consumido.
- `return`: ruta desde el candidato al hub para la hora prevista.
- `breaks`: descansos, repostaje y sobrecostes temporales conocidos.

Se calculan unidades exactas coherentes y solo se redondea para presentar.
Duraciones, coordenadas y tiempos inválidos son errores; evidencia ausente o
inválida del proveedor produce `unknown`.

<!-- contract-section:classification -->
### Clasificación

```text
remaining = deadline - departure
required = outbound + wait + stay + return + breaks
slack = remaining - required

evidencia válida AND slack >= margin -> safe
evidencia válida AND 0 <= slack < margin -> tight
evidencia válida AND slack < 0 -> unviable
evidencia ausente, caducada o no soportada -> unknown
```

Los bloqueos duros se evalúan por separado. Una cancelación confirmada o un
límite vencido no se ocultan detrás de evidencia faltante. Con margen cero,
llegar exactamente al límite es `safe` por fórmula, pero la UI debe decir “sin
margen de reserva”. No se muestra probabilidad sin un modelo probabilístico
validado.

<!-- contract-section:map -->
### Mapa frente a actividad

- El área general representa movilidad con `wait = stay = 0`, no una actividad.
- Ida y vuelta pueden diferir; no se duplica la ida.
- En misión activa, el origen es la posición actual y el destino sigue siendo
  el hub.
- Las isócronas pueden acotar búsqueda; zonas finales requieren ida y vuelta
  documentada.
- Huecos no verificados siguen desconocidos.
- La evaluación individual de actividad prevalece sobre el área general.
- Ventanas largas deben incluir descansos y necesidades nocturnas.

<!-- contract-section:constraints -->
### Otras restricciones

Tiempo, presupuesto, vehículo, autonomía, acceso y condiciones producen
resultados separados. `safe` temporal no significa idoneidad global. Precio
desconocido no es gratuito; autonomía insuficiente o cierre confirmado no se
anulan por afinidad, mapa verde o explicación del LLM.

<!-- contract-section:active-refresh -->
### Actualización de misión activa

Al reanudar se obtiene posición reciente, hora actual y evidencia fresca de
regreso. El tiempo gastado se descuenta; el GPS no demuestra por sí solo cuándo
comenzó o terminó una actividad.

En itinerarios con varios puntos se evalúa la secuencia restante desde el origen
y hora actuales. Puntos completados u omitidos no se enrutan otra vez. Cada
prefijo restante incluye viajes, estancia/espera, descansos y vuelta fresca al
hub. Solo se conserva un prefijo que mantenga la clasificación requerida.

Cada movimiento significativo, progreso confirmado, umbral temporal,
caducidad, cambio de condición, edición o reanudación crea una nueva revisión.
GPS y red se limitan según movimiento, frescura, batería y cuotas. Tiempo real
no promete ejecución cuando navegador o PWA están suspendidos.

Cada resultado identifica revisión, hora evaluada, supuestos, frescura y versión
del algoritmo. Se rechazan respuestas obsoletas y nunca se mueve el hub
silenciosamente.

<!-- contract-section:acceptance -->
### Casos de aceptación TDD

| Caso | Restante / margen | Requerido | Esperado |
| --- | --- | --- | --- |
| Reserva exacta | 120 / 20 | 100 | `safe`, slack 20 |
| Dentro de reserva | 120 / 20 | 101 | `tight`, slack 19 |
| Límite exacto | 120 / 20 | 120 | `tight`, slack 0 |
| Demasiado tarde | 120 / 20 | 121 | `unviable` |
| Sin reserva | 120 / 0 | 120 | `safe` con advertencia |
| Regreso caducado | 120 / 20 | No confiable | `unknown` |
| Tramos asimétricos | 120 / 20 | 30 ida + 20 estancia + 80 vuelta | `unviable` |
| Misión activa | 60 / 10 | 0 ida + 15 estancia + 35 vuelta | `safe` |
| Varias paradas | 90 / 15 | 20 + 25 + 25 + 35 | Omitir la posterior |

También se prueban DST, espera programada, cancelación, precios desconocidos,
autonomía, descansos, ausencia de cobertura y respuestas fuera de orden. Los
casos especificados no se declaran implementados hasta existir tests.

## Resumen en español

La viabilidad compara tiempo restante con ida, espera, estancia, vuelta y
descansos usando evidencia fresca. Conserva el hub y margen, separa otras
restricciones y rechaza respuestas obsoletas; la versión española completa está
incluida en este mismo contrato.

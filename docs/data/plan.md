# Planning configuration contract

**Status:** Active
**Deterministic contract:** Yes
**Last reviewed:** 2026-09-25

[Data contracts](./README.md) · [Implementation](../../src/domain/plan.ts) ·
[Tests](../../src/domain/plan.test.ts)

## English contract

<!-- contract-section:purpose -->
### Purpose and authority

The plan is the validated snapshot of constraints selected before evaluation.
It defines when travel may begin, where it must end, the return reserve,
mobility, travelers and budget. It does not contain routes, weather, activity
availability or a feasibility result.

The executable authority is `createPlan`; this document explains why its
invariants exist and which inputs may support them.

<!-- contract-section:sources -->
### Decision sources

| Field | Accepted source | Trust rule |
| --- | --- | --- |
| Start and deadline | Explicit user input or user-confirmed calendar interval | Calendar content never changes the plan without confirmation |
| Timezone | Explicit IANA zone associated with the plan | Never infer from the server |
| Origin | Manual, GPS or validated geocoding | GPS includes observation time and accuracy before supporting live use |
| Hub | Explicit user choice, initially often the planning origin | Movement never changes it silently |
| Margin | Explicit user preference | Providers and the LLM cannot reduce it |
| Reachability speed | Explicit editable assumption, with a mode-specific starting value | It supports a geometric estimate only; it is not measured route evidence |
| Transport and vehicle | Explicit selection from validated local profiles | Motor modes require a vehicle reference |
| Travelers and budget | Explicit user input | Money uses integer minor units and one ISO currency |

<!-- contract-section:invariants -->
### Invariants and rationale

- `returnDeadline` is strictly later than `startsAt`; an empty or reversed
  window cannot be evaluated.
- `returnMarginMinutes` is finite, non-negative and shorter than the window.
- `reachabilitySpeedKmh`, when present, is finite, positive and at most
  300 km/h. It is an editable assumption, not a claim about observed speed.
- Latitude is within `[-90, 90]`; longitude is within `[-180, 180]`.
- Traveler count is a positive safe integer.
- Budget is a non-negative safe integer in minor units.
- Currency is a three-letter uppercase ISO code.
- Car and motorcycle require a non-empty `vehicleId`.
- Bicycle may reference a saved profile; walking does not require one.
- The returned plan preserves validated values. It does not invent defaults,
  normalize unknown money to zero or call a provider.

These rules prevent malformed local/imported data from reaching routing or
feasibility and prevent a moving origin from redefining the required return
destination.

<!-- contract-section:algorithm -->
### Validation sequence

1. Parse start and deadline as instants.
2. Prove an ordered positive window.
3. Validate margin against the complete window and any reachability speed
   assumption.
4. Validate timezone, origin and hub.
5. Validate transport and required vehicle reference.
6. Validate travelers and budget.
7. Return the plan only if every invariant holds.

Validation failure is an actionable input error. It is not `unknown`,
`unviable` or a partially valid plan.

<!-- contract-section:failures -->
### Failure and uncertainty

`createPlan` throws explicit range errors for invalid values. Provider
uncertainty is intentionally absent from this contract: GPS freshness,
geocoding confidence and route evidence are evaluated at their own boundaries.
A syntactically valid plan is not proof that any activity fits.

<!-- contract-section:evidence -->
### Implementation evidence and remaining limits

Implemented tests cover ordered timestamps, margins, coordinates, travelers,
money, timezone and vehicle references. DST ambiguity resolution, calendar
adapters and live GPS freshness remain separate future capabilities.
Plans from older local data remain valid without the optional speed; the
application supplies a visible, editable starting assumption for display only.

## Contrato completo en español

<!-- contract-section:purpose -->
### Propósito y autoridad

El plan es la fotografía validada de las restricciones elegidas antes de
evaluar actividades. Define cuándo puede comenzar el viaje, dónde debe terminar,
la reserva para volver, la movilidad, los viajeros y el presupuesto. No contiene
rutas, clima, disponibilidad de actividades ni un resultado de viabilidad.

La autoridad ejecutable es `createPlan`; este documento explica por qué existen
sus invariantes y qué entradas pueden respaldarlas.

<!-- contract-section:sources -->
### Fuentes de decisión

| Campo | Fuente aceptada | Regla de confianza |
| --- | --- | --- |
| Inicio y límite | Entrada explícita o intervalo de calendario confirmado | El calendario nunca modifica el plan sin confirmación |
| Zona horaria | Zona IANA explícita asociada al plan | Nunca se infiere desde el servidor |
| Origen | Manual, GPS o geocodificación validada | El GPS incluye instante y precisión antes de sostener uso en vivo |
| Hub | Elección explícita, normalmente el origen inicial | El movimiento nunca lo cambia silenciosamente |
| Margen | Preferencia explícita | Proveedores e IA no pueden reducirlo |
| Velocidad de alcance | Supuesto editable explícito, con un valor inicial por modo | Solo sirve para una estimación geométrica; no es evidencia de rutas medidas |
| Transporte y vehículo | Selección explícita de perfiles locales validados | Los modos motorizados requieren referencia |
| Viajeros y presupuesto | Entrada explícita | El dinero usa unidades menores enteras y una moneda ISO |

<!-- contract-section:invariants -->
### Invariantes y motivos

- `returnDeadline` es estrictamente posterior a `startsAt`.
- `returnMarginMinutes` es finito, no negativo y menor que la ventana.
- `reachabilitySpeedKmh`, si existe, es finita, positiva y como máximo
  300 km/h. Es un supuesto editable, no una velocidad observada.
- La latitud pertenece a `[-90, 90]` y la longitud a `[-180, 180]`.
- El número de viajeros es un entero seguro positivo.
- El presupuesto es un entero seguro no negativo en unidades menores.
- La moneda es un código ISO de tres letras mayúsculas.
- Coche y moto requieren un `vehicleId` no vacío.
- Bicicleta puede referenciar una ficha; caminar no la necesita.
- El resultado conserva valores validados. No inventa valores, no convierte
  dinero desconocido en cero ni consulta proveedores.

Estas reglas evitan que datos locales o importados malformados lleguen al
routing o la viabilidad y que un origen móvil redefina el destino de regreso.

<!-- contract-section:algorithm -->
### Secuencia de validación

1. Interpretar inicio y límite como instantes.
2. Demostrar una ventana positiva y ordenada.
3. Validar el margen contra toda la ventana y cualquier supuesto de velocidad.
4. Validar zona horaria, origen y hub.
5. Validar transporte y referencia requerida.
6. Validar viajeros y presupuesto.
7. Devolver el plan únicamente si todo se cumple.

Un fallo es un error corregible de entrada. No es `unknown`, `unviable` ni un
plan parcialmente válido.

<!-- contract-section:failures -->
### Fallos e incertidumbre

`createPlan` lanza errores explícitos para valores inválidos. La incertidumbre
de proveedores queda fuera: frescura GPS, confianza de geocodificación y rutas
se validan en sus límites. Un plan sintácticamente válido no demuestra que una
actividad encaje.

<!-- contract-section:evidence -->
### Evidencia y límites pendientes

Los tests cubren timestamps ordenados, margen, coordenadas, viajeros, dinero,
zona horaria y referencias de vehículo. La ambigüedad DST, adaptadores de
calendario y frescura GPS pertenecen a capacidades futuras.
Los planes locales anteriores siguen siendo válidos sin esa velocidad opcional;
la aplicación aporta un valor inicial visible y editable solo para mostrar una
estimación.

## Resumen en español

El plan valida las restricciones elegidas por el usuario sin consultar
proveedores ni inferir viabilidad. Mantiene fijo el hub, exige una ventana
ordenada y representa dinero, movilidad y coordenadas con reglas explícitas.

# Vehicle and energy contract

**Status:** Active
**Deterministic contract:** Yes
**Last reviewed:** 2026-09-19

[Data contracts](./README.md) · [Implementation](../../src/domain/vehicles.ts) ·
[Tests](../../src/domain/vehicles.test.ts)

## English contract

<!-- contract-section:purpose -->
### Purpose and authority

The vehicle contract validates local car, motorcycle and bicycle profiles and
estimates energy cost only when sufficient explicit evidence exists. It is not
a mechanical-safety model, live fuel-price service or routing engine.

<!-- contract-section:sources -->
### Decision sources

| Value | Current source | Future acceptable source |
| --- | --- | --- |
| Mode and name | User-authored local profile | None inferred |
| Consumption | Explicit profile value | User-approved learned context profile |
| Unit price | Explicit user value | Dated validated price provider |
| Usable range | Explicit conservative value | User-approved observed profile |
| Distance | Caller-provided validated route distance | Routing adapter |
| Occupancy/load effects | Not implemented | Reviewed observations with context and sample count |

Unknown energy, range or distance never becomes zero or unlimited.

<!-- contract-section:invariants -->
### Invariants and units

- Mode is exactly `car`, `motorcycle` or `bicycle`.
- IDs and names are non-empty.
- Motor vehicles require energy data.
- Fuel uses liters; electric energy uses kWh.
- Consumption per 100 km is finite and positive.
- Unit price is a non-negative safe integer in minor currency units.
- Currency is an uppercase three-letter ISO code.
- Usable range, when provided, is finite and positive.
- Bicycle profiles carry no invented motor-energy assumptions.

<!-- contract-section:algorithm -->
### Cost calculation

For validated distance within usable range:

```text
energy units = distanceKm / 100 × consumptionPer100Km
minor cost = ceil(energy units × costPerUnitMinor)
```

Ceiling prevents fractional minor units from understating the estimate. The
function returns `null` when energy or usable range is absent or distance
exceeds range. `null` means unknown/not established, never free.

Current estimation does not yet adjust consumption for occupancy, load, road,
traffic or weather. Those inputs will produce conservative learned profiles
only after reviewed observations and explicit promotion.

<!-- contract-section:failures -->
### Failure behavior

Malformed runtime enum values, inconsistent energy units, invalid consumption,
range or price throw explicit errors. Insufficient valid evidence returns
unknown cost instead of an optimistic number.

<!-- contract-section:evidence -->
### Implementation evidence and remaining limits

Tests cover fuel and electric unit consistency, invalid runtime values,
rounding, range limits, missing evidence and bicycles. Route-integrated cost,
occupancy adjustments and learned confidence intervals remain unimplemented.

## Contrato completo en español

<!-- contract-section:purpose -->
### Propósito y autoridad

El contrato de vehículos valida fichas locales de coche, moto y bicicleta y
estima coste energético solo cuando existe evidencia explícita suficiente. No
es un modelo de seguridad mecánica, un servicio de precios en vivo ni routing.

<!-- contract-section:sources -->
### Fuentes de decisión

| Valor | Fuente actual | Fuente futura aceptable |
| --- | --- | --- |
| Modo y nombre | Ficha local escrita por el usuario | No se infiere |
| Consumo | Valor explícito | Perfil contextual aprendido y aprobado |
| Precio unitario | Valor explícito | Proveedor validado con fecha |
| Autonomía útil | Valor conservador explícito | Perfil observado y aprobado |
| Distancia | Distancia de ruta validada aportada por quien llama | Adaptador de routing |
| Efecto de ocupación/carga | No implementado | Observaciones revisadas con contexto y muestras |

Energía, autonomía o distancia desconocidas nunca equivalen a cero o infinito.

<!-- contract-section:invariants -->
### Invariantes y unidades

- El modo es exactamente `car`, `motorcycle` o `bicycle`.
- ID y nombre no están vacíos.
- Los vehículos motorizados requieren energía.
- Combustible usa litros y electricidad usa kWh.
- El consumo por 100 km es finito y positivo.
- El precio es un entero seguro no negativo en unidades menores.
- La moneda es un código ISO de tres letras mayúsculas.
- La autonomía, si existe, es finita y positiva.
- La bicicleta no recibe supuestos energéticos motorizados inventados.

<!-- contract-section:algorithm -->
### Cálculo del coste

Para una distancia validada dentro de la autonomía:

```text
unidades de energía = distanceKm / 100 × consumptionPer100Km
coste menor = ceil(unidades × costPerUnitMinor)
```

El redondeo superior evita infravalorar fracciones de la unidad monetaria. Se
devuelve `null` si faltan energía o autonomía o si la distancia la supera.
`null` significa desconocido/no demostrado, nunca gratuito.

La estimación actual aún no ajusta ocupantes, carga, vía, tráfico o clima.
Esos factores solo generarán perfiles conservadores tras observaciones
revisadas y promoción explícita.

<!-- contract-section:failures -->
### Comportamiento ante fallos

Valores runtime desconocidos, unidades incompatibles o consumo, autonomía y
precio inválidos producen errores explícitos. Evidencia insuficiente devuelve
coste desconocido en vez de una cifra optimista.

<!-- contract-section:evidence -->
### Evidencia y límites pendientes

Los tests cubren coherencia de unidades, enums inválidos, redondeo, autonomía,
evidencia ausente y bicicletas. Coste integrado con rutas, ocupación e
intervalos aprendidos siguen pendientes.

## Resumen en español

Las fichas de vehículo usan unidades y precios explícitos. Solo se estima coste
cuando hay consumo, autonomía y distancia válidos; lo desconocido nunca se
trata como gratuito.

# Recommendation ranking contract

**Status:** Active
**Deterministic contract:** Yes
**Last reviewed:** 2026-09-19

[Data contracts](./README.md) · [Implementation](../../src/domain/missions.ts) ·
[Tests](../../src/domain/missions.test.ts)

## English contract

<!-- contract-section:purpose -->
### Purpose and authority

The current ranking is a bounded demo heuristic. It filters synthetic missions
by declared duration and cost, then orders them by tag affinity and spare
duration. It does not calculate travel, schedules, return feasibility,
availability or safety.

<!-- contract-section:sources -->
### Decision sources

| Input | Source | Limitation |
| --- | --- | --- |
| Window | Validated plan timestamps | Uses total window, not current active time |
| Duration | Synthetic mission record | Excludes travel, wait and breaks |
| Cost | Synthetic mission record | Unknown mandatory costs are not represented |
| Tags | Synthetic mission and explicit preference tags | Affinity only |

No GPS, routing, traffic, weather, opening hours or LLM output enters the
current score.

<!-- contract-section:invariants -->
### Eligibility rules

- A mission longer than the declared window is removed.
- A mission above the declared budget is removed.
- Remaining missions start at score 50.
- Each matching preference tag adds 15.
- Duration at or below 75% of the window adds 10.
- Score is capped at 100.
- Results sort descending by score.

This score is not a probability, safety level or contractual 70/20/10 mix.

<!-- contract-section:algorithm -->
### Algorithm and rationale

The implementation intentionally stays simple while the real provider and
feasibility pipeline is absent:

```text
eligible = duration <= window AND estimatedCost <= budget
score = min(100, 50 + 15 × matchingTags + compactDurationBonus)
```

The heuristic exists only to exercise UI ordering. Future recommendation
generation must first pass hard deterministic constraints and may then use
affinity to order eligible candidates. Affinity can never upgrade unknown,
tight or unviable travel evidence.

<!-- contract-section:failures -->
### Failure behavior

The current demo types do not represent unknown duration or price; therefore
only synthetic validated records should reach this module. External or imported
activities require a richer validated contract before ranking.

<!-- contract-section:evidence -->
### Implementation evidence and remaining limits

Tests cover window calculation, duration and budget rejection, and affinity
ordering. Real-world recommendation generation, corridor search, provenance,
freshness and multidimensional constraints remain unimplemented.

## Contrato completo en español

<!-- contract-section:purpose -->
### Propósito y autoridad

El ranking actual es una heurística demo limitada. Filtra misiones sintéticas
por duración y coste declarados y las ordena por afinidad de etiquetas y margen
de duración. No calcula viaje, horarios, regreso, disponibilidad ni seguridad.

<!-- contract-section:sources -->
### Fuentes de decisión

| Entrada | Fuente | Limitación |
| --- | --- | --- |
| Ventana | Timestamps del plan validado | Usa la ventana total, no tiempo activo |
| Duración | Registro sintético | Excluye viaje, espera y descansos |
| Coste | Registro sintético | No representa costes obligatorios desconocidos |
| Etiquetas | Misión y preferencias explícitas | Solo afinidad |

El score actual no usa GPS, routing, tráfico, clima, horarios ni salida del LLM.

<!-- contract-section:invariants -->
### Reglas de elegibilidad

- Se elimina una misión más larga que la ventana.
- Se elimina una misión por encima del presupuesto.
- Las restantes comienzan con score 50.
- Cada etiqueta coincidente suma 15.
- Duración igual o menor al 75% suma 10.
- El score se limita a 100.
- Se ordena de mayor a menor.

No es probabilidad, nivel de seguridad ni cuota contractual 70/20/10.

<!-- contract-section:algorithm -->
### Algoritmo y motivo

La implementación se mantiene simple mientras no exista el pipeline real:

```text
elegible = duración <= ventana AND costeEstimado <= presupuesto
score = min(100, 50 + 15 × etiquetasCoincidentes + bonoDuración)
```

Solo sirve para ejercitar la UI. En el futuro, primero se cumplirán restricciones
duras y después la afinidad ordenará candidatos elegibles. La afinidad nunca
mejora evidencia desconocida, ajustada o inviable.

<!-- contract-section:failures -->
### Comportamiento ante fallos

Los tipos demo no representan duración o precio desconocidos; por eso solo deben
entrar registros sintéticos validados. Actividades externas o importadas
necesitan un contrato más rico antes del ranking.

<!-- contract-section:evidence -->
### Evidencia y límites pendientes

Los tests cubren ventana, rechazo por duración/presupuesto y orden por afinidad.
Generación real, corredor GPS, procedencia, frescura y restricciones
multidimensionales siguen sin implementarse.

## Resumen en español

El ranking existente solo ordena misiones sintéticas por duración, presupuesto
y afinidad. No demuestra viabilidad ni seguridad y será sustituido por un
pipeline de restricciones duras antes de ordenar recomendaciones reales.

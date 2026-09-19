# Screen specification template

**Status:** Active  
**Last reviewed:** 2026-09-19

[Design index](./README.md) · [Validation matrix](../testing/README.md#validation-by-change-type)

Copy this template into an issue, pull request description, or temporary design
artifact before implementing a significant screen.

## Identity

- **Screen:**
- **Route or entry point:**
- **Owner:**
- **Status:** Draft / Ready / Implemented / Validated
- **Existing implementation or new target:**

## User context

- **User goal:**
- **Physical context:** stationary / walking / driving passenger / outdoors /
  low connectivity / other
- **Primary decision:**
- **Primary action:**
- **Most harmful misunderstanding:**

## Information hierarchy

### Must be immediately visible

-

### Available on demand

-

### Explicitly excluded

-

## Inputs and outputs

### Inputs

| Input | Source | Validation | Sensitive? |
| --- | --- | --- | --- |
|  |  |  |  |

### Outputs

| Output | Source/calculation | Freshness | Unknown behavior |
| --- | --- | --- | --- |
|  |  |  |  |

## States

Describe behavior, copy, and recovery for:

- Initial.
- Loading.
- Empty.
- Partial data.
- Stale data.
- Offline.
- Permission denied.
- Unsupported coverage.
- Error.
- Success.
- Active/selected.

## Responsive transformation

### Compact mobile

-

### Mobile landscape / tablet

-

### Desktop

-

## Interaction model

- **Keyboard:**
- **Touch:**
- **Focus behavior:**
- **Confirmation:**
- **Undo:**
- **Optimistic updates:**
- **Persistence failure/rollback:**
- **Result revision and invalidation:**
- **Modal or nonmodal sheet behavior:**
- **Reduced motion:**

## Accessibility

- **Semantic structure:**
- **Accessible names:**
- **Non-color status indicators:**
- **Live announcements:**
- **Text alternative to map/visualization:**
- **200% text resize and 320 CSS px reflow/400% zoom:**

## Visual direction

- **Relevant product traits:**
- **Composition rationale:**
- **Patterns reused:**
- **New pattern and justification, if any:**

## Acceptance criteria

- [ ] The primary decision is understandable without explanation.
- [ ] The primary action is visually and semantically clear.
- [ ] Critical information does not rely only on color.
- [ ] Loading, empty, error, stale, and offline states are implemented.
- [ ] Mobile is a deliberate composition, not a reduced desktop layout.
- [ ] Keyboard and touch paths work.
- [ ] No personal data or secrets appear in fixtures or captures.
- [ ] The UI has been reviewed against the anti-generic checklist.
- [ ] Browser validation covers representative viewports.

## Validation evidence

- **Acceptance criterion -> test/manual check:**
- **Commands and results:**
- **Browser/device and states checked:**
- **Pending checks and known limitations:**
- **Synthetic artifacts stored locally (never personal captures):**

Mark “Validated” only when applicable checks have evidence; a filled template
alone is not acceptance.

## Resumen en español

Esta plantilla obliga a definir antes del código el objetivo, la decisión
principal, jerarquía, datos, estados, responsive, interacciones, accesibilidad y
criterios de aceptación. Puede copiarse en un issue o PR.
La validación necesita evidencias concretas, errores de persistencia y manejo
de respuestas obsoletas; completar la plantilla no demuestra que la UI funcione.

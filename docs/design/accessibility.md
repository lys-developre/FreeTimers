# Accessibility

**Status:** Decision  
**Last reviewed:** 2026-09-19

[Design index](./README.md) · [Responsive checks](./responsive-behavior.md)

## Target

FreeTimers targets WCAG 2.2 AA for product interfaces. Accessibility is a
design and engineering requirement, not a final audit phase.

## Semantic structure

- Use landmarks and a logical heading hierarchy.
- Use native controls before custom roles.
- Every field has a persistent visible label.
- Group related planning controls with `fieldset` and `legend` where
  appropriate.
- Status messages use suitable live regions without excessive announcements.

## Keyboard and focus

- Every action is reachable by keyboard.
- Focus order follows the visual and decision order.
- Focus indicators are clearly visible against all surfaces.
- Modal dialogs/sheets move and contain focus, make background content inert,
  and restore focus to the trigger (or a logical successor) on close.
- Nonmodal sheets allow keyboard access to map/list context; do not trap focus
  or mark the background inert. Provide a clear path into and out of the sheet.
- Sticky controls never obscure focused elements.
- Escape behavior is consistent and does not discard data without warning.

## Touch

- Interactive targets are at least 44 by 44 CSS pixels.
- This is the product's touch target, not a claim that WCAG 2.2 AA universally
  requires 44 px; its minimum-target criterion has different sizing/exceptions.
- Adjacent destructive and primary actions have sufficient separation.
- Dragging or map gestures always have an alternative.
- Multi-touch is never the only way to perform an essential action.

## Color and contrast

- Normal text meets 4.5:1 contrast.
- Large text and meaningful graphics meet 3:1.
- Focus and control boundaries remain perceivable.
- Safe, tight, unviable, and unknown use labels plus patterns, borders, or
  symbols.
- Contrast is tested over the actual map style, not a white background only.

## Map accessibility

The map cannot be the only representation of results.

Provide:

- A synchronized list of visible activities.
- Text summaries of each reachability category.
- Keyboard-selectable activities.
- A way to set location without dragging a marker.
- Accessible names for map controls.
- A textual route and return estimate.
- Status when map data is unavailable.

Decorative map tiles are hidden from the accessibility tree where possible.

## Time and risk communication

- Use absolute time and duration together when ambiguity is possible.
- Do not rely on icons or color alone.
- Announce a transition to unviable or unknown without repeatedly interrupting
  the user.
- Explain “safe” as an estimate preserving the selected margin.
- Dates use locale-aware formatting and remain unambiguous across days.

## Motion

- Respect `prefers-reduced-motion`.
- Avoid parallax and continuous decorative movement.
- Do not animate map recentering when reduced motion is requested.
- Avoid flashing content.

## Text and zoom

- Support text resize to 200%.
- Support reflow at 320 CSS px, including 400% desktop zoom on a 1280 px
  viewport, without loss of content/function or horizontal page scrolling.
- A map's inherently two-dimensional content may pan; this exception does not
  apply to forms, legends, details or the equivalent textual list.
- Avoid fixed-height text containers.
- Use plain language for critical actions.
- Do not encode instructions solely through spatial references such as “the
  green area on the right”.

## Forms and errors

- Validate after meaningful interaction, not on every keystroke.
- Associate errors with their fields.
- Summarize submission errors when multiple fields fail.
- Preserve entered values.
- Explain how to correct the error.
- Mark required fields in text and semantics.

## Media and memories

- User-generated and historical images support alternative text.
- Generated compositions preserve readable text contrast.
- Sharing remains optional.
- Historical source and license information is readable by assistive
  technology.

## Verification

The automated checks below are the target verification suite. Until each tool
is wired into project scripts and CI, report it as pending rather than implying
that it ran. Manual checks remain required even after automation is available.

Automated:

- Semantic and accessibility rules in linting where available.
- Axe checks for representative routes and states.
- Lighthouse accessibility audit.
- Contrast checks for tokens and map overlays.

Manual:

- Keyboard-only completion.
- Screen reader smoke test.
- 200% text resize and 400% browser zoom/reflow.
- Reduced motion.
- High contrast or forced colors.
- Outdoor readability on a mobile device.
- GPS denied, map unavailable, and offline states.

No automated score alone constitutes acceptance.

## Resumen en español

FreeTimers apunta a WCAG 2.2 AA. El mapa nunca será la única representación:
debe existir una lista sincronizada y resúmenes textuales. Todos los controles
serán operables con teclado y tacto, los estados de riesgo no dependerán solo
del color y se verificarán zoom, lector de pantalla, movimiento reducido,
contraste y fallos de GPS o red.
Se verifican ampliación de texto al 200% y reflujo a 320 píxeles CSS, incluido
zoom al 400%. Una hoja no modal no debe atrapar el foco como un diálogo modal.

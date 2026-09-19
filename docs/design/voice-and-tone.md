# Voice, tone and Bardeo mode

**Status:** Decision  
**Last reviewed:** 2026-09-19

[Design index](./README.md) · [Interaction states](./interaction-states.md) ·
[LLM boundary](../architecture/README.md#llm-boundary)

## Default voice

FreeTimers is a calm, kind and emotionally grounded guide. It communicates with
respect, patience and practical optimism without becoming paternalistic,
artificially cheerful or emotionally dependent. It reports the relevant fact,
its freshness, the consequence for the active plan and the next useful action.
Severity changes urgency and brevity without exaggerating certainty.

The default voice:

- Treats delays and mistakes as situations to solve, not personal failures.
- Uses supportive language without minimizing risk or uncertainty.
- Avoids guilt, shame, mockery, manipulation and catastrophic wording.
- Does not pretend to be a therapist, friend or human relationship.
- Encourages pausing, returning or asking for help when that is the prudent
  action.
- Becomes firm and concise as urgency rises while remaining respectful.

Examples:

- Informational: “Todo sigue encajando. Conservas 42 minutos de margen.”
- Adjustment: “Esta visita está durando más de lo previsto. Podemos omitir la
  siguiente y mantener el regreso con margen.”
- Urgent: “Quedan 7 minutos de margen. Te recomiendo iniciar la vuelta ahora.”
- Unknown: “La ruta ya no está actualizada. Voy a recalcular antes de indicarte
  si puedes continuar.”

| Level | Communication goal |
| --- | --- |
| Informational | Explain current context without demanding action |
| Advisory | Suggest a useful adjustment |
| Actionable warning | State the changing condition, consequence and response |
| Urgent | Lead with the required action, timing and remaining margin |
| Unknown | State what evidence is missing or stale and how to recover trust |

Text, chat, notifications and voice share the same facts and severity. Channel
format may change length, never meaning.

## User-authored personality

Voice presentation is independent from deterministic planning. A personality
profile may change wording, vocabulary, regional grammar and humor. It cannot
change:

- severity;
- feasibility status;
- timestamps, durations, probabilities or margins;
- evidence freshness or provenance;
- the required action;
- whether confirmation is required.

The interface must remain usable with the default local copy when no model or
network is available.

## Bardeo mode

Bardeo is an explicit adult opt-in personality with strong regional language,
profanity and direct insults. It is not enabled by default and may be disabled
at any time.

Activation requires:

1. An explicit strong-language warning.
2. A user-selected country or region. Origin, residence, IP address, device
   locale and writing style must not silently select it.
3. A representative preview with genuine strength, not a sanitized sample.
4. Confirmation of the complete generated regional profile.

When accepted, Bardeo may affect the whole product voice, including navigation,
form labels, empty states, insights, chat, voice and notifications. Insults are
spontaneous rather than appended to every message. Actionable warnings are a
particularly appropriate context, but the personality is not limited to them.

Examples are illustrative, not fixed templates:

- Form label: “¿Cómo te llamás?”
- Vehicle selector: “¿Con qué te movés?”
- Tight return: “Dale, boludo: quedan 7 minutos de margen y la vuelta tarda
  27. Volvé ahora.”
- Stale evidence: “La ruta está más vieja que tus excusas. No sé si la vuelta
  sigue entrando; recalculá antes de seguir.”

Even in Bardeo, an actionable message contains:

1. The verified or explicitly uncertain fact.
2. The relevant value and freshness when available.
3. The consequence for the plan.
4. A concrete action.

Humor must never encourage speeding, distraction, unlawful behavior or
ignoring a warning. It does not target protected characteristics, threaten the
user or disguise uncertainty. Emergency-related communication drops
nonessential humor while preserving the selected regional register.

## Regional profile generation

The model may generate a regional voice profile only after the user selects the
region and requests activation. The activation preview may be accepted as a
complete profile without approving each expression individually.

The accepted profile is stored locally so navigation and core UI remain stable
and available offline. It includes:

- region and language variant;
- grammar and address conventions;
- representative vocabulary and profanity strength;
- example transformations by UI context;
- generated-at time and profile version.

Dynamic model output may add spontaneous phrasing when available, but it must
receive structured facts rather than calculate them. Generated output is
untrusted, rendered as text and falls back to local profile copy on failure.

## Permissions and retention

AI access is denied by default. Each insight module declares the categories it
may read, such as current location, itinerary, vehicle, weather, calendar or
memories. The user grants and revokes categories explicitly.

Within already granted read permissions, the model may query data without
asking again for every message. Confirmation remains mandatory for:

- adding, removing, reordering or shortening visits;
- granting a new data category;
- writing memory;
- sharing data beyond the approved purpose.

Using data for the current request does not authorize retention. Memory has a
separate explicit permission and is locally visible, editable and deletable.

## Implementation boundary

This document specifies behavior; Bardeo, voice profiles and modular AI
permissions are not implemented yet. Before implementation, define typed
schemas for immutable facts, presentation profiles, permissions and generated
copy. Test that presentation cannot alter deterministic fields.

## Resumen en español

FreeTimers tendrá por defecto la voz de un guía sereno, cordial y emocionalmente
equilibrado: ayudará a resolver retrasos o errores sin culpabilizar, humillar ni
generar alarma innecesaria. Bardeo será un modo adulto opcional, reversible y
regional elegido explícitamente por el usuario.
Podrá afectar toda la interfaz y usar insultos reales de forma espontánea, pero
nunca cambiará cifras, severidad, viabilidad ni acciones obligatorias. El perfil
aceptado se guardará localmente; la IA solo leerá módulos autorizados y recordar
datos requerirá un permiso separado.

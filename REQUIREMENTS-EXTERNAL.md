# Requisitos externos de FreeTimers

**Estado:** Borrador de apoyo  
**Idioma:** Español  
**Última revisión:** 2026-09-19

Este inventario conserva el análisis detallado original en español. Las reglas
canónicas en inglés sobre arquitectura, seguridad, datos y operación se
encuentran en [`docs/README.md`](./docs/README.md). Antes de implementar un
proveedor, cualquier decisión nueva debe actualizar primero esos documentos
canónicos y después este inventario.

## 1. Alcance

FreeTimers es inicialmente una herramienta personal, local-first y no comercial. Este documento recoge todo lo que necesitamos fuera de la lógica propia de la aplicación para poder sustituir los datos simulados por datos reales.

El MVP no debe depender de una cuenta de usuario, un backend multiusuario ni servicios de pago. Las integraciones externas serán opcionales y tendrán un modo manual o simulado de respaldo.

## 2. Requisitos externos prioritarios

### 2.1 Calendario y disponibilidad personal

**Objetivo:** detectar ventanas de tiempo reales en las que se puede realizar una misión.

Opciones:

- Entrada manual de fecha y hora.
- Importación de archivos `.ics`.
- Google Calendar API, mediante OAuth, si se necesita sincronización.
- Microsoft Graph Calendar, como alternativa futura.

Requisitos:

- No almacenar el contenido completo de los eventos si solo necesitamos bloques ocupados.
- Convertir los eventos a intervalos ocupados y calcular las ventanas libres localmente.
- Solicitar permisos de solo lectura.
- Permitir desconectar el calendario y borrar los datos importados.
- Gestionar zonas horarias, cambios de horario y eventos que cruzan medianoche.
- Mantener siempre la entrada manual como alternativa.

Dependencias externas:

- Cuenta de Google o Microsoft solo si se activa la sincronización.
- Credenciales OAuth y configuración de redirect URI.
- Política de privacidad del proveedor.
- Revisión de cuotas y permisos de la API elegida.

### 2.2 Geocodificación y mapas

**Objetivo:** convertir lugares y direcciones en coordenadas y mostrar el contexto geográfico.

Fuente inicial propuesta:

- OpenStreetMap para datos cartográficos.
- Un servicio de geocodificación compatible con OpenStreetMap.
- Un proveedor de rutas con modalidad gratuita o de bajo coste.

Requisitos:

- Convertir origen y destino a latitud/longitud.
- Calcular distancia por carretera y tiempo estimado de viaje.
- Diferenciar distancia en línea recta de distancia real.
- Mostrar atribución obligatoria cuando la licencia lo exija.
- Respetar límites de uso, política de caché y política de identificación del cliente.
- No usar el endpoint público de geocodificación para cargas masivas sin autorización.
- Guardar proveedor, fecha de consulta y precisión de cada coordenada.

Datos mínimos necesarios:

- Coordenadas del punto de partida.
- Coordenadas del destino.
- Perfil de transporte: coche, moto, transporte público, bicicleta o a pie.
- Distancia y duración estimadas.

### 2.3 Meteorología y condiciones

**Objetivo:** saber si una misión tiene condiciones razonables en la ventana disponible.

Fuente inicial propuesta:

- Open-Meteo para previsión y datos históricos.
- Agencia meteorológica oficial como respaldo para alertas o validación.

Requisitos:

- Obtener previsión por coordenadas y franja horaria.
- Consultar temperatura, lluvia, viento, nubosidad y visibilidad cuando estén disponibles.
- Distinguir previsión futura, observación actual y dato histórico.
- Mostrar fecha de actualización y horizonte de previsión.
- Marcar los datos caducados.
- No afirmar que una actividad es segura si existe una alerta oficial activa.
- No sustituir recomendaciones profesionales de seguridad o protección civil.

Datos mínimos necesarios:

- Temperatura.
- Probabilidad y cantidad de precipitación.
- Viento y rachas.
- Nubosidad.
- Visibilidad.
- Alertas meteorológicas.

### 2.4 Eventos culturales, deportivos y de motor

**Objetivo:** detectar experiencias temporales, especialmente rallies, motor, festivales y actividades locales.

Fuentes prioritarias:

- Webs y calendarios oficiales de organizadores.
- Federaciones deportivas.
- Circuitos y ayuntamientos.
- Feeds RSS, ICS, JSON o APIs públicas autorizadas.

Requisitos:

- Fecha y hora de inicio y final.
- Ubicación verificable.
- Organizador.
- URL original.
- Precio o indicación de entrada gratuita.
- Estado del evento: anunciado, confirmado, aplazado o cancelado.
- Fecha de última comprobación.
- Condiciones de acceso.

Restricciones:

- No basar el producto en scraping no autorizado.
- No copiar contenido protegido más allá de lo permitido.
- Respetar marca, atribución y términos de cada fuente.
- Si no existe una API autorizada, permitir una carga editorial manual.
- Conservar siempre el enlace a la fuente original.

### 2.5 Naturaleza y fenómenos estacionales

**Objetivo:** proponer experiencias relacionadas con floración, migraciones, observación de fauna, cielos oscuros y temporadas locales.

Fuentes posibles:

- GBIF para observaciones de biodiversidad.
- iNaturalist, sujeto a sus licencias y condiciones de uso.
- Parques naturales y organismos ambientales.
- Observatorios astronómicos y calendarios de eventos celestes.
- Fuentes oficiales sobre floración, cosechas y temporadas.

Requisitos:

- Especie o fenómeno.
- Ubicación aproximada.
- Fecha de observación o periodo esperado.
- Nivel de confianza.
- Fuente y licencia.
- Advertencia de que una observación no garantiza presencia futura.
- Protección de ubicaciones sensibles de especies vulnerables.

Regla de producto:

> Los fenómenos naturales se mostrarán como oportunidades probables, nunca como promesas exactas.

### 2.6 Historia, patrimonio e imágenes

**Objetivo:** enriquecer una misión completada con contexto histórico o crear recuerdos “antes y ahora”.

Fuentes posibles:

- Wikimedia Commons.
- Europeana.
- Wikidata.
- Archivos públicos.
- Museos, bibliotecas y organismos patrimoniales.

Requisitos:

- Autor o institución.
- Fecha.
- Título y descripción.
- Ubicación.
- Licencia.
- Atribución requerida.
- Fuente primaria o enlace verificable.
- Distinción entre hecho documentado, inferencia y recreación.

No se utilizará una imagen si no conocemos sus condiciones de reutilización.

## 3. Requisitos de credenciales y configuración

### 3.1 MVP sin cuentas externas

El primer flujo debe funcionar sin configurar ninguna credencial:

- Misiones simuladas.
- Ventanas introducidas manualmente.
- Presupuesto y preferencias locales.
- Datos de ejemplo.

### 3.2 Credenciales opcionales posteriores

Si se activan integraciones reales, las credenciales deberán:

- Guardarse fuera del repositorio.
- Cargarse mediante variables de entorno o configuración local ignorada por Git.
- No aparecer en logs, capturas ni exportaciones.
- Poder revocarse.
- Tener el mínimo alcance necesario.

Variables esperadas, sujetas al proveedor elegido:

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
MICROSOFT_CLIENT_ID
MAPS_PROVIDER_API_KEY
WEATHER_PROVIDER_API_KEY
```

No se deben añadir estas variables hasta elegir un proveedor concreto y revisar sus condiciones actuales.

## 4. Requisitos de licencias y atribución

Cada conector debe registrar:

- Nombre del proveedor.
- URL de la fuente.
- Tipo de licencia.
- Texto de atribución.
- Fecha de consulta.
- Fecha de caducidad.
- Restricciones de almacenamiento.
- Restricciones de redistribución.

La aplicación debe poder mostrar una sección de fuentes y atribuciones. El hecho de que los datos sean públicos no significa que puedan copiarse o redistribuirse sin condiciones.

## 5. Requisitos de privacidad

Como el producto es de uso propio:

- Los datos deben permanecer localmente siempre que sea posible.
- El calendario será opcional y con permisos de solo lectura.
- No se enviará el historial completo de viajes a un proveedor externo.
- La ubicación precisa solo se enviará cuando sea necesaria para una consulta concreta.
- Se debe poder borrar la información local.
- Se debe poder exportar e importar una copia propia.
- No habrá analítica de comportamiento en el MVP.
- No habrá perfiles públicos, seguidores, comentarios ni base social.

## 6. Requisitos técnicos de integración

Cada fuente externa tendrá un adaptador independiente con:

- Cliente HTTP aislado.
- Tipos de entrada y salida.
- Validación de respuestas.
- Control de timeout.
- Reintentos limitados.
- Caché con fecha de caducidad.
- Registro de errores.
- Identificación del proveedor.
- Pruebas con fixtures locales.

Si una fuente falla:

1. No se inventará el dato.
2. Se marcará como no disponible o desactualizado.
3. Se conservarán las recomendaciones que sí puedan verificarse.
4. Se mostrará al usuario qué información falta cuando afecte a la decisión.

## 7. Requisitos de coste y operación

Para el MVP personal:

- Priorizar planes gratuitos o abiertos.
- No contratar servicios premium antes de demostrar que son necesarios.
- Controlar el número de llamadas por proveedor.
- Cachear respuestas que no cambien con frecuencia.
- Sincronizar eventos, clima y temporadas mediante trabajos bajo demanda o programados localmente.
- Mantener un presupuesto mensual máximo definido antes de activar APIs comerciales.

## 8. Orden de incorporación

### Fase 0: sin integraciones

- Datos simulados.
- Entrada manual.
- Pruebas de dominio.
- Exportación de configuración local.

### Fase 1: utilidad personal básica

- Importación `.ics`.
- Geocodificación puntual.
- Rutas para coche y moto.
- Meteorología.

### Fase 2: descubrimiento

- Eventos oficiales.
- Rallies y deportes de motor.
- Naturaleza y fenómenos estacionales.

### Fase 3: memoria

- Fuentes históricas.
- Imágenes con licencia.
- Generación de recuerdos y exportación manual.

## 9. Criterios de aceptación

No se considerará lista una integración hasta que:

- Funcione con una fixture local sin red.
- Valide respuestas incompletas y erróneas.
- Tenga timeout y comportamiento de fallback.
- Muestre la fuente y la fecha de actualización.
- Respete la licencia y atribución.
- No exponga credenciales.
- Tenga pruebas automatizadas del caso normal y de los fallos principales.
- Pueda desactivarse sin romper el flujo con datos manuales.

## 10. Estado actual

Actualmente FreeTimers no tiene conectores externos implementados. La aplicación utiliza únicamente:

- Tres misiones simuladas.
- Una ventana de tiempo fija para el prototipo.
- Presupuesto y preferencias definidos localmente.
- Un motor de puntuación local.

El siguiente paso técnico recomendado es implementar el contrato interno de datos y un primer conector aislado con fixtures, sin depender todavía de credenciales reales.

# Plataforma de Gestión de Pólizas de Arrendamiento

**Creador:** Diego Alejandro Sepulveda Huetio
**Tecnologías principales:** React, TypeScript, Express, Spring Boot 3 y Java 17.

Aplicación para administrar el ciclo de vida de pólizas de arrendamiento, los riesgos asociados, renovaciones ajustadas por IPC, cancelaciones, recordatorios y métricas de cartera. La interfaz consume la API REST incluida en el proyecto y permite ejecutar las operaciones desde el navegador.

## Alcance funcional

- Crear, consultar y filtrar pólizas de tipo `INDIVIDUAL` o `COLECTIVA`.
- Calcular la prima total como `canonMensual × vigenciaMeses`.
- Registrar riesgos de inmuebles y sus arrendatarios.
- Renovar pólizas aplicando un porcentaje IPC al canon y a la prima.
- Cancelar pólizas y propagar la cancelación a sus riesgos.
- Actualizar el canon acumulado de las pólizas colectivas cuando se agregan o cancelan riesgos.
- Registrar eventos de sincronización con el CORE mediante un endpoint de integración simulado.
- Gestionar recordatorios y consultar indicadores mensuales de cartera.

## Componentes de ejecución

El repositorio contiene dos implementaciones que se deben distinguir al consumir la API:

| Componente | Finalidad | URL y prefijo |
| --- | --- | --- |
| Aplicación web y API operativa | Sirve la interfaz React y la API utilizada por ella. Conserva datos en memoria durante la ejecución. | `http://localhost:3000/api` |
| API Spring Boot | Implementación Java por capas con persistencia H2 en memoria e integración CORE simulada. | `http://localhost:8080` sin prefijo `/api` |

La aplicación web es el flujo operativo principal. El módulo Java mantiene el mismo dominio de pólizas y riesgos, pero no incluye los endpoints de recordatorios, métricas ni consulta de logs que ofrece la API operativa.

## Puesta en marcha para operar los endpoints

### Aplicación web y API operativa

Requiere Node.js 20 o superior y npm.

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. La misma dirección hospeda la API; por ejemplo, `http://localhost:3000/api/health` comprueba su disponibilidad.

Para crear el paquete de producción:

```bash
npm run build
npm start
```

### API Spring Boot

Requiere Java 17 o superior y Maven 3.8 o superior.

```bash
cd spring-boot-backend
mvn spring-boot:run
```

La API queda disponible en `http://localhost:8080`. La consola H2 se encuentra en `http://localhost:8080/h2-console`; usa la URL JDBC `jdbc:h2:mem:polizasdb`, usuario `sa` y contraseña vacía.

> Los datos de ambas implementaciones son volátiles: se reinician al detener el proceso. Para operar una instancia persistente se debe sustituir el almacenamiento en memoria/H2 por una base de datos administrada.

## Autenticación y formato de respuesta

Excepto `GET /api/health`, los endpoints de la API operativa requieren el encabezado:

```http
x-api-key: 123456
```

La API Spring Boot exige la misma cabecera en todas las rutas funcionales. El valor está definido como configuración local de demostración; debe reemplazarse y gestionarse como secreto fuera del código en un entorno real.

Las respuestas siguen esta estructura:

```json
{
  "exito": true,
  "mensaje": "Descripción del resultado",
  "datos": {}
}
```

Un encabezado inválido devuelve `401`; los datos inválidos devuelven `400`; un recurso inexistente devuelve `404`; y las reglas de negocio incumplidas devuelven `422`.

## API operativa

Base URL de los ejemplos: `http://localhost:3000/api`.

| Método | Ruta | Función |
| --- | --- | --- |
| `GET` | `/health` | Comprueba la disponibilidad del servicio. |
| `GET` | `/polizas?tipo=&estado=` | Lista pólizas y filtra por `INDIVIDUAL`/`COLECTIVA` y `ACTIVA`/`RENOVADA`/`CANCELADA`. |
| `GET` | `/polizas/{id}` | Consulta una póliza con sus riesgos. |
| `POST` | `/polizas` | Crea una póliza y, opcionalmente, su riesgo inicial. |
| `GET` | `/polizas/{id}/riesgos` | Lista los riesgos de una póliza. |
| `POST` | `/polizas/{id}/renovar` | Renueva una póliza y aplica IPC. |
| `POST` | `/polizas/{id}/cancelar` | Cancela una póliza y sus riesgos asociados. |
| `POST` | `/polizas/{id}/riesgos` | Agrega un riesgo a una póliza. |
| `POST` | `/riesgos/{id}/cancelar` | Cancela un riesgo individual. |
| `POST` | `/core-mock/evento` | Registra un evento manual de integración CORE. |
| `GET` | `/core-mock/logs` | Consulta los eventos CORE registrados durante la ejecución. |
| `GET` | `/reminders` | Lista los recordatorios. |
| `POST` | `/reminders` | Programa un recordatorio. |
| `PATCH` | `/reminders/{id}/toggle` | Alterna un recordatorio entre pendiente y completado. |
| `DELETE` | `/reminders/{id}` | Elimina un recordatorio. |
| `GET` | `/monthly-metrics` | Devuelve métricas y el histórico mensual para el tablero. |

### Ejecución rápida

Defina la URL y la cabecera una vez en la terminal:

```bash
BASE_URL=http://localhost:3000/api
API_KEY=123456
```

Consultar pólizas activas colectivas:

```bash
curl "$BASE_URL/polizas?tipo=COLECTIVA&estado=ACTIVA" \
  -H "x-api-key: $API_KEY"
```

Crear una póliza:

```bash
curl -X POST "$BASE_URL/polizas" \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "numeroPoliza": "POL-IND-2026-100",
    "tipo": "INDIVIDUAL",
    "tomador": "María Pérez",
    "tomadorDoc": "CC 123456789",
    "asegurado": "María Pérez",
    "beneficiario": "Arrendador ejemplo",
    "vigenciaMeses": 12,
    "fechaInicio": "2026-09-19",
    "canonMensual": 1800000,
    "direccionRiesgoInicial": "Calle 1 # 2-3",
    "ciudadRiesgoInicial": "Bogotá D.C."
  }'
```

Renovar con IPC:

```bash
curl -X POST "$BASE_URL/polizas/1/renovar" \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"porcentajeIpc": 9.28}'
```

Agregar un riesgo:

```bash
curl -X POST "$BASE_URL/polizas/2/riesgos" \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "direccion": "Carrera 7 # 116-50 Apto 802",
    "ciudad": "Bogotá D.C.",
    "valorCanon": 3200000,
    "descripcionInmueble": "Apartamento residencial",
    "arrendatarioNombre": "Camila Montoya",
    "arrendatarioDoc": "1020304050"
  }'
```

Cancelar una póliza:

```bash
curl -X POST "$BASE_URL/polizas/1/cancelar" \
  -H "x-api-key: $API_KEY"
```

Programar un recordatorio:

```bash
curl -X POST "$BASE_URL/reminders" \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "polizaId": 2,
    "titulo": "Revisar renovación",
    "fechaLimite": "2026-10-01",
    "prioridad": "ALTA",
    "tipo": "RENOVACION",
    "canal": "EMAIL"
  }'
```

## Reglas de negocio

- Una póliza inicia en estado `ACTIVA` y su fecha final se calcula sumando los meses de vigencia a `fechaInicio`.
- La prima total se recalcula cada vez que cambia el canon o la vigencia.
- Una póliza `INDIVIDUAL` admite como máximo un riesgo activo. Una `COLECTIVA` admite múltiples riesgos.
- No se pueden agregar riesgos ni renovar una póliza `CANCELADA`.
- La renovación actualiza el estado a `RENOVADA`, ajusta canon y prima por IPC y extiende la vigencia por el mismo número de meses.
- Cancelar una póliza cancela en cascada todos sus riesgos. Cancelar un riesgo de una póliza colectiva descuenta su canon del valor acumulado de la póliza.
- Las creaciones, renovaciones, cancelaciones y cambios de riesgos generan un registro de evento CORE.

## Contrato de la API Spring Boot

El módulo Java expone los siguientes recursos sin el prefijo `/api`: `GET/POST /polizas`, `GET /polizas/{id}`, `GET/POST /polizas/{id}/riesgos`, `POST /polizas/{id}/renovar`, `POST /polizas/{id}/cancelar`, `POST /riesgos/{id}/cancelar` y `POST /core-mock/evento`.

Mantiene el mismo modelo de autenticación y reglas de pólizas/riesgos. Para consumirlo, reemplace la base de URL de los ejemplos por `http://localhost:8080` y elimine `/api` de la ruta. Su integración CORE se configura mediante `app.core.mock-url` y la clave mediante `app.security.api-key` en `spring-boot-backend/src/main/resources/application.properties`.

## Modelo de datos

| Entidad | Datos principales |
| --- | --- |
| Póliza | Número, tipo, estado, tomador, asegurado, beneficiario, vigencia, fechas, canon, prima e IPC de última renovación. |
| Riesgo | Póliza asociada, dirección, ciudad, canon, descripción del inmueble, arrendatario, estado y fecha de creación. |
| Recordatorio | Póliza opcional, título, fecha límite, prioridad, tipo, canal y estado de cumplimiento. |
| Evento CORE | Fecha, póliza, tipo de evento, detalle, código de estado y carga enviada. |

Valores permitidos: `INDIVIDUAL` y `COLECTIVA` para tipo de póliza; `ACTIVA`, `RENOVADA` y `CANCELADA` para estado de póliza; `ACTIVO` y `CANCELADO` para riesgo; y `ALTA`, `MEDIA` o `BAJA` para la prioridad de un recordatorio.

## Diseño, funcionamiento y escalabilidad

La interfaz React delega las operaciones en una capa HTTP única (`src/lib/api.ts`). La API operativa implementa el flujo completo y centraliza la autenticación con middleware. El módulo Spring Boot separa controladores, servicios, repositorios, entidades, DTO y manejo global de excepciones; esta separación evita que reglas como el cálculo de prima o la cancelación en cascada queden acopladas a la capa HTTP.

El estado de la API operativa reside en memoria, por lo que está pensado para demostración, pruebas funcionales y operación de una sola instancia. Para aumentar capacidad sin perder consistencia se requiere, como mínimo:

- Persistir pólizas, riesgos, recordatorios y eventos en una base de datos transaccional con índices por `estado`, `tipo`, `poliza_id` y fechas de vigencia.
- Externalizar la clave de API, la configuración de integración y los secretos; no deben permanecer con valores fijos en el código.
- Procesar las notificaciones CORE de forma asíncrona con una cola, reintentos y trazabilidad para que una indisponibilidad externa no bloquee una operación de negocio.
- Usar almacenamiento compartido para archivos o evidencias, caché para consultas de alta frecuencia, paginación en listados y métricas/observabilidad para detectar saturación.
- Diseñar instancias sin estado antes de escalar horizontalmente; los datos y los eventos no deben depender de la memoria de un proceso.

Si se requiere una instalación que conecte el backend con almacenamiento tipo bucket, el equipo necesita conocimientos de gestión de buckets y de GCP para que dicha integración pueda operar de forma segura. Este repositorio no incluye configuración de bucket ni una guía de aprovisionamiento o réplica; el foco de esta documentación es el funcionamiento del software y el consumo de sus endpoints.

## Estructura relevante

```text
src/                         Interfaz React y cliente HTTP
server.ts                    API operativa Express y datos de demostración
spring-boot-backend/         API Java: controladores, servicios y persistencia H2
Conexion_API/conexion.py     Cliente de terminal para consumo de API
docs/                        Material técnico y evidencias del proyecto
```

## Verificación

```bash
npm run lint
npm run build
```

Para la API Java:

```bash
cd spring-boot-backend
mvn test
```

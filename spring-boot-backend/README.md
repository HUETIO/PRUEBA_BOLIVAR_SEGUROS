# Plataforma de Gestión de Pólizas de Arrendamiento (Seguros)

Solución técnica completa en **Spring Boot 3 + Java 17** y **React** para la evaluación de 4 módulos de competencias de arquitectura, desarrollo backend, base de datos y control de versiones.

---

## Estructura del Proyecto (Clean Architecture por Capas)

```
spring-boot-backend/
├── pom.xml
├── README.md
└── src/
    └── main/
        ├── java/com/seguros/polizas/
        │   ├── PolizasApplication.java             # Entrypoint Spring Boot y RestTemplate Bean
        │   ├── controller/
        │   │   ├── PolizaController.java           # Endpoints de Pólizas (/polizas)
        │   │   ├── RiesgoController.java           # Endpoints de Riesgos (/riesgos)
        │   │   └── CoreMockController.java         # Mock Externo WebLogic (/core-mock/evento)
        │   ├── service/
        │   │   ├── PolizaService.java              # Interfaz de lógica de negocio pólizas
        │   │   ├── RiesgoService.java              # Interfaz de lógica de negocio riesgos
        │   │   ├── CoreIntegrationService.java     # Integración HTTP con capa media WebLogic
        │   │   └── impl/
        │   │       ├── PolizaServiceImpl.java      # Implementación con reglas de negocio
        │   │       └── RiesgoServiceImpl.java      # Implementación de riesgos
        │   ├── repository/
        │   │   ├── PolizaRepository.java           # JPA Repository con filtros tipo/estado
        │   │   └── RiesgoRepository.java           # JPA Repository de riesgos
        │   ├── model/
        │   │   ├── entity/
        │   │   │   ├── Poliza.java                 # Entidad Póliza (Canon, Prima, Vigencia)
        │   │   │   └── Riesgo.java                 # Entidad Riesgo (Inmueble, Arrendatario)
        │   │   └── enums/
        │   │       ├── TipoPoliza.java             # INDIVIDUAL, COLECTIVA
        │   │       ├── EstadoPoliza.java           # ACTIVA, RENOVADA, CANCELADA
        │   │       └── EstadoRiesgo.java           # ACTIVO, CANCELADO
        │   ├── dto/
        │   │   ├── CreatePolizaDTO.java            # Payload para crear póliza
        │   │   ├── CreateRiesgoDTO.java            # Payload para agregar riesgo
        │   │   ├── RenovarPolizaDTO.java           # Payload con porcentaje IPC
        │   │   ├── CoreMockEventoDTO.java          # Payload para sincronización con CORE
        │   │   └── ApiResponse.java                # Envoltorio estándar JSON
        │   ├── security/
        │   │   └── ApiKeyAuthFilter.java           # Filtro HTTP: x-api-key: 123456 obligatorio
        │   └── exception/
        │       ├── BusinessException.java          # Excepciones de reglas de negocio
        │       ├── ResourceNotFoundException.java  # Excepción 404
        │       └── GlobalExceptionHandler.java     # Manejador centralizado (@RestControllerAdvice)
        └── resources/
            └── application.properties              # Configuración H2 y credenciales
```

---

## Requisitos y Ejecución

- **Java 17+**
- **Maven 3.8+**

```bash
# Compilar proyecto
mvn clean package

# Ejecutar aplicación
mvn spring-boot:run
```

El servidor iniciará en el puerto **8080**.
Consola H2 en memoria disponible en: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:polizasdb`, usuario: `sa`, sin contraseña).

---

## MÓDULO 2: Endpoints y Ejemplos de Consumo (cURL)

> **Nota de Seguridad**: Todos los endpoints exigen el header obligatorio `x-api-key: 123456`. De lo contrario, retornan `401 Unauthorized`.

### 1. Listar pólizas por tipo y estado
```bash
curl -X GET "http://localhost:8080/polizas?tipo=COLECTIVA&estado=ACTIVA" \
  -H "x-api-key: 123456"
```

### 2. Consultar riesgos de una póliza
```bash
curl -X GET "http://localhost:8080/polizas/1/riesgos" \
  -H "x-api-key: 123456"
```

### 3. Renovar póliza ajustando canon y prima según IPC
```bash
curl -X POST "http://localhost:8080/polizas/1/renovar" \
  -H "x-api-key: 123456" \
  -H "Content-Type: application/json" \
  -d '{"porcentajeIpc": 9.28}'
```
*Efecto:* Incrementa canon y prima en +IPC, cambia estado a `RENOVADA` y envía evento de actualización al servicio CORE en WebLogic.

### 4. Cancelar póliza
```bash
curl -X POST "http://localhost:8080/polizas/1/cancelar" \
  -H "x-api-key: 123456"
```
*Efecto:* Cambia estado de la póliza a `CANCELADA`, cancela automáticamente todos sus riesgos asociados y notifica al CORE.

### 5. Agregar riesgo a póliza colectiva
```bash
curl -X POST "http://localhost:8080/polizas/2/riesgos" \
  -H "x-api-key: 123456" \
  -H "Content-Type: application/json" \
  -d '{
    "direccion": "Carrera 7 # 116-50 Apto 802",
    "ciudad": "Bogotá D.C.",
    "valorCanon": 3200000.00,
    "descripcionInmueble": "Apartamento estrato 5 con balcón",
    "arrendatarioNombre": "Camila Montoya",
    "arrendatarioDoc": "1020304050"
  }'
```
*Validación:* Si la póliza es `INDIVIDUAL` y ya cuenta con 1 riesgo, el sistema rechaza la solicitud con `422 Unprocessable Entity` ("Regla de Negocio: Una póliza individual solo puede tener 1 riesgo").

### 6. Cancelar riesgo individual
```bash
curl -X POST "http://localhost:8080/riesgos/3/cancelar" \
  -H "x-api-key: 123456"
```

### 7. Mock Externo WebLogic CORE
```bash
curl -X POST "http://localhost:8080/core-mock/evento" \
  -H "x-api-key: 123456" \
  -H "Content-Type: application/json" \
  -d '{
    "evento": "ACTUALIZACION",
    "polizaId": 555
  }'
```

---

## MÓDULO 1: Diseño de Sistema (System Design)

### 1. Arquitectura de Alto Nivel
- **API Gateway (Spring Cloud Gateway / Kong)**: Terminación SSL, validación de API Key / JWT, rate limiting y enrutamiento hacia microservicios.
- **Servicio de Pólizas (Spring Boot)**: Administra el ciclo de vida de la póliza (creación, cotización, cálculo de primas `canon * meses`, renovaciones periódicas ajustadas por IPC y cancelaciones).
- **Servicio de Riesgos (Spring Boot)**: Gestiona la cardinalidad de los inmuebles asegurados (1 para individual, 1..N para colectivas) e integra validaciones contractuales.
- **Event Bus (Apache Kafka / RabbitMQ)**: Desacopla las operaciones críticas. Cada cambio de estado emite un evento `PolizaModificadaEvent` / `RiesgoCanceladoEvent`.
- **Adapter de Integración con CORE (WebLogic Connector)**: Consume eventos del broker e interactúa con el servicio agnóstico SOAP/REST expuesto en Oracle WebLogic para mantener sincronizado el sistema transaccional legado sin bloquear al usuario final (Patrón Outbox + Circuit Breaker).
- **Servicio de Notificaciones (Email/SMS Worker)**: Consume eventos de renovación/creación y despacha correos (SendGrid) y SMS (Twilio/Infobip) a arrendatarios e inmobiliarias.
- **Base de Datos**: PostgreSQL con réplicas de lectura y particionamiento por estado/fecha de vigencia.

### 2. Tres Patrones de Arquitectura Seleccionados
1. **Event-Driven Architecture (EDA)**: Permite que la sincronización con el CORE legado (potencialmente lento o con caídas) y el envío de notificaciones por email/SMS no degraden la latencia del front-end. Se garantiza eventual consistency y resiliencia.
2. **Arquitectura Hexagonal (Ports & Adapters)**: El núcleo de dominio (cálculo de prima, reglas de individual/colectiva, validación IPC) queda completamente aislado de frameworks web, bases de datos o servicios externos legados (WebLogic). Facilita testing unitario al 100%.
3. **CQRS (Command Query Responsibility Segregation) + API Gateway**: Separa las operaciones de modificación de estado (renovaciones, cancelaciones, adición de riesgos) de las consultas frecuentes y tableros analíticos de progreso mensual, permitiendo optimizar el rendimiento y la escalabilidad.

### 3. Modelo de Datos Principal
- **Poliza**: `id`, `numero_poliza`, `tipo` (INDIVIDUAL, COLECTIVA), `estado` (ACTIVA, RENOVADA, CANCELADA), `tomador`, `tomador_doc`, `asegurado`, `beneficiario`, `vigencia_meses`, `fecha_inicio`, `fecha_fin`, `canon_mensual`, `prima_total`, `ipc_incremento`.
- **Riesgo**: `id`, `poliza_id` (FK), `direccion`, `ciudad`, `valor_canon`, `descripcion_inmueble`, `arrendatario_nombre`, `arrendatario_doc`, `estado` (ACTIVO, CANCELADO), `fecha_creacion`.
- **TransaccionCoreLog**: `id`, `poliza_id`, `evento`, `timestamp`, `estado_envio`, `reintentos`.
- **Recordatorio**: `id`, `poliza_id`, `tipo`, `fecha_programada`, `estado`, `canal`.

### 4. Aspectos No Funcionales
- **Escalabilidad**: Despliegue en Kubernetes (EKS/GKE) con Horizontal Pod Autoscaler (HPA) basado en CPU y latencia HTTP. Caché distribuido con Redis para consultas de pólizas frecuentes.
- **Logs y Observabilidad**: Trazabilidad distribuida con OpenTelemetry (Correlation ID / TraceId en headers HTTP), métricas con Micrometer + Prometheus, dashboards en Grafana y agregación centralizada con ElasticSearch/Fluentd/Kibana (EFK) o Grafana Loki.
- **Tolerancia a Fallos**: Implementación de Resilience4j (Circuit Breaker, Retry con Exponential Backoff y RateLimiter) en la comunicación hacia la capa media WebLogic. Patrón Transactional Outbox para asegurar que ninguna modificación se pierda si el CORE está caído.
- **Versionamiento de APIs**: Versionado por URI (`/api/v1/polizas`, `/api/v2/polizas`) y Content Negotiation en headers. Garantía de retrocompatibilidad y desaprobación progresiva (Deprecation headers).

---

## MÓDULO 3: Optimización de Base de Datos

**Consulta Lenta:**
```sql
SELECT
  o.order_id, 
  o.order_date, 
  c.customer_name, 
  o.total_amount
FROM orders o 
JOIN customers c ON o.customer_id = c.customer_id 
WHERE c.country = 'México';
```
*(10 millones de órdenes, 500.000 clientes).*

### 3 Estrategias de Optimización

1. **Estrategia 1: Creación de Índices Compuestos y Cubrientes (Covering Indexes / Index-Only Scan)**
   - En la tabla `customers`: Índice filtrante B-Tree en `country` que incluya `customer_id` y `customer_name`:
     ```sql
     CREATE INDEX idx_customers_mexico ON customers (country, customer_id) INCLUDE (customer_name);
     ```
   - En la tabla `orders`: Índice en la clave foránea `customer_id` que cubra las columnas proyectadas:
     ```sql
     CREATE INDEX idx_orders_customer_covering ON orders (customer_id) INCLUDE (order_id, order_date, total_amount);
     ```
   - *Impacto:* Evita el escaneo secuencial (Seq Scan) de 10M de filas. El motor de base de datos realiza un Index Scan en `customers` filtrando únicamente los clientes de México y un rápido Hash Join o Merge Join directo contra el índice de órdenes sin tocar las páginas de disco de la tabla (Index-Only Scan).

2. **Estrategia 2: Particionamiento de Tablas y Vistas Materializadas**
   - **Particionamiento declarativo por lista**: Particionar `customers` por `country` o `orders` por rango temporal (`order_date`), permitiendo *Partition Pruning*.
   - **Vista Materializada para reportes frecuentes**:
     ```sql
     CREATE MATERIALIZED VIEW mv_mexico_orders AS
     SELECT o.order_id, o.order_date, c.customer_name, o.total_amount
     FROM orders o
     JOIN customers c ON o.customer_id = c.customer_id
     WHERE c.country = 'México';
     CREATE UNIQUE INDEX idx_mv_mexico_orders ON mv_mexico_orders (order_id);
     ```
   - *Impacto:* Las consultas recurrentes leen un subconjunto pre-agregado en milisegundos con refresco periódico `REFRESH MATERIALIZED VIEW CONCURRENTLY`.

3. **Estrategia 3: Reestructuración de la Consulta con Filtrado Temprano y EXPLAIN ANALYZE**
   - Reducir el conjunto de trabajo antes de ejecutar el JOIN mediante un Subquery / CTE o `IN`:
     ```sql
     WITH mexico_customers AS (
       SELECT customer_id, customer_name
       FROM customers
       WHERE country = 'México'
     )
     SELECT o.order_id, o.order_date, mc.customer_name, o.total_amount
     FROM mexico_customers mc
     JOIN orders o ON mc.customer_id = o.customer_id;
     ```
   - *Impacto:* Garantiza que el optimizador cargue en memoria únicamente los registros filtrados de México antes de sondear la tabla de órdenes.

---

## MÓDULO 4: Gestión de Versiones (Git)

**Escenario:**
Estás en la rama `feature/new-login`. Tu compañero fusionó en `main` un commit que corrige un bug crítico de seguridad (`hotfix`). Necesitas incorporar **únicamente** ese commit a tu rama sin traer los demás cambios no deseados de `main`.

### Comando y Estrategia: `git cherry-pick`

```bash
# 1. Asegurarse de tener los cambios locales guardados o en stash
git status

# 2. Actualizar las referencias del repositorio remoto
git fetch origin main

# 3. Identificar el hash del commit de seguridad en main
git log origin/main --oneline -n 5
# Ejemplo: a1b2c3d "fix(security): sanitize auth input token to prevent injection"

# 4. En tu rama actual (feature/new-login), aplicar exclusivamente ese commit
git cherry-pick a1b2c3d

# 5. En caso de conflicto: resolver en archivos, marcar y continuar:
# git status
# git add <archivos-resueltos>
# git cherry-pick --continue

# 6. Verificar que el commit quedó incorporado limpiamente
git log -1 --stat
```

### Justificación Técnica:
- `git cherry-pick` permite extraer un commit individual por su SHA-1 y aplicarlo selectivamente sobre la rama actual mediante un algoritmo de 3-way merge.
- **Por qué NO `git merge main`:** Un merge traería todos los commits acumulados en `main` (incluyendo features incompletas de otros desarrolladores o cambios que desestabilicen la rama de feature).
- **Por qué NO `git rebase main`:** Un rebase reescribiría el historial de `feature/new-login` colocándolo encima de la punta de `main`, trayendo la totalidad de los cambios de `main`, lo cual viola el requisito explícito de aislar el parche de seguridad.

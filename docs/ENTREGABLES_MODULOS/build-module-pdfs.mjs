import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const css = (accent) => `
@page { size: A4; margin: 17mm 15mm; }
* { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: "Segoe UI", "Arial", sans-serif; color: #1f2937; font-size: 10.5pt; line-height: 1.5; margin: 0; }
.doc-header { border-bottom: 3px solid ${accent}; padding-bottom: 10px; margin-bottom: 18px; }
.doc-header .kicker { font-size: 9pt; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: ${accent}; }
.doc-header h1 { margin: 4px 0 2px; font-size: 19pt; color: #0f172a; }
.doc-header p { margin: 2px 0 0; color: #475569; font-size: 9.5pt; }
h2 { font-size: 13.5pt; color: ${accent}; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin: 24px 0 10px; page-break-after: avoid; }
h3 { font-size: 11.5pt; color: #0f172a; margin: 16px 0 6px; page-break-after: avoid; }
p { margin: 7px 0; }
ul, ol { margin: 6px 0; padding-left: 22px; }
li { margin: 3px 0; }
code { font-family: "Cascadia Mono", Consolas, monospace; background: #f1f5f9; padding: 1px 4px; border-radius: 3px; font-size: 9pt; }
pre.code { background: #0f172a; color: #e2e8f0; padding: 11px 13px; border-radius: 6px; font-size: 8.3pt; line-height: 1.42; overflow-x: auto; white-space: pre-wrap; page-break-inside: avoid; }
pre.code code { background: none; padding: 0; color: inherit; font-size: 8.3pt; }
table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 9pt; page-break-inside: auto; }
th { background: ${accent}; color: #fff; text-align: left; padding: 6px 8px; }
td { border: 1px solid #cbd5e1; padding: 5px 8px; vertical-align: top; }
tr:nth-child(even) td { background: #f8fafc; }
tr { page-break-inside: avoid; }
.callout { border: 1px solid #94a3b8; border-left: 5px solid ${accent}; background: #f8fafc; padding: 10px 14px; margin: 12px 0; border-radius: 6px; page-break-inside: avoid; }
.callout .title { font-weight: 700; color: #0f172a; margin-bottom: 4px; }
.figure { margin: 0 0 20px; page-break-inside: avoid; }
.figure img { width: 100%; border: 1px solid #e2e8f0; border-radius: 6px; box-shadow: 0 1px 4px rgba(15,23,42,.12); }
.figure .cap { margin-top: 5px; font-size: 8.6pt; color: #475569; }
.pagesep { border: none; border-top: 1px solid #cbd5e1; margin: 20px 0; }
`;

const layout = (title, kicker, sub, accent, body) =>
  `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><style>${css(accent)}</style></head><body>` +
  `<div class="doc-header"><div class="kicker">${kicker}</div><h1>${title}</h1><p>${sub}</p></div>${body}</body></html>`;

const h = (lvl, s) => `<h${lvl}>${s}</h${lvl}>`;
const p = (s) => `<p>${s}</p>`;
const ul = (items) => '<ul>' + items.map((i) => `<li>${i}</li>`).join('') + '</ul>';
const ol = (items) => '<ol>' + items.map((i) => `<li>${i}</li>`).join('') + '</ol>';
const code = (txt, lang) => `<pre class="code${lang ? ' lang-' + lang : ''}"><code>${esc(txt)}</code></pre>`;
const table = (headers, rows) =>
  '<table><thead><tr>' + headers.map((x) => `<th>${x}</th>`).join('') + '</tr></thead><tbody>' +
  rows.map((r) => '<tr>' + r.map((c) => `<td>${c}</td>`).join('') + '</tr>').join('') + '</tbody></table>';
const callout = (title, html) => `<div class="callout"><div class="title">${title}</div>${html}</div>`;
const figure = (src, cap) => `<div class="figure"><img src="${src}" alt="${cap}"><div class="cap">${cap}</div></div>`;

const IMG = '../capturas';

/* ------------------------------------------------------------------ */
/*  MÓDULO 1 — DISEÑO DE SISTEMA                                       */
/* ------------------------------------------------------------------ */
function module1() {
  const b = [];

  b.push(h(2, '1. Cómo funciona la plataforma (visión de negocio)'));
  b.push(p(
    'La <strong>Plataforma de Gestión de Pólizas de Arrendamiento</strong> administra pólizas ' +
    '<strong>individuales</strong> y <strong>colectivas</strong> (cánones de arrendamiento y riesgos amparados), ' +
    'con todo su ciclo de vida: emisión, agregado de riesgos, renovación con ajuste por IPC y cancelación. ' +
    'La operación crítica es la <strong>sincronización con el CORE transaccional legado (Oracle WebLogic)</strong>, ' +
    'que no debe bloquear ni degradar la experiencia del usuario final.'
  ));
  b.push(figure(IMG + '/view-all.png',
    'Figura 1. Arquitectura completa implementada y visualizada con Archify: frontend React 19, API demo Express (in-memory) y backend real Spring Boot 3 (Controller → Service → Repository → H2) con integración hacia WebLogic CORE.'));

  b.push(h(2, '2. Arquitectura de alto nivel y diagrama de componentes'));
  b.push(ul([
    '<strong>API Gateway (Spring Cloud Gateway / Kong):</strong> terminación SSL, validación de API Key/JWT, rate limiting y enrutamiento hacia los microservicios.',
    '<strong>Servicio de Pólizas (Spring Boot):</strong> ciclo de vida contractual — creación, cálculo de prima (<code>canon × vigencia_meses</code>), renovación periódica ajustada por IPC y cancelaciones.',
    '<strong>Servicio de Riesgos (Spring Boot):</strong> cardinalidad de inmuebles asegurados (1 para individual; 1..N para colectivas) y validaciones contractuales.',
    '<strong>Bus de eventos (Apache Kafka / RabbitMQ):</strong> desacopla operaciones críticas; cada cambio de estado emite <code>PolizaModificadaEvent</code> / <code>RiesgoCanceladoEvent</code>.',
    '<strong>Adapter de Integración con CORE (WebLogic Connector):</strong> consume eventos del broker y sincroniza el legado vía servicio agnóstico SOAP/REST (Outbox + Circuit Breaker).',
    '<strong>Servicio de Notificaciones (Email/SMS Worker):</strong> consume eventos de renovación/emisión y despacha correos (SendGrid) y SMS (Twilio/Infobip).',
    '<strong>Base de datos:</strong> PostgreSQL con réplicas de lectura y particionamiento por estado/fecha de vigencia.'
  ]));
  b.push(p(
    'En la implementación de la prueba, el backend real (<code>PolizaServiceImpl</code>, <code>RiesgoServiceImpl</code>) ' +
    'reproduce este diseño en micro: capas <code>controller → service → repository</code>, entidades <code>Poliza</code> y <code>Riesgo</code>, ' +
    'y el <code>CoreIntegrationService</code> hace el papel de adapter hacia la capa media (endpoint mock <code>/core-mock/evento</code> que registra logs SLF4J de cada intento de sincronización).'
  ));
  b.push(figure(IMG + '/view-backend-real.png',
    'Figura 2. Vista "Backend real Spring Boot" (Archify): Controller → Service → Repository → H2 (Java 17, :8080), con filtro de seguridad ApiKeyAuthFilter.'));
  b.push(figure(IMG + '/view-integracion-core.png',
    'Figura 3. Vista "WebLogic CORE (Módulo 1)" (Archify): CoreIntegrationService (adapter) notifica a la capa media WebLogic (mock), el destino del patrón Hexagonal/Outbox.'));

  b.push(h(2, '3. Tres patrones de arquitectura justificados'));
  b.push(h(3, '3.1 Event-Driven Architecture (EDA)'));
  b.push(ul([
    '<strong>Por qué se eligió:</strong> la integración con el CORE legado y las notificaciones multicanal pueden ser lentas o caer; no deben afectar el front-end.',
    '<strong>Cómo aplica aquí:</strong> cada mutación de estado (<code>CREACION_POLIZA</code>, <code>RENOVACION_IPC</code>, <code>CANCELACION_POLIZA_Y_RIESGOS</code>, <code>AGREGAR_RIESGO</code>, <code>CANCELAR_RIESGO</code>) genera un evento que el bus despacha a consumidores.',
    '<strong>Beneficio:</strong> eventual consistency, resiliencia y confirmación inmediata al cliente.'
  ]));
  b.push(h(3, '3.2 Arquitectura Hexagonal (Ports & Adapters)'));
  b.push(ul([
    '<strong>Por qué se eligió:</strong> las reglas de negocio aseguradoras (fórmula de prima, límite 1 riesgo en individual, ajuste IPC) deben ser inmunes al framework, la BD y el legado.',
    '<strong>Cómo aplica aquí:</strong> las interfaces <code>PolizaService</code> / <code>RiesgoService</code> son los puertos; <code>CoreIntegrationService</code> es un adaptador saliente hacia WebLogic.',
    '<strong>Beneficio:</strong> testabilidad al 100 % y portabilidad (cambiar H2 → PostgreSQL u Oracle, o SOAP → REST, sin tocar el dominio).'
  ]));
  b.push(h(3, '3.3 CQRS + API Gateway'));
  b.push(ul([
    '<strong>Por qué se eligió:</strong> el tablero mensual y las consultas masivas tienen patrones de acceso distintos a las transacciones de renovación/emisión.',
    '<strong>Cómo aplica aquí:</strong> separa comandos (renovar, cancelar, agregar riesgo) de consultas optimizadas para reportes.',
    '<strong>Beneficio:</strong> modelos de lectura (vistas materializadas + Redis) que liberan al motor transaccional de cargas de lectura.'
  ]));

  b.push(h(2, '4. Modelo de datos principal'));
  b.push(p('Entidades con sus relaciones. En la entidad <code>Poliza</code>, la prima se <em>calcula</em> automáticamente en <code>@PrePersist</code>/<code>@PreUpdate</code> como <code>prima_total = canon_mensual × vigencia_meses</code>.'));
  b.push(h(3, '4.1 POLIZA (1 → N RIESGO)'));
  b.push(table(['Campo', 'Tipo / constraint', 'Descripción'], [
    ['id', 'BIGINT (PK, IDENTITY)', 'Identificador'],
    ['numero_poliza', 'VARCHAR(50) UNIQUE', 'Número de póliza'],
    ['tipo', "ENUM 'INDIVIDUAL' | 'COLECTIVA'", 'Tipo de póliza'],
    ['estado', "ENUM 'ACTIVA' | 'RENOVADA' | 'CANCELADA'", 'Estado del ciclo de vida'],
    ['tomador / tomador_doc', 'VARCHAR(150)', 'Tomador (inmobiliaria en colectiva)'],
    ['asegurado / beneficiario', 'VARCHAR(150)', 'Partes del contrato'],
    ['vigencia_meses', 'INTEGER (> 0)', 'Vigencia (p. ej. 12)'],
    ['fecha_inicio / fecha_fin', 'DATE', 'Vigencia contractual'],
    ['canon_mensual', 'NUMERIC(14,2)', 'Canon mensual del arriendo'],
    ['prima_total', 'NUMERIC(14,2)', 'Prima = canon × vigencia (calculada)'],
    ['porcentaje_ipc_ultima_renovacion', 'NUMERIC(5,2)', 'Último IPC aplicado'],
    ['fecha_ultima_renovacion', 'DATE', 'Fecha de última renovación']
  ]));
  b.push(h(3, '4.2 RIESGO (N → 1 POLIZA)'));
  b.push(table(['Campo', 'Tipo / constraint', 'Descripción'], [
    ['id / poliza_id', 'BIGINT (PK) / FK → polizas.id', 'Identificador y relación'],
    ['direccion / ciudad', 'VARCHAR(200) / VARCHAR(100)', 'Inmueble asegurado'],
    ['valor_canon', 'NUMERIC(14,2)', 'Canon del inmueble'],
    ['descripcion_inmueble', 'TEXT', 'Descripción del bien'],
    ['arrendatario_nombre / arrendatario_doc', 'VARCHAR(150)', 'Arrendatario'],
    ['estado', "ENUM 'ACTIVO' | 'CANCELADO'", 'Estado del riesgo'],
    ['fecha_creacion', 'DATE', 'Fecha de alta']
  ]));
  b.push(h(3, '4.3 AUDITORIA_CORE_LOG y RECORDATORIO (soporte)'));
  b.push(table(['Entidad', 'Campos clave', 'Propósito'], [
    ['AUDITORIA_CORE_LOG', 'poliza_id, evento, payload (JSONB), http_status, timestamp', 'Trazabilidad de envíos al CORE'],
    ['RECORDATORIO', 'poliza_id, tipo (RENOVACION/IPC/CANON), fecha_limite, canal (EMAIL/SMS/PUSH), completado', 'Alertas de renovación y pago']
  ]));

  b.push(h(2, '5. Aspectos no funcionales (NFR)'));
  b.push(h(3, '5.1 Escalabilidad'));
  b.push(ul([
    'Kubernetes (EKS/GKE) con HPA basado en CPU y latencia HTTP.',
    'Caché distribuido Redis para pólizas vigentes e índices IPC.',
    'Read-replicas en PostgreSQL (lecturas del tablero separadas de las escrituras).'
  ]));
  b.push(h(3, '5.2 Logs y observabilidad (implementado en la prueba)'));
  b.push(ul([
    'OpenTelemetry con Correlation ID (TraceId) transversal hasta WebLogic (diseño).',
    'Micrometer + Prometheus + Grafana y centralización con Loki/EFK (diseño).',
    '<strong>Implementado:</strong> logs estructurados SLF4J en <code>CoreIntegrationService</code> y <code>CoreMockController</code> que evidencian cada intento de sincronización.'
  ]));
  b.push(h(3, '5.3 Tolerancia a fallos (implementado en la prueba)'));
  b.push(ul([
    'Resilience4j (Circuit Breaker, Retry con Exponential Backoff, RateLimiter) hacia WebLogic (diseño).',
    'Patrón Transactional Outbox + DLQ (diseño).',
    '<strong>Implementado:</strong> <code>notificarCambioCore()</code> envuelve la llamada en try/catch — si la capa WebLogic no responde, la transacción de negocio no se interrumpe y se registra la advertencia para reintento.'
  ]));
  b.push(h(3, '5.4 Versionamiento de APIs'));
  b.push(ul([
    'Versionado por URI (<code>/api/v1/polizas</code>) y Content Negotiation.',
    'Retrocompatibilidad: campos nuevos opcionales y headers <code>Deprecation</code>/<code>Sunset</code>.'
  ]));

  b.push('<hr class="pagesep">');
  b.push(p('<em>Elaborado a partir de la implementación real: spring-boot-backend/src, RESPUESTA_PRUEBA_TECNICA.md y el diagrama Archify (docs/seguros-polizas-architecture.html). Diagramas generados con Archify.</em>'));
  return b.join('\n');
}

/* ------------------------------------------------------------------ */
/*  MÓDULO 2 — PRUEBA TÉCNICA PRÁCTICA                                 */
/* ------------------------------------------------------------------ */
function module2() {
  const b = [];
  const curlRename = `Puesto que enviamos el proyecto completo (frontend + backend) a su repositorio público, los endpoints se consumen así:`;

  b.push(h(2, '1. Cómo funciona la solución'));
  b.push(p(
    'El ejercicio se resolvió con <strong>React 19 + Vite + TypeScript</strong> (frontend) y dos backends con <strong>contrato idéntico</strong>: ' +
    'una <strong>API en memoria Express/tsx</strong> (<code>server.ts</code>, puerto 3000) que replica cada endpoint y regla para que la demo funcione 100 % sin infraestructura, ' +
    'y el <strong>backend real Spring Boot 3 + Java 17</strong> (<code>spring-boot-backend/</code>, puerto 8080) con capas <code>controller → service → repository</code> sobre H2. ' +
    'Ambos exigen el header <code>x-api-key: 123456</code> (401 si falta) y notifican cada cambio al CORE vía <code>POST /core-mock/evento</code>.'
  ));

  b.push(h(2, '2. Los 6 endpoints obligatorios (backend Spring Boot)'));
  b.push(table(['Endpoint', 'Descripción', 'Implementación'], [
    ['GET /polizas (tipo, estado)', 'Listar pólizas por filtros', 'PolizaRepository.findByTipoAndEstado (JPQL con predicados opcionales)'],
    ['GET /polizas/{id}/riesgos', 'Riesgos de la póliza', 'RiesgoService.obtenerRiesgosPorPoliza (404 si la póliza no existe)'],
    ['POST /polizas/{id}/renovar', 'Renovar con ajuste IPC; estado → RENOVADA', 'PolizaServiceImpl.renovarPoliza: canon × (1 + IPC/100), prima = canon × vigencia; evento RENOVACION_IPC'],
    ['POST /polizas/{id}/cancelar', 'Cancelar póliza en cascada', 'PolizaServiceImpl.cancelarPoliza: cancela la póliza y todos sus riesgos; evento CANCELACION_POLIZA_Y_RIESGOS'],
    ['POST /polizas/{id}/riesgos', 'Agregar riesgo (solo colectiva; 1er riesgo si individual)', 'RiesgoServiceImpl.agregarRiesgoAPoliza con validación de tipo y conteo; recalcula canon acumulado en colectiva'],
    ['POST /riesgos/{id}/cancelar', 'Cancelar riesgo individual', 'RiesgoServiceImpl.cancelarRiesgo; resta el canon en colectiva; evento CANCELAR_RIESGO']
  ]));
  b.push(p('Extras implementados: <code>GET /polizas/{id}</code>, <code>POST /polizas</code> (emisión con cálculo de prima y riesgo inicial) y el mock <code>POST /core-mock/evento</code>.'));

  b.push(h(2, '3. Reglas de negocio y códigos de respuesta'));
  b.push(table(['Regla', 'Implementación', 'HTTP'], [
    ['Individual solo puede tener 1 riesgo activo', 'countByPolizaIdAndEstado ≥ 1 → BusinessException', '422'],
    ['No se puede renovar una póliza CANCELADA', 'PolizaServiceImpl.renovarPoliza', '422'],
    ['No se pueden agregar riesgos a póliza CANCELADA', 'RiesgoServiceImpl.agregarRiesgoAPoliza', '422'],
    ['Cancelar póliza cancela todos sus riesgos', 'Cascada: findByPolizaId + cancelar cada riesgo', '200'],
    ['Agregar riesgo valida el tipo de póliza', 'INDIVIDUAL con 1 riesgo activo → rechazado', '422'],
    ['Falta/erróneo x-api-key', 'ApiKeyAuthFilter (filtro HTTP @Order(1))', '401'],
    ['Recurso inexistente', 'ResourceNotFoundException', '404'],
    ['Validación de campos (Bean Validation)', 'MethodArgumentNotValidException', '400'],
    ['Error no controlado', 'Excepción genérica', '500']
  ]));
  b.push(p('Los códigos los centraliza <code>GlobalExceptionHandler</code> (<code>@RestControllerAdvice</code>), y toda respuesta usa el envoltorio <code>ApiResponse{exito, mensaje, datos, timestamp}</code>.'));

  b.push(h(2, '4. Autenticación y cookies — seguridad real'));
  b.push(p(
    'El <code>ApiKeyAuthFilter</code> valida el header en cada petición (permitiendo solo <code>/h2-console</code> y <code>/favicon.ico</code>). ' +
    'La clave se configura externamente en <code>application.properties</code> (<code>app.security.api-key</code>) y se inyecta con <code>@Value</code>.'
  ));

  b.push(h(2, '5. Ejemplos de consumo (cURL)'));
  b.push(p(curlRename));
  b.push(code(
`# 1. Listar pólizas filtradas
curl -X GET "http://localhost:8080/polizas?tipo=COLECTIVA&estado=ACTIVA" -H "x-api-key: 123456"

# 2. Riesgos de una póliza
curl -X GET "http://localhost:8080/polizas/1/riesgos" -H "x-api-key: 123456"

# 3. Renovar con IPC 9,28 %
curl -X POST "http://localhost:8080/polizas/1/renovar" -H "x-api-key: 123456" \\
     -H "Content-Type: application/json" -d '{"porcentajeIpc": 9.28}'

# 4. Cancelar póliza (cancela sus riesgos)
curl -X POST "http://localhost:8080/polizas/1/cancelar" -H "x-api-key: 123456"

# 5. Agregar riesgo a póliza colectiva
curl -X POST "http://localhost:8080/polizas/2/riesgos" -H "x-api-key: 123456" \\
     -H "Content-Type: application/json" -d '{
       "direccion": "Carrera 7 # 116-50 Apto 802",
       "ciudad": "Bogota D.C.",
       "valorCanon": 3200000.00,
       "descripcionInmueble": "Apartamento estrato 5 con balcon",
       "arrendatarioNombre": "Camila Montoya",
       "arrendatarioDoc": "1020304050"
     }'

# 6. Cancelar riesgo individual
curl -X POST "http://localhost:8080/riesgos/3/cancelar" -H "x-api-key: 123456"

# Mock de sincronización WebLogic CORE
curl -X POST "http://localhost:8080/core-mock/evento" -H "x-api-key: 123456" \\
     -H "Content-Type: application/json" -d '{"evento":"ACTUALIZACION","polizaId":555}'
`, 'bash'));

  b.push(h(2, '6. Estructura, instalación y ejecución'));
  b.push(h(3, '6.1 Frontend + API en memoria (app completa, :3000)'));
  b.push(code(
`npm install
cp .env.example .env.local      # opcional (GEMINI_API_KEY solo para funciones IA)
npm run dev                     # abrir http://localhost:3000
`, 'bash'));
  b.push(h(3, '6.2 Backend Spring Boot real (:8080)'));
  b.push(code(
`cd spring-boot-backend
mvn clean package
mvn spring-boot:run
# Consola H2: http://localhost:8080/h2-console  (jdbc:h2:mem:polizasdb · sa · sin password)
`, 'bash'));

  b.push(h(2, '7. Formato de entrega: enlace público de GitHub'));
  b.push(callout('Enlace del repositorio público (completar antes de enviar)', p(
    '<strong>https://github.com/<span style="color:#0d9488">tu-usuario/tu-repositorio</span></strong>'
  )));
  b.push(p(
    'El formato solicitado es un <strong>enlace público de GitHub</strong> — no se envían archivos, carpetas ni enlaces a Drive con el código fuente.'
  ));
  b.push(h(3, 'Guía para publicar la solución en GitHub'));
  b.push(code(
`# 1. Desde la raíz del proyecto (frontend + spring-boot-backend juntos)
git init
git add .
git commit -m "feat: plataforma gestion de polizas de arrendamiento (modulos 1-4)"

# 2. Crear el repositorio público y subirlo (con GitHub CLI) — alternativa A
gh auth login
gh repo create seguros-polizas --public --push --source . --remote origin

# 2b. Alternativa B: usar un repositorio ya creado en github.com
git remote add origin https://github.com/tu-usuario/tu-repositorio.git
git branch -M main
git push -u origin main
`, 'bash'));
  b.push(ul([
    '<strong>.gitignore:</strong> excluir <code>node_modules/</code>, <code>dist/</code>, <code>target/</code>, <code>.env.local</code> y cualquier archivo con claves reales.',
    '<strong>No subir credenciales:</strong> la clave <code>x-api-key</code> de la demo está documentada (123456) a propósito; no incluyas claves de Gemini ni datos sensibles.',
    '<strong>Verificación final:</strong> que el README y ambos proyectos queden visibles y compilables desde el repositorio público.'
  ]));

  b.push('<hr class="pagesep">');
  b.push(p('<em>Evidencia de código: spring-boot-backend/src/main/java/com/seguros/polizas (controller, service, repository, security, exception, dto, model) y server.ts (demo Express en memoria).</em>'));
  return b.join('\n');
}

/* ------------------------------------------------------------------ */
/*  MÓDULO 3 — CONOCIMIENTOS EN BBDD                                   */
/* ------------------------------------------------------------------ */
function module3() {
  const b = [];

  b.push(h(2, '1. Consulta lenta a optimizar'));
  b.push(p('Contexto: tabla <code>orders</code> con <strong>10.000.000</strong> de filas y <code>customers</code> con <strong>500.000</strong>, consultando las órdenes de clientes de <strong>México</strong>:'));
  b.push(code(
`SELECT o.order_id, o.order_date, c.customer_name, o.total_amount
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
WHERE c.country = 'México';`, 'sql'));
  b.push(p(
    'Sin índices, el motor hace <strong>Seq Scan</strong> sobre 10M de órdenes y 500K de clientes, con un JOIN costoso entre ambos. A continuación las estrategias aplicadas y su justificación.'
  ));

  b.push(h(2, '2. Estrategia 1 — Índices compuestos y cubrientes (Index-Only Scan)'));
  b.push(code(
`-- Filtrar solo clientes de México sin ir a la tabla (covering)
CREATE INDEX idx_customers_mexico ON customers (country, customer_id) INCLUDE (customer_name);

-- Cubrir el JOIN y las columnas proyectadas de orders
CREATE INDEX idx_orders_customer_covering ON orders (customer_id) INCLUDE (order_id, order_date, total_amount);`, 'sql'));
  b.push(p(
    '<strong>Decisión y justificación:</strong> el índice <code>customers(country, customer_id)</code> convierte el filtro <code>country = \'México\'</code> en un <em>Index Range Scan</em> y, al incluir <code>customer_name</code>, se vuelve <strong>Index-Only Scan</strong> (no toca páginas de datos). ' +
    'El índice cubriente sobre <code>orders.customer_id</code> permite resolver la proyección directamente desde el índice, de modo que el motor puede usar <em>Hash Join</em> o <em>Merge Join</em> sobre estructuras pequeñas: desaparece el Seq Scan de 10M de filas.'
  ));

  b.push(h(2, '3. Estrategia 2 — Particionamiento + vista materializada'));
  b.push(code(
`-- Partición por rango temporal de orders (Partition Pruning)
CREATE TABLE orders (...) PARTITION BY RANGE (order_date);

-- (alternativa) Partición por lista de customers.country

-- Vista materializada para el reporte recurrente de México
CREATE MATERIALIZED VIEW mv_mexico_orders AS
SELECT o.order_id, o.order_date, c.customer_name, o.total_amount
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
WHERE c.country = 'México';

CREATE UNIQUE INDEX idx_mv_mexico_orders ON mv_mexico_orders (order_id);

-- Refresco concurrente (sin bloquear lecturas)
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_mexico_orders;`, 'sql'));
  b.push(p(
    '<strong>Decisión y justificación:</strong> el particionamiento (por <code>order_date</code> o <code>country</code>) permite <em>Partition Pruning</em> — el optimizador descarta particiones completas según el filtro. ' +
    'La <strong>vista materializada</strong> precalcula el resultado exacto del reporte de México; las consultas recurrentes leen milisegundos desde ese snapshot y el refresco <code>CONCURRENTLY</code> se hace sin bloquear a los usuarios. ' +
    'Se usa cuando el reporte es frecuente y tolera una ligera desactualización.'
  ));

  b.push(h(2, '4. Estrategia 3 — Reestructuración CTE con filtrado temprano + EXPLAIN ANALYZE'));
  b.push(code(
`WITH mexico_customers AS (
  SELECT customer_id, customer_name
  FROM customers
  WHERE country = 'México'
)
SELECT o.order_id, o.order_date, mc.customer_name, o.total_amount
FROM mexico_customers mc
JOIN orders o ON mc.customer_id = o.customer_id;

-- Validación del plan real:
EXPLAIN (ANALYZE, BUFFERS)
WITH mexico_customers AS (...) SELECT ... ;`, 'sql'));
  b.push(p(
    '<strong>Decisión y justificación:</strong> reducir el conjunto de trabajo <em>antes</em> del JOIN: el CTE materializa primero los pocos clientes mexicanos y luego los junta con <code>orders</code>, minimizando filas exploradas en el lado grande. ' +
    '<code>EXPLAIN ANALYZE</code> permite confirmar el <em>plan real</em> (no estimado), ver el número de filas (rows), los buffers leídos y el tiempo por nodo, y así decidir datos de forma objetiva.'
  ));

  b.push(h(2, '5. Decisión aplicada a la propia plataforma (DDL con constraints e índices)'));
  b.push(p('La misma disciplina se aplicó al modelo de pólizas: constraints de integridad y regla de negocio en la base de datos (índice único condicional para "individual = 1 riesgo").'));
  b.push(code(
`-- Regla de negocio en BBDD: póliza individual solo 1 riesgo activo
CREATE UNIQUE INDEX idx_unico_riesgo_individual
ON riesgos (poliza_id)
WHERE (estado = 'ACTIVO')
  AND poliza_id IN (SELECT id FROM polizas WHERE tipo = 'INDIVIDUAL');

-- Consulta A: vencimientos en 30 días (filtro por fecha y estado)
CREATE INDEX idx_polizas_vencimiento_estado
ON polizas (fecha_fin, estado)
INCLUDE (numero_poliza, canon_mensual);

-- Consulta B: prima acumulada por tipo (solo ACTIVA)
CREATE INDEX idx_polizas_tipo_estado
ON polizas (tipo, estado)
INCLUDE (canon_mensual, prima_total);

-- JOIN frecuente pólizas ↔ riesgos
CREATE INDEX idx_riesgos_poliza_id_estado ON riesgos (poliza_id, estado);`, 'sql'));

  b.push(h(2, '6. Resumen de decisiones técnicas'));
  b.push(table(['Estrategia', 'Cuándo usarla', 'Beneficio clave'], [
    ['Índices cubrientes', 'Consultas sobre tablas enormes con filtro selectivo y columnas conocidas', 'Index-Only Scan: elimina Seq Scan y accesos a datos'],
    ['Particionado + MV', 'Reportes recurrentes y datos históricos que crecen', 'Partition Pruning y lecturas en ms sin bloquear'],
    ['CTE + filtrado temprano', 'JOINs con una tabla mucho más grande que otra', 'Reducción del conjunto de trabajo antes del JOIN'],
    ['EXPLAIN ANALYZE', 'Siempre antes de decidir', 'Evidencia empírica del plan y de los costos']
  ]));

  b.push('<hr class="pagesep">');
  b.push(p('<em>Fuente: spring-boot-backend/README.md (Módulo 3) y pestaña BBDD & Git (src/components/DatabaseAndGitView.tsx) de la plataforma.</em>'));
  return b.join('\n');
}

/* ------------------------------------------------------------------ */
/*  MÓDULO 4 — CONOCIMIENTOS EN GIT                                    */
/* ------------------------------------------------------------------ */
function module4() {
  const b = [];

  b.push(h(2, '1. Escenario planteado'));
  b.push(p(
    'Estás en la rama <code>feature/new-login</code>. Un compañero fusionó en <code>main</code> un commit que corrige un <strong>bug crítico de seguridad</strong> (hotfix). ' +
    'Necesitas incorporar <strong>únicamente ese commit</strong> a tu rama, sin arrastrar el resto de cambios de <code>main</code>.'
  ));

  b.push(h(2, '2. Comando y estrategia: git cherry-pick'));
  b.push(code(
`# 1. Estado limpio antes de operar
git status

# 2. Actualizar referencias del remoto
git fetch origin main

# 3. Identificar el hash del commit de seguridad en main
git log origin/main --oneline -n 5
# Ejemplo: a1b2c3d "fix(security): sanitize auth input token to prevent injection"

# 4. En feature/new-login, aplicar SOLO ese commit
git cherry-pick a1b2c3d

# 5. Si hay conflicto: resolver, marcar y continuar
# git status
# git add <archivos-resueltos>
# git cherry-pick --continue

# 6. Verificar el commit incorporado
git log -1 --stat

# 7. (Opcional) cancelar la operación si falla
# git cherry-pick --abort
`, 'bash'));

  b.push(h(2, '3. Justificación de la decisión'));
  b.push(p(
    '<code>git cherry-pick &lt;hash&gt;</code> extrae un commit individual por su SHA-1 y lo reaplica sobre la rama actual mediante un <strong>3-way merge</strong> del parche. Es la única opción que trae exactamente un commit.'
  ));
  b.push(h(3, 'Por qué NO git merge main'));
  b.push(ul([
    'Un merge traería <strong>todos</strong> los commits acumulados de <code>main</code> (features incompletas de otros desarrolladores, cambios que desestabilizan la rama).',
    'Violaría el requisito de aislar el parche de seguridad.'
  ]));
  b.push(h(3, 'Por qué NO git rebase main'));
  b.push(ul([
    'Un rebase <strong>reescribe el historial</strong> de <code>feature/new-login</code> y lo coloca sobre la punta de <code>main</code>, trayendo la totalidad de sus cambios.',
    'Además modifica los SHAs de los commits locales (complicación y riesgo en trabajo compartido).'
  ]));
  b.push(callout('Conclusión', p('<code>cherry-pick</code> minimiza el alcance del cambio (cirugía quirúrgica), mantiene el historial intacto y es la práctica estándar para backport de hotfixes.')));

  b.push(h(2, '4. Complemento: modelo de branching recomendado (GitFlow adaptado)'));
  b.push(table(['Rama', 'Rol', 'Reglas'], [
    ['main', 'Producción auditada', 'Protegida; solo merges de releases/hotfixes'],
    ['develop', 'Integración continua', 'Despliega a QA; fuente de las features'],
    ['feature/*', 'Historias cortas (1-3 días)', 'Nacen de develop; se fusionan con PR'],
    ['hotfix/*', 'Emergencias P1 desde main', 'Merge a main con tag semántico y backport a develop']
  ]));
  b.push(h(3, '4.1 Protocolo de hotfix en producción'));
  b.push(code(
`# 1. Crear la rama de emergencia desde main
git checkout main && git pull origin main && git checkout -b hotfix/calculo-prima-colectiva-v1.0.1

# 2. Corregir + test de regresión (mvn test) + commit

# 3. Merge a main con tag semántico y despliegue
git checkout main && git merge --no-ff hotfix/calculo-prima-colectiva-v1.0.1 \\
    && git tag -a v1.0.1 -m "HOTFIX: correccion calculo prima" && git push origin main --tags

# 4. Backport a develop y limpieza
git checkout develop && git merge --no-ff hotfix/calculo-prima-colectiva-v1.0.1 \\
    && git push origin develop && git branch -d hotfix/calculo-prima-colectiva-v1.0.1
`, 'bash'));

  b.push(h(3, '4.2 Buenas prácticas de equipo'));
  b.push(ul([
    '<strong>Conventional Commits:</strong> mensajes estándar — <code>feat(polizas): calculo de prima con IPC</code>, <code>fix(riesgos): bloqueo adicion en poliza individual</code>.',
    '<strong>Branch protection:</strong> push directo bloqueado a <code>main</code>/<code>develop</code>, mínimo 1 aprobación y CI en verde.',
    '<strong>Squash & merge</strong> en PRs: historial de <code>develop</code> limpio y atómico.'
  ]));

  b.push('<hr class="pagesep">');
  b.push(p('<em>Fuente: spring-boot-backend/README.md (Módulo 4) y pestaña BBDD & Git (src/components/DatabaseAndGitView.tsx) de la plataforma.</em>'));
  return b.join('\n');
}

const docs = [
  {
    file: 'M1_Diseño_Sistema.html',
    title: 'Módulo 1 · Diseño de Sistema',
    kicker: 'Prueba Técnica — Desarrollador TI Seguros Bolívar',
    sub: 'Arquitectura, patrones, modelo de datos y diagrama de componentes. Autor: Diego Alejandro Sepulveda Huetio.',
    accent: '#0d9488',
    body: module1()
  },
  {
    file: 'M2_Prueba_Practica.html',
    title: 'Módulo 2 · Prueba Técnica Práctica',
    kicker: 'Prueba Técnica — Desarrollador TI Seguros Bolívar',
    sub: 'Solución implementada (Spring Boot + React) y formato de entrega: enlace público de GitHub.',
    accent: '#2563eb',
    body: module2()
  },
  {
    file: 'M3_BBDD.html',
    title: 'Módulo 3 · Conocimientos en BBDD',
    kicker: 'Prueba Técnica — Desarrollador TI Seguros Bolívar',
    sub: 'Estrategias de optimización SQL y explicación de las decisiones técnicas.',
    accent: '#7c3aed',
    body: module3()
  },
  {
    file: 'M4_Git.html',
    title: 'Módulo 4 · Conocimientos en Git',
    kicker: 'Prueba Técnica — Desarrollador TI Seguros Bolívar',
    sub: 'Comandos solicitados y justificación de su uso (git cherry-pick).',
    accent: '#ea580c',
    body: module4()
  }
];

for (const d of docs) {
  const html = layout(d.title, d.kicker, d.sub, d.accent, d.body);
  writeFileSync(join(here, d.file), html, 'utf8');
  console.log('OK', d.file, '·', Buffer.byteLength(html, 'utf8'), 'bytes');
}
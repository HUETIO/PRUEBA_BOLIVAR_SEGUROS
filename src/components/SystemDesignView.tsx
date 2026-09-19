import React, { useState } from 'react';
import { 
  Boxes, 
  Layers, 
  Cpu, 
  Database, 
  Radio, 
  ShieldCheck, 
  Server, 
  ArrowRight, 
  Zap, 
  Activity, 
  Network, 
  Share2, 
  GitBranch, 
  CheckCircle2, 
  ChevronRight,
  Workflow
} from 'lucide-react';

export const SystemDesignView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'architecture' | 'patterns' | 'datamodel' | 'nfr'>('architecture');

  return (
    <div className="space-y-6 pb-12 text-slate-100">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Módulo 1 • System Design & Arquitectura
          </span>
          <span className="text-xs text-slate-400">Duración: 60 minutos • Pensamiento Estratégico</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Arquitectura Empresarial: Plataforma de Gestión de Pólizas
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Diseño integral de alta disponibilidad (24/7), resiliencia, eventos de notificación y desacoplamiento con el sistema CORE transaccional legado mediante capa media WebLogic.
        </p>

        {/* Section Navigation Tabs */}
        <div className="flex overflow-x-auto space-x-2 mt-6 pt-4 border-t border-slate-800 text-xs">
          {[
            { id: 'architecture', label: '1. Diagrama de Arquitectura & Componentes' },
            { id: 'patterns', label: '2. Tres Patrones Justificados' },
            { id: 'datamodel', label: '3. Modelo de Datos Principal' },
            { id: 'nfr', label: '4. Escalabilidad, Observabilidad & Resiliencia' },
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`px-3.5 py-2 rounded-xl font-semibold transition whitespace-nowrap ${
                activeSection === sec.id
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Architecture Diagram & Components */}
      {activeSection === 'architecture' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Interactive Flow Diagram */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Workflow className="w-5 h-5 text-emerald-400" />
              <span>Diagrama de Componentes de Alto Nivel</span>
            </h2>

            {/* Visual Box Flow */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              {/* Clients */}
              <div className="bg-slate-950 border border-slate-700/80 rounded-xl p-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="font-bold text-white text-xs">Frontend & Canales</div>
                <div className="text-[11px] text-slate-400">React SPA • Portal Inmobiliarias • App Móvil</div>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex justify-center text-slate-500">
                <ArrowRight className="w-6 h-6 animate-pulse text-emerald-400" />
              </div>

              {/* API Gateway */}
              <div className="bg-slate-950 border border-emerald-500/50 rounded-xl p-4 text-center space-y-2 ring-1 ring-emerald-500/30">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-300 mx-auto flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="font-bold text-white text-xs">API Gateway</div>
                <div className="text-[11px] text-slate-400">Auth x-api-key • Rate Limiter • Reverse Proxy</div>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex justify-center text-slate-500">
                <ArrowRight className="w-6 h-6 animate-pulse text-emerald-400" />
              </div>

              {/* Core Microservices */}
              <div className="bg-slate-950 border border-slate-700/80 rounded-xl p-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-lg bg-teal-500/20 text-teal-300 mx-auto flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <div className="font-bold text-white text-xs">Microservicios de Dominio</div>
                <div className="text-[11px] text-slate-400">Servicio Pólizas • Servicio Riesgos</div>
              </div>
            </div>

            {/* Asynchronous Backbone */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-dashed border-teal-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-300 flex items-center gap-2">
                  <Radio className="w-4 h-4" /> Bus de Eventos Asíncronos (Apache Kafka / RabbitMQ)
                </span>
                <span className="text-[10px] bg-teal-950 text-teal-300 px-2 py-0.5 rounded border border-teal-800">
                  Alta Resiliencia & Desacoplamiento
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="font-bold text-slate-200 block mb-1">📩 Servicio de Notificaciones</span>
                  <p className="text-slate-400 text-[11px]">
                    Consume tópicos de renovación y emisión para despachar SMS a arrendatarios y correos transaccionales a inmobiliarias.
                  </p>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="font-bold text-slate-200 block mb-1">🔌 Adapter WebLogic CORE (Outbox + Retry)</span>
                  <p className="text-slate-400 text-[11px]">
                    Consume eventos de modificación de póliza/riesgos y sincroniza el CORE legado sin bloquear ni ralentizar al usuario.
                  </p>
                </div>
              </div>
            </div>

            {/* Component Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5 text-xs">
                <span className="text-emerald-400 font-bold block">1. Servicio de Pólizas (Spring Boot)</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Responsable del ciclo de vida contractual: cálculo de prima (Canon × Vigencia), validaciones de tomador/asegurado, renovaciones periódicas con incremento IPC y cancelaciones.
                </p>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5 text-xs">
                <span className="text-teal-400 font-bold block">2. Servicio de Riesgos (Spring Boot)</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Gestiona la cardinalidad de los inmuebles asegurados (1 fijo para individuales; 1 a N dinámicos para colectivas). Recalcula el canon total acumulado tras altas/bajas.
                </p>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5 text-xs">
                <span className="text-blue-400 font-bold block">3. Adapter CORE WebLogic</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Encapsula el protocolo SOAP/REST del sistema legado bancario/asegurador, gestionando Circuit Breakers, Exponential Backoff y Dead Letter Queue (DLQ).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Patterns */}
      {activeSection === 'patterns' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">1. Event-Driven Architecture (EDA)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Por qué se seleccionó:</strong> El requerimiento exige integración con un CORE transaccional legado (WebLogic) y notificaciones multicanal (SMS/Correo) con disponibilidad 24/7.
            </p>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="font-semibold text-emerald-300">Beneficio Estratégico:</div>
              <p>
                Desacopla el front-end del CORE legado. Si WebLogic presenta latencia o caída temporal, la operación de renovación del cliente se confirma de inmediato y el evento se reintenta vía Kafka/RabbitMQ.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">2. Arquitectura Hexagonal (Ports & Adapters)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Por qué se seleccionó:</strong> Las reglas de negocio de seguros (fórmula de prima, límite de riesgos por tipo de póliza, cálculo de ajuste IPC) deben ser inmunes a cambios de infraestructura.
            </p>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="font-semibold text-teal-300">Beneficio Estratégico:</div>
              <p>
                Aísla el dominio puro de la base de datos (JPA/Hibernate) y de los endpoints de WebLogic. Permite cambiar de Oracle a PostgreSQL o de SOAP a gRPC sin alterar una sola línea de lógica aseguradora.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">3. CQRS + API Gateway</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Por qué se seleccionó:</strong> El tablero de progreso mensual y las consultas frecuentes de millones de pólizas por inmobiliarias tienen patrones de acceso completamente diferentes a las transacciones de renovación y emisión.
            </p>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="font-semibold text-blue-300">Beneficio Estratégico:</div>
              <p>
                Permite mantener modelos de lectura optimizados con vistas materializadas y Redis, liberando al motor transaccional de comandos de carga de lectura masiva.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Data Model */}
      {activeSection === 'datamodel' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 animate-in fade-in duration-200">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <span>Modelo de Datos Principal (Entidades & Relaciones)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 text-sm">Entidad: POLIZA</span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">1 a N Riesgos</span>
              </div>
              <ul className="space-y-1 text-slate-400 font-mono text-[11px]">
                <li>• <strong className="text-slate-200">id</strong>: BIGINT (PK)</li>
                <li>• <strong className="text-slate-200">numero_poliza</strong>: VARCHAR(50) UNIQUE</li>
                <li>• <strong className="text-slate-200">tipo</strong>: ENUM ('INDIVIDUAL', 'COLECTIVA')</li>
                <li>• <strong className="text-slate-200">estado</strong>: ENUM ('ACTIVA', 'RENOVADA', 'CANCELADA')</li>
                <li>• <strong className="text-slate-200">tomador / tomador_doc</strong>: VARCHAR(150)</li>
                <li>• <strong className="text-slate-200">asegurado / beneficiario</strong>: VARCHAR(150)</li>
                <li>• <strong className="text-slate-200">vigencia_meses</strong>: INT (Ej: 12)</li>
                <li>• <strong className="text-slate-200">fecha_inicio / fecha_fin</strong>: DATE</li>
                <li>• <strong className="text-slate-200">canon_mensual / prima_total</strong>: NUMERIC(14,2)</li>
                <li>• <strong className="text-slate-200">porcentaje_ipc_renovacion</strong>: NUMERIC(5,2)</li>
              </ul>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-400 text-sm">Entidad: RIESGO</span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">FK: poliza_id</span>
              </div>
              <ul className="space-y-1 text-slate-400 font-mono text-[11px]">
                <li>• <strong className="text-slate-200">id</strong>: BIGINT (PK)</li>
                <li>• <strong className="text-slate-200">poliza_id</strong>: BIGINT (FK referencias polizas.id)</li>
                <li>• <strong className="text-slate-200">direccion / ciudad</strong>: VARCHAR(200)</li>
                <li>• <strong className="text-slate-200">valor_canon</strong>: NUMERIC(14,2)</li>
                <li>• <strong className="text-slate-200">arrendatario_nombre / arrendatario_doc</strong>: VARCHAR(150)</li>
                <li>• <strong className="text-slate-200">descripcion_inmueble</strong>: TEXT</li>
                <li>• <strong className="text-slate-200">estado</strong>: ENUM ('ACTIVO', 'CANCELADO')</li>
                <li>• <strong className="text-slate-200">fecha_creacion</strong>: DATE</li>
              </ul>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-400 text-sm">Entidad: AUDITORIA_CORE_LOG</span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">Trazabilidad</span>
              </div>
              <ul className="space-y-1 text-slate-400 font-mono text-[11px]">
                <li>• <strong className="text-slate-200">id</strong>: UUID / BIGINT (PK)</li>
                <li>• <strong className="text-slate-200">poliza_id</strong>: BIGINT</li>
                <li>• <strong className="text-slate-200">evento</strong>: VARCHAR(50) ('ACTUALIZACION')</li>
                <li>• <strong className="text-slate-200">payload_enviado</strong>: JSONB</li>
                <li>• <strong className="text-slate-200">http_status</strong>: INT (200, 500, etc.)</li>
                <li>• <strong className="text-slate-200">timestamp</strong>: TIMESTAMP WITH TIME ZONE</li>
              </ul>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 text-sm">Entidad: RECORDATORIO</span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">Notificaciones</span>
              </div>
              <ul className="space-y-1 text-slate-400 font-mono text-[11px]">
                <li>• <strong className="text-slate-200">id</strong>: VARCHAR(50) (PK)</li>
                <li>• <strong className="text-slate-200">poliza_id</strong>: BIGINT (Nullable)</li>
                <li>• <strong className="text-slate-200">tipo</strong>: ENUM ('RENOVACION', 'IPC', 'CANON')</li>
                <li>• <strong className="text-slate-200">fecha_limite</strong>: DATE</li>
                <li>• <strong className="text-slate-200">canal</strong>: ENUM ('EMAIL', 'SMS', 'PUSH')</li>
                <li>• <strong className="text-slate-200">completado</strong>: BOOLEAN</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 4. NFRs: Scalability, Logs, Fault tolerance, Versioning */}
      {activeSection === 'nfr' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Activity className="w-5 h-5" />
              <span>Escalabilidad Horizontal & Rendimiento</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <li>
                <strong>Contenedores en Kubernetes (EKS/GKE):</strong> Auto-escalado de pods (HPA) en función del uso de CPU y solicitudes HTTP por segundo.
              </li>
              <li>
                <strong>Caché L2 Distribuido (Redis):</strong> Almacenamiento en caché de pólizas vigentes e índices del IPC para evitar consultas recurrentes a la base de datos transaccional.
              </li>
              <li>
                <strong>Read-Replicas en PostgreSQL:</strong> Separación del tráfico de lectura del tablero de progreso mensual respecto a las escrituras de renovación.
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
              <Layers className="w-5 h-5" />
              <span>Logs, Trazabilidad & Observabilidad</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <li>
                <strong>OpenTelemetry & Distributed Tracing:</strong> Inyección de Correlation ID (TraceId) en el API Gateway que viaja a través de todos los microservicios y hasta WebLogic.
              </li>
              <li>
                <strong>Pila de Métricas:</strong> Micrometer en Spring Boot exportando métricas hacia Prometheus y visualización en dashboards Grafana.
              </li>
              <li>
                <strong>Centralización de Bitácora:</strong> Logs estructurados en JSON enviados a Grafana Loki o ElasticSearch para alertas automáticas ante fallos en WebLogic.
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>Tolerancia a Fallos & Resiliencia</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <li>
                <strong>Circuit Breaker (Resilience4j):</strong> Si la capa media WebLogic se degrada, el Circuit Breaker se abre para evitar saturación de hilos en Spring Boot.
              </li>
              <li>
                <strong>Patrón Transactional Outbox:</strong> Los eventos de cambio de póliza se guardan en la misma transacción ACID de la BD y un worker los despacha a Kafka con garantía At-Least-Once.
              </li>
              <li>
                <strong>Dead Letter Queue (DLQ):</strong> Transacciones fallidas al CORE se almacenan en una cola de reintento con alertas para el equipo de soporte.
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <GitBranch className="w-5 h-5" />
              <span>Versionamiento de APIs</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <li>
                <strong>Versionado por URI:</strong> Rutas canónicas como <code className="text-emerald-400 font-mono">/api/v1/polizas</code> para estabilidad de contratos.
              </li>
              <li>
                <strong>Backward Compatibility:</strong> Nuevos campos en payloads DTO son opcionales sin romper clientes antiguos ni contratos con WebLogic.
              </li>
              <li>
                <strong>Deprecation Headers:</strong> Uso de encabezados estándar HTTP <code className="text-amber-400 font-mono">Sunset</code> y <code className="text-amber-400 font-mono">Deprecation</code> para notificar a inmobiliarias sobre futuras migraciones.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

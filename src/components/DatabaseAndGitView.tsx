import React, { useState } from 'react';
import { 
  Database, 
  GitBranch, 
  Terminal, 
  Copy, 
  Check, 
  FileCode, 
  Play, 
  ShieldAlert, 
  Sparkles,
  GitCommit,
  GitPullRequest,
  CheckCircle2,
  Table
} from 'lucide-react';

export const DatabaseAndGitView: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sql' | 'git'>('sql');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const ddlScript = `-- ==========================================================
-- MÓDULO 3: DDL BASE DE DATOS - PLATAFORMA DE PÓLIZAS
-- Motor: PostgreSQL 15+ / Oracle Compatible
-- ==========================================================

-- 1. Tabla de Pólizas de Arrendamiento
CREATE TABLE polizas (
    id BIGSERIAL PRIMARY KEY,
    numero_poliza VARCHAR(50) NOT NULL UNIQUE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('INDIVIDUAL', 'COLECTIVA')),
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA' CHECK (estado IN ('ACTIVA', 'RENOVADA', 'CANCELADA')),
    tomador VARCHAR(150) NOT NULL,
    tomador_doc VARCHAR(50) NOT NULL,
    asegurado VARCHAR(150) NOT NULL,
    beneficiario VARCHAR(150) NOT NULL,
    vigencia_meses INTEGER NOT NULL DEFAULT 12 CHECK (vigencia_meses > 0),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    canon_mensual NUMERIC(14, 2) NOT NULL CHECK (canon_mensual > 0),
    prima_total NUMERIC(14, 2) NOT NULL CHECK (prima_total > 0),
    porcentaje_ipc_ultima_renovacion NUMERIC(5, 2) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_fechas_vigencia CHECK (fecha_fin >= fecha_inicio)
);

-- 2. Tabla de Inmuebles / Riesgos Amparados
CREATE TABLE riesgos (
    id BIGSERIAL PRIMARY KEY,
    poliza_id BIGINT NOT NULL,
    direccion VARCHAR(200) NOT NULL,
    ciudad VARCHAR(100) NOT NULL DEFAULT 'Bogotá D.C.',
    valor_canon NUMERIC(14, 2) NOT NULL CHECK (valor_canon > 0),
    descripcion_inmueble TEXT,
    arrendatario_nombre VARCHAR(150) NOT NULL,
    arrendatario_doc VARCHAR(50) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'CANCELADO')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_riesgos_poliza 
        FOREIGN KEY (poliza_id) 
        REFERENCES polizas (id) 
        ON DELETE RESTRICT
);

-- 3. Constraint de Regla de Negocio: Póliza Individual solo puede tener 1 riesgo activo
-- Implementado mediante índice único condicional en PostgreSQL:
CREATE UNIQUE INDEX idx_unico_riesgo_individual 
ON riesgos (poliza_id) 
WHERE (estado = 'ACTIVO') 
AND poliza_id IN (SELECT id FROM polizas WHERE tipo = 'INDIVIDUAL');

-- 4. Tabla de Auditoría de Envíos al CORE de Seguros (WebLogic)
CREATE TABLE core_mock_auditoria (
    id BIGSERIAL PRIMARY KEY,
    poliza_id BIGINT NOT NULL,
    evento VARCHAR(50) NOT NULL,
    payload_json JSONB NOT NULL,
    http_status INTEGER NOT NULL DEFAULT 200,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;

  const queryA = `-- ==========================================================
-- CONSULTA A: Pólizas que vencen en los próximos 30 días
-- Listar número, canon mensual y cantidad de riesgos asociados
-- ==========================================================
SELECT 
    p.id,
    p.numero_poliza,
    p.tipo,
    p.estado,
    p.tomador,
    p.canon_mensual,
    p.fecha_fin AS fecha_vencimiento,
    COUNT(r.id) FILTER (WHERE r.estado = 'ACTIVO') AS cantidad_riesgos_activos
FROM polizas p
LEFT JOIN riesgos r ON p.id = r.poliza_id
WHERE p.estado IN ('ACTIVA', 'RENOVADA')
  AND p.fecha_fin BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '30 days')
GROUP BY p.id, p.numero_poliza, p.tipo, p.estado, p.tomador, p.canon_mensual, p.fecha_fin
ORDER BY p.fecha_fin ASC;`;

  const queryB = `-- ==========================================================
-- CONSULTA B: Total acumulado de prima por tipo de póliza
-- Comparación INDIVIDUAL vs COLECTIVA en estado ACTIVA
-- ==========================================================
SELECT 
    p.tipo AS tipo_poliza,
    COUNT(p.id) AS total_polizas,
    SUM(p.canon_mensual) AS canon_mensual_acumulado,
    SUM(p.prima_total) AS prima_total_acumulada,
    ROUND(AVG(p.prima_total), 2) AS prima_promedio
FROM polizas p
WHERE p.estado = 'ACTIVA'
GROUP BY p.tipo
ORDER BY prima_total_acumulada DESC;`;

  const indexesScript = `-- ==========================================================
-- JUSTIFICACIÓN DE ÍNDICES PARA OPTIMIZACIÓN
-- ==========================================================

-- 1. Índice para Consulta A (Vencimientos en 30 días):
-- Evita Seq Scan al filtrar por rango de fechas y estado
CREATE INDEX idx_polizas_vencimiento_estado 
ON polizas (fecha_fin, estado) 
INCLUDE (numero_poliza, canon_mensual);

-- 2. Índice para la llave foránea de riesgos (JOIN de alta concurrencia):
CREATE INDEX idx_riesgos_poliza_id_estado 
ON riesgos (poliza_id, estado);

-- 3. Índice para Consulta B (Agrupación por tipo y filtro ACTIVA):
CREATE INDEX idx_polizas_tipo_estado 
ON polizas (tipo, estado) 
INCLUDE (canon_mensual, prima_total);

-- 4. Búsquedas rápidas por documento de tomador/arrendatario:
CREATE INDEX idx_polizas_tomador_doc ON polizas (tomador_doc);
CREATE INDEX idx_riesgos_arrendatario_doc ON riesgos (arrendatario_doc);`;

  return (
    <div className="space-y-6 pb-12 text-slate-100">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Módulos 3 & 4 • Persistencia SQL & Flujo Git
          </span>
          <span className="text-xs text-slate-400">DDL • Consultas de Negocio • GitFlow & Hotfixes</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Base de Datos Relacional & Estrategia Git
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Scripts DDL con constraints de integridad (canon positivo, fechas de vigencia, límite de riesgo individual), consultas SQL analíticas y directrices de branching y hotfixes en producción.
        </p>

        {/* Tab Switcher */}
        <div className="flex space-x-2 mt-6 pt-4 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${
              activeTab === 'sql'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Módulo 3: SQL, DDL & Optimización</span>
          </button>
          <button
            onClick={() => setActiveTab('git')}
            className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${
              activeTab === 'git'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>Módulo 4: Git, Hotfixes & Convenciones</span>
          </button>
        </div>
      </div>

      {/* SQL Tab Content */}
      {activeTab === 'sql' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* DDL Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Table className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold text-white">1. Script DDL de Creación de Tablas & Constraints</h2>
              </div>
              <button
                onClick={() => copyToClipboard(ddlScript, 'ddl')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
              >
                {copiedKey === 'ddl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'ddl' ? 'Copiado' : 'Copiar DDL'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
              {ddlScript}
            </pre>
          </div>

          {/* Queries Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Query A */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">Consulta A: Vencimientos a 30 Días</h3>
                  <p className="text-[11px] text-slate-400">Pólizas próximas a vencer con conteo de riesgos</p>
                </div>
                <button
                  onClick={() => copyToClipboard(queryA, 'qa')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                  title="Copiar SQL"
                >
                  {copiedKey === 'qa' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-teal-300 overflow-x-auto">
                {queryA}
              </pre>
            </div>

            {/* Query B */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">Consulta B: Total de Prima por Tipo</h3>
                  <p className="text-[11px] text-slate-400">Agrupación Individual vs Colectiva (Estado ACTIVA)</p>
                </div>
                <button
                  onClick={() => copyToClipboard(queryB, 'qb')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                  title="Copiar SQL"
                >
                  {copiedKey === 'qb' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto">
                {queryB}
              </pre>
            </div>
          </div>

          {/* Indexes & Justification */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>3. Estrategia de Índices & Plan de Ejecución (EXPLAIN ANALYZE)</span>
              </h2>
              <button
                onClick={() => copyToClipboard(indexesScript, 'idx')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
              >
                {copiedKey === 'idx' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'idx' ? 'Copiado' : 'Copiar Índices'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
              {indexesScript}
            </pre>
          </div>
        </div>
      )}

      {/* Git Tab Content */}
      {activeTab === 'git' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Branching Strategy */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <GitBranch className="w-5 h-5" />
              <h2 className="text-base font-bold text-white">1. Modelo de Branching Recomendado: GitFlow Adaptado</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Para una plataforma de seguros con auditoría financiera y despliegues controlados a ambientes certificados (Sandbox, Staging, Producción), se recomienda <strong>GitFlow Adaptado</strong>:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs pt-1">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="font-mono text-emerald-400 font-bold block mb-1">main (o master)</span>
                <span className="text-slate-400 text-[11px]">Código auditado actualmente corriendo en producción. Protegido, solo admite merges de releases o hotfixes.</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="font-mono text-blue-400 font-bold block mb-1">develop</span>
                <span className="text-slate-400 text-[11px]">Rama troncal de integración continua. Despliega automáticamente a ambiente de Pruebas / QA.</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="font-mono text-teal-400 font-bold block mb-1">feature/*</span>
                <span className="text-slate-400 text-[11px]">Ramas cortas (1-3 días) para historias de usuario específicas: <code className="text-slate-300">feature/ajuste-ipc</code>.</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="font-mono text-rose-400 font-bold block mb-1">hotfix/*</span>
                <span className="text-slate-400 text-[11px]">Ramas de emergencia nacidas directamente de <code className="text-slate-300">main</code> para incidentes P1.</span>
              </div>
            </div>
          </div>

          {/* Hotfix Step-by-Step */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <ShieldAlert className="w-5 h-5" />
              <h2 className="text-base font-bold text-white">2. Protocolo Paso a Paso para un Hotfix Crítico en Producción</h2>
            </div>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                <div>
                  <strong className="text-white block mb-1">Crear rama hotfix desde main:</strong>
                  <code className="text-teal-300 font-mono text-[11px] block bg-slate-900 p-1.5 rounded">
                    git checkout main && git pull origin main && git checkout -b hotfix/calculo-prima-colectiva-v1.0.1
                  </code>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                <div>
                  <strong className="text-white block mb-1">Corrección Quirúrgica y Pruebas Unitarias Automatizadas:</strong>
                  <p className="text-slate-400 text-[11px]">Se corrige el defecto, se añade el test de regresión en Spring Boot (<code className="text-slate-300">mvn test</code>) y se realiza commit con firma GPG.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                <div>
                  <strong className="text-white block mb-1">Merge a main con Tag semántico y despliegue:</strong>
                  <code className="text-teal-300 font-mono text-[11px] block bg-slate-900 p-1.5 rounded">
                    git checkout main && git merge --no-ff hotfix/calculo-prima-colectiva-v1.0.1 && git tag -a v1.0.1 -m "HOTFIX: correccion calculo prima" && git push origin main --tags
                  </code>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">4</span>
                <div>
                  <strong className="text-white block mb-1">Backport a develop y eliminación de la rama hotfix:</strong>
                  <code className="text-teal-300 font-mono text-[11px] block bg-slate-900 p-1.5 rounded">
                    git checkout develop && git merge --no-ff hotfix/calculo-prima-colectiva-v1.0.1 && git push origin develop && git branch -d hotfix/calculo-prima-colectiva-v1.0.1
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Conventional Commits & Team Rules */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <GitCommit className="w-5 h-5" />
              <h2 className="text-base font-bold text-white">3. Buenas Prácticas para un Equipo de 5 Desarrolladores</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <strong className="text-white block">Conventional Commits</strong>
                <p className="text-slate-400 text-[11px]">
                  Estandarización estricta de mensajes: <code className="text-emerald-400">feat(polizas): calculo de prima con IPC</code>, <code className="text-rose-400">fix(riesgos): bloqueo adicion en poliza individual</code>.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <strong className="text-white block">Branch Protection & Peer Review</strong>
                <p className="text-slate-400 text-[11px]">
                  Bloqueo de push directo a <code className="text-slate-300">main</code> y <code className="text-slate-300">develop</code>. Mínimo 1 aprobación (code review) obligatoria y pipeline de CI pasando en verde.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <strong className="text-white block">Squash & Merge en PRs</strong>
                <p className="text-slate-400 text-[11px]">
                  Mantiene el historial de la rama <code className="text-slate-300">develop</code> limpio y atómico, agrupando commits exploratorios ("wip", "typo") en un solo commit semántico verificable.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

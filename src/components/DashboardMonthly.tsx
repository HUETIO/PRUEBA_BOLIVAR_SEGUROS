import React, { useState } from 'react';
import { 
  TrendingUp, 
  Shield, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  ArrowUpRight, 
  Bell, 
  Clock, 
  FileText,
  Percent,
  Sparkles,
  Award,
  Code2,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Poliza, Reminder } from '../types';

interface DashboardMonthlyProps {
  polizas: Poliza[];
  reminders: Reminder[];
  metrics: any;
  onOpenRenewModal: (poliza: Poliza) => void;
  onOpenCreateReminder: (polizaId?: number) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardMonthly: React.FC<DashboardMonthlyProps> = ({
  polizas,
  reminders,
  metrics,
  onOpenRenewModal,
  onOpenCreateReminder,
  onNavigateTab,
}) => {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(4); // Default to Septiembre 2026

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCelebrateGoal = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const activePolizas = polizas.filter(p => p.estado === 'ACTIVA' || p.estado === 'RENOVADA');
  const proximasAVencer = polizas.filter(p => p.estado !== 'CANCELADA');
  const pendingReminders = reminders.filter(r => !r.completado);

  const history = metrics?.history || [];
  const currentMonthData = history[selectedMonthIndex] || history[history.length - 2];

  const metaRenovaciones = metrics?.metaMensualRenovaciones || 12;
  const renovacionesActuales = metrics?.renovacionesEsteMes || 3;
  const porcentajeMeta = Math.min(100, Math.round((renovacionesActuales / metaRenovaciones) * 100));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & KPI Summary */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/60 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Septiembre 2026 • Periodo Operativo
              </span>
              <span className="text-xs text-slate-400">IPC Vigente: +9.28%</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Progreso Mensual de Cartera de Arrendamiento
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Monitoreo en tiempo real de cánones asegurados, cumplimiento de metas de renovación con ajuste por IPC y programación de recordatorios preventivos.
            </p>
          </div>

          {/* Goal Achieved Widget */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 min-w-[260px] flex items-center justify-between shadow-inner">
            <div>
              <div className="text-xs text-slate-400 font-medium">Meta Renovaciones del Mes</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-emerald-400">{renovacionesActuales}</span>
                <span className="text-xs text-slate-400">/ {metaRenovaciones} pólizas ({porcentajeMeta}%)</span>
              </div>
              <div className="w-36 bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-700" 
                  style={{ width: `${porcentajeMeta}%` }}
                />
              </div>
            </div>
            <button
              onClick={handleCelebrateGoal}
              className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 transition hover:scale-105"
              title="Celebrar cumplimiento"
            >
              <Award className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 4 Main KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 transition hover:border-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Canon Mensual Asegurado</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-2">
              {formatCOP(metrics?.canonTotalActivo || 31000000)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+14.5% vs mes anterior</span>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 transition hover:border-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Primas Anualizadas</span>
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-2">
              {formatCOP(metrics?.primasTotalesActivas || 372000000)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
              <span>Canon × Vigencia (12 meses)</span>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 transition hover:border-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Pólizas en Cartera</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-2">
              {activePolizas.length} <span className="text-xs font-normal text-slate-400">activas</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
              <span className="text-blue-300 font-medium">{metrics?.colectivasCount || 2} Colectivas</span>
              <span>•</span>
              <span className="text-indigo-300 font-medium">{metrics?.individualesCount || 3} Individuales</span>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 transition hover:border-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Inmuebles & Riesgos</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-2">
              {metrics?.totalRiesgosActivos || 8} <span className="text-xs font-normal text-slate-400">riesgos</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-300">
              <span>100% amparados ante siniestro</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Monthly Progress Chart & Reminders Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Progress Timeline & Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm text-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span>Evolución Mensual: Renovaciones & Recaudo</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Comparativa de cánones totales y metas de renovación ejecutadas
              </p>
            </div>
            {/* Month Selector Pills */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs overflow-x-auto">
              {history.map((h: any, idx: number) => (
                <button
                  key={h.mes}
                  onClick={() => setSelectedMonthIndex(idx)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    selectedMonthIndex === idx
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {h.mesCorto}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Chart Visualizer */}
          <div className="space-y-4">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                <span className="font-semibold text-slate-300">Mes: {currentMonthData?.mes}</span>
                <span className="flex items-center gap-1 text-emerald-400 font-mono">
                  <Percent className="w-3.5 h-3.5" /> Reajuste IPC: +{currentMonthData?.ipcPromedio}%
                </span>
              </div>

              {/* Bar comparison */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Renovaciones Realizadas</span>
                    <span className="font-bold text-emerald-400">
                      {currentMonthData?.renovacionesRealizadas} / {currentMonthData?.renovacionesMeta}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${Math.min(100, (currentMonthData?.renovacionesRealizadas / Math.max(1, currentMonthData?.renovacionesMeta)) * 100)}%` 
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Recaudo Estimado Canon Mensual</span>
                    <span className="font-bold text-teal-400">{formatCOP(currentMonthData?.canonTotal || 0)}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-teal-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, ((currentMonthData?.canonTotal || 0) / 60000000) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Historical Month-by-Month Bento Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {history.map((item: any, i: number) => {
                const isSelected = i === selectedMonthIndex;
                const isCompleted = item.renovacionesRealizadas >= item.renovacionesMeta;
                return (
                  <div
                    key={item.mes}
                    onClick={() => setSelectedMonthIndex(i)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/50'
                        : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{item.mesCorto}</span>
                      {isCompleted ? (
                        <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800">
                          Cumplida
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                          {item.renovacionesRealizadas}/{item.renovacionesMeta}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-slate-200 mt-2">
                      {formatCOP(item.canonTotal)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {item.polizasActivas} pólizas activas
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Set Reminders & Next Due Policies */}
        <div className="space-y-6">
          {/* Quick Reminders Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm text-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm">Recordatorios Pendientes</h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {pendingReminders.length} activos
              </span>
            </div>

            {pendingReminders.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                <CheckCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                No tienes recordatorios pendientes para este mes.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {pendingReminders.slice(0, 4).map((rem) => (
                  <div
                    key={rem.id}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition text-xs"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-slate-200 line-clamp-1">{rem.titulo}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        rem.prioridad === 'ALTA' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        rem.prioridad === 'MEDIA' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {rem.prioridad}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1.5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>Límite: {rem.fechaLimite}</span>
                      <span>•</span>
                      <span className="text-teal-400 font-medium">{rem.canal}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
              <button
                onClick={() => onOpenCreateReminder()}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow transition active:scale-95 text-center"
              >
                + Nuevo Recordatorio
              </button>
              <button
                onClick={() => onNavigateTab('reminders')}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
              >
                Ver Todos
              </button>
            </div>
          </div>

          {/* Quick Renovar Póliza Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm text-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-white text-sm">Próximas a Renovar</h3>
              </div>
              <button
                onClick={() => onNavigateTab('polizas')}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Ver pólizas</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {proximasAVencer.slice(0, 3).map((p) => (
                <div 
                  key={p.id}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-xs text-white truncate">{p.numeroPoliza}</div>
                    <div className="text-[11px] text-slate-400 truncate">{p.tomador}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Vence: <span className="text-slate-300">{p.fechaFin}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenRenewModal(p)}
                    className="px-2.5 py-1.5 bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 rounded-lg text-xs font-medium whitespace-nowrap transition"
                  >
                    Renovar +IPC
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Distinction Banner: Operational vs Instructions & Dedicated Endpoints Guide */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">
                Sección Exclusiva de Integración
              </span>
              <span className="text-xs text-slate-400">REST API & Contratos</span>
            </div>
            <h4 className="text-sm font-bold text-white mt-0.5">¿Cómo consumir datos a través de los endpoints?</h4>
            <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
              Ubicada al final del proyecto: consulta la especificación interactiva, cabeceras requeridas (<code className="text-emerald-400">x-api-key: 123456</code>), ejemplos en cURL, JavaScript, Spring Boot, Python y consola de pruebas en vivo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => onNavigateTab('endpoints')}
            className="w-full sm:w-auto px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Code2 className="w-4 h-4" />
            <span>Ver Guía de Endpoints</span>
          </button>
          <button
            onClick={() => onNavigateTab('systemdesign')}
            className="w-full sm:w-auto px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Instrucciones</span>
          </button>
        </div>
      </div>
    </div>
  );
};

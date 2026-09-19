import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Shield, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Home, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Poliza, TipoPoliza, EstadoPoliza } from '../types';

interface PolicyManagerProps {
  polizas: Poliza[];
  onOpenCreatePolicy: () => void;
  onOpenRiskModal: (poliza: Poliza) => void;
  onOpenRenewModal: (poliza: Poliza) => void;
  onCancelPolicy: (poliza: Poliza) => void;
  onRefresh: () => void;
}

export const PolicyManager: React.FC<PolicyManagerProps> = ({
  polizas,
  onOpenCreatePolicy,
  onOpenRiskModal,
  onOpenRenewModal,
  onCancelPolicy,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<string>('ALL');
  const [selectedEstado, setSelectedEstado] = useState<string>('ALL');

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredPolizas = polizas.filter((p) => {
    const matchSearch =
      p.numeroPoliza.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tomador.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.asegurado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.beneficiario.toLowerCase().includes(searchTerm.toLowerCase());

    const matchTipo = selectedTipo === 'ALL' || p.tipo === selectedTipo;
    const matchEstado = selectedEstado === 'ALL' || p.estado === selectedEstado;

    return matchSearch && matchTipo && matchEstado;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Context */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Módulo 2 • Spring Boot Endpoints
              </span>
              <span className="text-xs text-slate-400">Header: x-api-key: 123456</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Gestión de Pólizas de Arrendamiento
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              Administración del ciclo de vida contractual. Soporte estricto de reglas de negocio: pólizas individuales (1 riesgo fijo), colectivas (1..N riesgos con ajuste dinámico de canon), renovación con incremento IPC y cascada de cancelación hacia riesgos y capa media WebLogic.
            </p>
          </div>
          <button
            onClick={onOpenCreatePolicy}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir Nueva Póliza</span>
          </button>
        </div>

        {/* Filter Controls (GET /polizas?tipo=...&estado=...) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por póliza, tomador, beneficiario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Filter by Tipo */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Tipo:</span>
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="flex-1 bg-slate-950/60 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Todos los Tipos</option>
              <option value="INDIVIDUAL">INDIVIDUAL (1 Riesgo)</option>
              <option value="COLECTIVA">COLECTIVA (Múltiples Riesgos)</option>
            </select>
          </div>

          {/* Filter by Estado */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Estado:</span>
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="flex-1 bg-slate-950/60 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="ACTIVA">ACTIVA</option>
              <option value="RENOVADA">RENOVADA (+IPC)</option>
              <option value="CANCELADA">CANCELADA</option>
            </select>
          </div>
        </div>
      </div>

      {/* Policies List Table / Cards */}
      {filteredPolizas.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No se encontraron pólizas</h3>
          <p className="text-xs text-slate-500">Prueba cambiando los criterios de filtro o emite una nueva póliza.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPolizas.map((poliza) => {
            const isIndividual = poliza.tipo === 'INDIVIDUAL';
            const isCancelada = poliza.estado === 'CANCELADA';
            const isRenovada = poliza.estado === 'RENOVADA';
            const riesgosActivosCount = (poliza.riesgos || []).filter(r => r.estado === 'ACTIVO').length;

            return (
              <div
                key={poliza.id}
                className={`bg-slate-900 border rounded-2xl p-5 shadow-sm transition hover:border-slate-700 text-slate-200 ${
                  isCancelada
                    ? 'border-slate-800/80 opacity-70 bg-slate-950/40'
                    : isRenovada
                    ? 'border-emerald-800/60 shadow-emerald-950/20'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${
                      isCancelada ? 'bg-slate-800 text-slate-500' :
                      isIndividual ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                      'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                    }`}>
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-base tracking-tight">{poliza.numeroPoliza}</span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          isIndividual 
                            ? 'bg-indigo-950/70 text-indigo-300 border-indigo-800/60'
                            : 'bg-teal-950/70 text-teal-300 border-teal-800/60'
                        }`}>
                          {poliza.tipo}
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          poliza.estado === 'ACTIVA' ? 'bg-blue-950/70 text-blue-300 border-blue-800/60' :
                          poliza.estado === 'RENOVADA' ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60' :
                          'bg-rose-950/70 text-rose-300 border-rose-800/60'
                        }`}>
                          {poliza.estado}
                        </span>
                        {poliza.porcentajeIpcUltimaRenovacion && (
                          <span className="text-[10px] bg-emerald-900/40 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700/50">
                            Ajuste IPC +{poliza.porcentajeIpcUltimaRenovacion}%
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span><strong>Tomador:</strong> {poliza.tomador} ({poliza.tomadorDoc})</span>
                        <span><strong>Asegurado:</strong> {poliza.asegurado}</span>
                        <span><strong>Beneficiario:</strong> {poliza.beneficiario}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Price Summary */}
                  <div className="flex items-center gap-6 self-start lg:self-center">
                    <div>
                      <div className="text-[11px] text-slate-400">Canon Mensual</div>
                      <div className="text-base font-bold text-white">{formatCOP(poliza.canonMensual)}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400">Prima Total ({poliza.vigenciaMeses}m)</div>
                      <div className="text-base font-bold text-emerald-400">{formatCOP(poliza.primaTotal)}</div>
                    </div>
                  </div>
                </div>

                {/* Bottom details & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 text-xs">
                  <div className="flex items-center gap-4 text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Vigencia: {poliza.fechaInicio} al <strong className="text-slate-200">{poliza.fechaFin}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Home className="w-3.5 h-3.5 text-slate-500" />
                      Riesgos asociados: <strong className="text-white font-mono">{riesgosActivosCount} activos</strong>
                      {isIndividual && <span className="text-[10px] text-slate-500">(Máx 1)</span>}
                    </span>
                  </div>

                  {/* Actions according to requirements:
                      1. GET /polizas/{id}/riesgos
                      2. POST /polizas/{id}/renovar (incrementa canon y prima +IPC, estado a RENOVADA)
                      3. POST /polizas/{id}/cancelar (cancela póliza y todos sus riesgos)
                      4. POST /polizas/{id}/riesgos (solo colectiva)
                  */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Ver Riesgos */}
                    <button
                      onClick={() => onOpenRiskModal(poliza)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-medium transition flex items-center gap-1.5"
                    >
                      <span>Ver Riesgos ({poliza.riesgos?.length || 0})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Renovar Póliza */}
                    {!isCancelada && (
                      <button
                        onClick={() => onOpenRenewModal(poliza)}
                        className="px-3 py-1.5 bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 rounded-xl font-semibold transition flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Renovar (+IPC)</span>
                      </button>
                    )}

                    {/* Cancelar Póliza */}
                    {!isCancelada && (
                      <button
                        onClick={() => onCancelPolicy(poliza)}
                        className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-800/60 rounded-xl font-medium transition flex items-center gap-1.5"
                        title="Cancela la póliza y todos sus riesgos asociados"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancelar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

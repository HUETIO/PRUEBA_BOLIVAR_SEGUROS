import React, { useState } from 'react';
import { 
  X, 
  Home, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  MapPin, 
  User, 
  Info,
  Server
} from 'lucide-react';
import { Poliza, Riesgo } from '../types';

interface RiskModalProps {
  poliza: Poliza | null;
  onClose: () => void;
  onAddRiesgo: (polizaId: number, data: any) => Promise<void>;
  onCancelRiesgo: (riesgoId: number) => Promise<void>;
  isLoading: boolean;
}

export const RiskModal: React.FC<RiskModalProps> = ({
  poliza,
  onClose,
  onAddRiesgo,
  onCancelRiesgo,
  isLoading,
}) => {
  if (!poliza) return null;

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    direccion: '',
    ciudad: 'Bogotá D.C.',
    valorCanon: '',
    descripcionInmueble: '',
    arrendatarioNombre: '',
    arrendatarioDoc: '',
  });
  const [errorMsg, setErrorMsg] = useState('');

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const isIndividual = poliza.tipo === 'INDIVIDUAL';
  const isCancelada = poliza.estado === 'CANCELADA';
  const riesgos = poliza.riesgos || [];
  const riesgosActivos = riesgos.filter((r) => r.estado === 'ACTIVO');

  // Business rule check:
  // Individual policies can only have 1 active risk
  const cannotAddRisk =
    isCancelada || (isIndividual && riesgosActivos.length >= 1);

  const handleSubmitNewRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (cannotAddRisk) {
      setErrorMsg(
        'Regla de negocio: Una póliza individual solo puede tener 1 riesgo. Para amparar múltiples inmuebles utilice una Póliza Colectiva.'
      );
      return;
    }

    if (!formData.direccion || !formData.arrendatarioNombre || !formData.valorCanon) {
      setErrorMsg('Por favor diligencie la dirección, arrendatario y canon mensual');
      return;
    }

    try {
      await onAddRiesgo(poliza.id, {
        direccion: formData.direccion,
        ciudad: formData.ciudad,
        valorCanon: parseFloat(formData.valorCanon),
        descripcionInmueble: formData.descripcionInmueble || 'Inmueble Residencial',
        arrendatarioNombre: formData.arrendatarioNombre,
        arrendatarioDoc: formData.arrendatarioDoc || 'CC 00000000',
      });
      setShowAddForm(false);
      setFormData({
        direccion: '',
        ciudad: 'Bogotá D.C.',
        valorCanon: '',
        descripcionInmueble: '',
        arrendatarioNombre: '',
        arrendatarioDoc: '',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al agregar riesgo');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl text-slate-100 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Riesgos Asegurados en {poliza.numeroPoliza}
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isIndividual ? 'bg-indigo-950 text-indigo-300 border-indigo-800' : 'bg-teal-950 text-teal-300 border-teal-800'
                }`}>
                  {poliza.tipo}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isIndividual
                  ? 'Póliza Individual: Tomador/Asegurado = Arrendatario (Límite contractual: 1 riesgo)'
                  : 'Póliza Colectiva: Inmobiliarias/Adms (Permite 1 a N riesgos con ajuste de canon acumulado)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Banner on Business Rules & WebLogic integration */}
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800 text-xs flex items-center justify-between flex-wrap gap-2 text-slate-400">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Capa media WebLogic: Toda adición o cancelación de riesgos despacha <code className="text-emerald-400 font-mono">POST /core-mock/evento</code>.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-semibold">{riesgosActivos.length} activos</span>
            {isIndividual && <span className="text-amber-400">(Máximo permitido: 1)</span>}
          </div>
        </div>

        {/* Body content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-950/70 border border-rose-800 rounded-xl text-xs text-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Add Risk Button & Rule Enforcement Message */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Inventario de Inmuebles ({riesgos.length})
            </h3>

            {!showAddForm && (
              <button
                onClick={() => {
                  if (cannotAddRisk) {
                    setErrorMsg(
                      isCancelada
                        ? 'No se pueden agregar riesgos a una póliza CANCELADA.'
                        : 'Regla de negocio: Una póliza individual solo puede tener 1 riesgo. Use una póliza colectiva para agregar más riesgos.'
                    );
                    return;
                  }
                  setShowAddForm(true);
                  setErrorMsg('');
                }}
                disabled={cannotAddRisk}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  cannotAddRisk
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Nuevo Riesgo</span>
              </button>
            )}
          </div>

          {/* Form to Add Risk */}
          {showAddForm && (
            <form
              onSubmit={handleSubmitNewRisk}
              className="bg-slate-950/80 border border-emerald-500/40 rounded-xl p-4 space-y-3 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Agregar Riesgo a Póliza Colectiva
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Dirección del Inmueble *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Calle 85 # 11-53 Apto 301"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Canon Mensual ($ COP) *</label>
                  <input
                    type="number"
                    required
                    min="100000"
                    placeholder="Ej: 2500000"
                    value={formData.valorCanon}
                    onChange={(e) => setFormData({ ...formData, valorCanon: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Nombre Arrendatario *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Carolina Méndez"
                    value={formData.arrendatarioNombre}
                    onChange={(e) => setFormData({ ...formData, arrendatarioNombre: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Documento Arrendatario</label>
                  <input
                    type="text"
                    placeholder="Ej: CC 1025478963"
                    value={formData.arrendatarioDoc}
                    onChange={(e) => setFormData({ ...formData, arrendatarioDoc: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Descripción del Inmueble</label>
                  <input
                    type="text"
                    placeholder="Ej: Apto 3 alcobas, vista exterior"
                    value={formData.descripcionInmueble}
                    onChange={(e) => setFormData({ ...formData, descripcionInmueble: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow flex items-center gap-1"
                >
                  <span>Guardar y Sincronizar CORE</span>
                </button>
              </div>
            </form>
          )}

          {/* Risks list */}
          {riesgos.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
              No hay riesgos registrados en esta póliza actualmente.
            </div>
          ) : (
            <div className="space-y-3">
              {riesgos.map((r) => {
                const isActivo = r.estado === 'ACTIVO';
                return (
                  <div
                    key={r.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition ${
                      isActivo
                        ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/30 border-slate-900 opacity-60'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{r.direccion}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          isActivo ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {r.estado}
                        </span>
                      </div>
                      <div className="text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" /> {r.ciudad}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-500" /> Arrendatario: <strong>{r.arrendatarioNombre}</strong> ({r.arrendatarioDoc})
                        </span>
                      </div>
                      {r.descripcionInmueble && (
                        <p className="text-[11px] text-slate-500">{r.descripcionInmueble}</p>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Canon Mensual</span>
                        <span className="text-sm font-bold text-emerald-400">{formatCOP(r.valorCanon)}</span>
                      </div>

                      {isActivo && !isCancelada && (
                        <button
                          onClick={() => onCancelRiesgo(r.id)}
                          className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-lg text-[11px] font-medium transition"
                          title="POST /riesgos/{id}/cancelar"
                        >
                          Cancelar Riesgo
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 rounded-b-2xl flex justify-between items-center text-xs text-slate-400">
          <span>Póliza ID: {poliza.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

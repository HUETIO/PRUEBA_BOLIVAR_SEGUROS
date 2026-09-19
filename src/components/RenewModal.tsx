import React, { useState } from 'react';
import { 
  X, 
  RefreshCw, 
  Percent, 
  DollarSign, 
  Calendar, 
  AlertTriangle, 
  ArrowRight,
  Server,
  CheckCircle2
} from 'lucide-react';
import { Poliza } from '../types';

interface RenewModalProps {
  poliza: Poliza | null;
  onClose: () => void;
  onRenew: (polizaId: number, porcentajeIpc: number) => Promise<void>;
  isLoading: boolean;
}

export const RenewModal: React.FC<RenewModalProps> = ({
  poliza,
  onClose,
  onRenew,
  isLoading,
}) => {
  if (!poliza) return null;

  const [porcentajeIpc, setPorcentajeIpc] = useState<number>(9.28); // Default Colombia IPC
  const [errorMsg, setErrorMsg] = useState('');

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const isCancelada = poliza.estado === 'CANCELADA';

  const canonActual = poliza.canonMensual;
  const primaActual = poliza.primaTotal;

  const factor = 1 + porcentajeIpc / 100;
  const nuevoCanon = Math.round(canonActual * factor);
  const nuevaPrima = Math.round(nuevoCanon * poliza.vigenciaMeses);

  const diferenciaCanon = nuevoCanon - canonActual;
  const diferenciaPrima = nuevaPrima - primaActual;

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isCancelada) {
      setErrorMsg('Regla de negocio: No se puede renovar una póliza que se encuentra CANCELADA.');
      return;
    }

    if (porcentajeIpc < 0) {
      setErrorMsg('El porcentaje de incremento del IPC no puede ser negativo.');
      return;
    }

    try {
      await onRenew(poliza.id, porcentajeIpc);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al renovar la póliza');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Renovación de Póliza con Ajuste IPC</h2>
              <p className="text-xs text-slate-400">
                Póliza: <strong className="text-slate-200">{poliza.numeroPoliza}</strong> ({poliza.tipo})
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

        {/* Form Body */}
        <form onSubmit={handleRenewSubmit} className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-950/70 border border-rose-800 rounded-xl text-xs text-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isCancelada && (
            <div className="p-3 bg-amber-950/60 border border-amber-800 rounded-xl text-amber-200 text-xs">
              ⚠️ Esta póliza está en estado <strong>CANCELADA</strong>. La regla de negocio estipula que una póliza cancelada no puede ser renovada.
            </div>
          )}

          {/* IPC Rate Setting */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-emerald-400" />
                <span>Porcentaje de Ajuste IPC (%) *</span>
              </label>
              <span className="text-[11px] text-emerald-400 font-mono">DANE Colombia</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                max="50"
                required
                disabled={isCancelada}
                value={porcentajeIpc}
                onChange={(e) => setPorcentajeIpc(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-bold text-sm focus:outline-none focus:border-teal-500"
              />
              <div className="flex gap-1">
                {[5.0, 9.28, 13.12].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setPorcentajeIpc(preset)}
                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition ${
                      porcentajeIpc === preset
                        ? 'bg-teal-600 text-white border-teal-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    +{preset}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mathematical Comparison: Before vs After IPC */}
          <div className="space-y-2">
            <div className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
              Simulación de Ajuste Contractual (Canon & Prima)
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Canon */}
              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
                <div className="text-slate-400 text-[10px]">Canon Mensual Actual</div>
                <div className="text-sm font-semibold text-slate-300">{formatCOP(canonActual)}</div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-2 font-bold">
                  <ArrowRight className="w-3 h-3" />
                  <span>{formatCOP(nuevoCanon)}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  (+{formatCOP(diferenciaCanon)})
                </div>
              </div>

              {/* Prima */}
              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
                <div className="text-slate-400 text-[10px]">Prima Total ({poliza.vigenciaMeses}m)</div>
                <div className="text-sm font-semibold text-slate-300">{formatCOP(primaActual)}</div>
                <div className="flex items-center gap-1 text-[11px] text-teal-400 mt-2 font-bold">
                  <ArrowRight className="w-3 h-3" />
                  <span>{formatCOP(nuevaPrima)}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  (+{formatCOP(diferenciaPrima)})
                </div>
              </div>
            </div>
          </div>

          {/* Extension of period */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">Extensión de vigencia:</span>
            </div>
            <span className="font-bold text-white">
              +{poliza.vigenciaMeses} meses adicionados
            </span>
          </div>

          {/* Weblogic Dispatch notice */}
          <div className="p-2.5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl flex items-center gap-2 text-[11px] text-emerald-300">
            <Server className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Al confirmar, el estado pasará a <strong>RENOVADA</strong> y se despachará evento a WebLogic CORE.</span>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || isCancelada}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow flex items-center gap-2 transition active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{isLoading ? 'Renovando...' : 'Aplicar Renovación +IPC'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

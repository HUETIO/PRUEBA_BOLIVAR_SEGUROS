import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Info, 
  DollarSign, 
  Calendar, 
  Building, 
  User, 
  MapPin, 
  AlertCircle 
} from 'lucide-react';
import { TipoPoliza } from '../types';

interface CreatePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export const CreatePolicyModal: React.FC<CreatePolicyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  if (!isOpen) return null;

  const [tipo, setTipo] = useState<TipoPoliza>('INDIVIDUAL');
  const [numeroPoliza, setNumeroPoliza] = useState(
    `POL-${tipo === 'INDIVIDUAL' ? 'IND' : 'COL'}-2026-${Math.floor(100 + Math.random() * 900)}`
  );
  const [tomador, setTomador] = useState('');
  const [tomadorDoc, setTomadorDoc] = useState('');
  const [asegurado, setAsegurado] = useState('');
  const [beneficiario, setBeneficiario] = useState('');
  const [vigenciaMeses, setVigenciaMeses] = useState(12);
  const [fechaInicio, setFechaInicio] = useState('2026-09-01');
  const [canonMensual, setCanonMensual] = useState('2500000');
  
  // Riesgo inicial
  const [direccionRiesgo, setDireccionRiesgo] = useState('Calle 90 # 14-26 Apto 502');
  const [ciudadRiesgo, setCiudadRiesgo] = useState('Bogotá D.C.');
  const [descripcionInmueble, setDescripcionInmueble] = useState('Apartamento residencial 3 habitaciones');
  
  const [errorMsg, setErrorMsg] = useState('');

  const canon = parseFloat(canonMensual) || 0;
  const primaTotal = canon * vigenciaMeses;

  const handleTipoChange = (newTipo: TipoPoliza) => {
    setTipo(newTipo);
    setNumeroPoliza(`POL-${newTipo === 'INDIVIDUAL' ? 'IND' : 'COL'}-2026-${Math.floor(100 + Math.random() * 900)}`);
    if (newTipo === 'INDIVIDUAL') {
      if (tomador) setAsegurado(tomador);
    }
  };

  const handleTomadorChange = (val: string) => {
    setTomador(val);
    if (tipo === 'INDIVIDUAL') {
      setAsegurado(val); // In individual policies, tomador and asegurado is the tenant
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!tomador || !beneficiario || !canonMensual) {
      setErrorMsg('Diligencie todos los campos requeridos');
      return;
    }

    try {
      await onSubmit({
        numeroPoliza,
        tipo,
        tomador,
        tomadorDoc,
        asegurado: tipo === 'INDIVIDUAL' ? tomador : asegurado,
        beneficiario,
        vigenciaMeses,
        fechaInicio,
        canonMensual: canon,
        direccionRiesgoInicial: direccionRiesgo,
        ciudadRiesgoInicial: ciudadRiesgo,
        descripcionInmuebleInicial: descripcionInmueble,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al emitir póliza');
    }
  };

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl text-slate-100 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Emitir Nueva Póliza de Arrendamiento</h2>
              <p className="text-xs text-slate-400">
                Cálculo automático de prima (Canon × Vigencia) y registro en el CORE
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
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-950/70 border border-rose-800 rounded-xl text-xs text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tipo de Póliza selector */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-semibold">Tipo de Póliza *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTipoChange('INDIVIDUAL')}
                className={`p-3 rounded-xl border text-left transition ${
                  tipo === 'INDIVIDUAL'
                    ? 'bg-emerald-950/50 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/50'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                }`}
              >
                <div className="font-bold text-sm text-slate-200">INDIVIDUAL</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Tomador = Arrendatario. Límite: 1 riesgo único.
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTipoChange('COLECTIVA')}
                className={`p-3 rounded-xl border text-left transition ${
                  tipo === 'COLECTIVA'
                    ? 'bg-teal-950/50 border-teal-500 text-white shadow-sm ring-1 ring-teal-500/50'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                }`}
              >
                <div className="font-bold text-sm text-slate-200">COLECTIVA</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Inmobiliarias / Copropiedades. Múltiples riesgos.
                </div>
              </button>
            </div>
          </div>

          {/* Core Contract Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Número de Póliza *</label>
              <input
                type="text"
                required
                value={numeroPoliza}
                onChange={(e) => setNumeroPoliza(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Fecha de Inicio *</label>
              <input
                type="date"
                required
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">
                {tipo === 'INDIVIDUAL' ? 'Tomador y Asegurado (Arrendatario) *' : 'Tomador (Inmobiliaria / Adm.) *'}
              </label>
              <input
                type="text"
                required
                placeholder={tipo === 'INDIVIDUAL' ? 'Ej: Juan Carlos Pérez' : 'Ej: Inmobiliaria Metropolitana'}
                value={tomador}
                onChange={(e) => handleTomadorChange(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Documento del Tomador (CC / NIT) *</label>
              <input
                type="text"
                required
                placeholder="Ej: CC 102589632 / NIT 900123456"
                value={tomadorDoc}
                onChange={(e) => setTomadorDoc(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {tipo === 'COLECTIVA' && (
              <div className="sm:col-span-2">
                <label className="block text-slate-300 mb-1">Asegurados (Descripción del Colectivo) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Colectivo de arrendatarios Edificio Torres del Parque"
                  value={asegurado}
                  onChange={(e) => setAsegurado(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block text-slate-300 mb-1">Beneficiario (Arrendador / Propietario) *</label>
              <input
                type="text"
                required
                placeholder="Ej: Inversiones Los Rosales S.A.S. / Pedro Gómez"
                value={beneficiario}
                onChange={(e) => setBeneficiario(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Canon Mensual ($ COP) *</label>
              <input
                type="number"
                required
                min="100000"
                value={canonMensual}
                onChange={(e) => setCanonMensual(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Vigencia en Meses *</label>
              <select
                value={vigenciaMeses}
                onChange={(e) => setVigenciaMeses(parseInt(e.target.value))}
                className="w-full bg-slate-950/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value={6}>6 Meses</option>
                <option value={12}>12 Meses (Estándar)</option>
                <option value={24}>24 Meses</option>
                <option value={36}>36 Meses</option>
              </select>
            </div>
          </div>

          {/* Auto-computed Prima Banner */}
          <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-xl p-3 flex items-center justify-between text-xs">
            <div>
              <span className="text-emerald-300 font-semibold block">Cálculo Contractual de Prima:</span>
              <span className="text-slate-400 text-[11px]">
                Valor Canon (${formatCOP(canon)}) × {vigenciaMeses} meses de vigencia
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Prima Total Póliza</span>
              <span className="text-base font-bold text-emerald-400">{formatCOP(primaTotal)}</span>
            </div>
          </div>

          {/* Riesgo Inicial */}
          <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl space-y-2">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>Inmueble / Riesgo Inicial</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Dirección del inmueble"
                value={direccionRiesgo}
                onChange={(e) => setDireccionRiesgo(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100"
              />
              <input
                type="text"
                placeholder="Ciudad"
                value={ciudadRiesgo}
                onChange={(e) => setCiudadRiesgo(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100"
              />
            </div>
          </div>

          {/* Footer Submit */}
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
              disabled={isLoading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow flex items-center gap-2 active:scale-95 transition"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isLoading ? 'Emitiendo...' : 'Emitir Póliza y Notificar CORE'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

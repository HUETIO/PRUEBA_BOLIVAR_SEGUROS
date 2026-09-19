import React, { useState } from 'react';
import { 
  Server, 
  Send, 
  Terminal, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  RefreshCw, 
  Activity, 
  Code,
  ArrowRight
} from 'lucide-react';
import { CoreMockLog, Poliza } from '../types';

interface CoreMockConsoleProps {
  logs: CoreMockLog[];
  polizas: Poliza[];
  onDispatchEvent: (evento: string, polizaId: number) => Promise<void>;
  onRefresh: () => void;
  isLoading: boolean;
}

export const CoreMockConsole: React.FC<CoreMockConsoleProps> = ({
  logs,
  polizas,
  onDispatchEvent,
  onRefresh,
  isLoading,
}) => {
  const [selectedPolizaId, setSelectedPolizaId] = useState<number>(
    polizas.length > 0 ? polizas[0].id : 555
  );
  const [eventoName, setEventoName] = useState('ACTUALIZACION');
  const [testResult, setTestResult] = useState<any | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleTestSend = async () => {
    setIsSending(true);
    setTestResult(null);
    try {
      await onDispatchEvent(eventoName, selectedPolizaId);
      setTestResult({
        success: true,
        message: `POST /core-mock/evento enviado con éxito para póliza ID: ${selectedPolizaId}`,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Fallo al invocar mock CORE',
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Mock Externo Obligatorio • Capa Media WebLogic
              </span>
              <span className="text-xs text-slate-400">Endpoint: POST /core-mock/evento</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Consola de Integración CORE Transaccional
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              Simulador del servicio agnóstico de edición disponibilizado a través de capa media en Oracle WebLogic. Registra en bitácora cada modificación de estado sobre pólizas y riesgos asegurando trazabilidad con el CORE asegurador.
            </p>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-400' : ''}`} />
            <span>Refrescar Bitácora</span>
          </button>
        </div>

        {/* Diagnostic Status Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Servicio WebLogic:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE (200 OK)
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Autenticación Requerida:</span>
            <span className="font-mono text-teal-300 font-semibold">x-api-key: 123456</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Eventos Registrados:</span>
            <span className="text-white font-bold font-mono">{logs.length} eventos</span>
          </div>
        </div>
      </div>

      {/* Interactive Testing Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Dispatcher Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-200">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-white text-sm">Disparador de Prueba Manual</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Nombre del Evento (default: ACTUALIZACION)</label>
              <input
                type="text"
                value={eventoName}
                onChange={(e) => setEventoName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Póliza ID</label>
              <select
                value={selectedPolizaId}
                onChange={(e) => setSelectedPolizaId(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500"
              >
                {polizas.map((p) => (
                  <option key={p.id} value={p.id}>
                    Póliza #{p.id} - {p.numeroPoliza} ({p.tipo})
                  </option>
                ))}
                <option value={555}>555 (ID de prueba del ejercicio)</option>
              </select>
            </div>

            {/* JSON preview */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300">
              <span className="text-slate-500">// Payload exacto enviado:</span>
              <pre className="mt-1 text-teal-300">
{`{
  "evento": "${eventoName}",
  "polizaId": ${selectedPolizaId}
}`}
              </pre>
            </div>

            <button
              onClick={handleTestSend}
              disabled={isSending}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow active:scale-95 transition"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? 'Enviando...' : 'Despachar a POST /core-mock/evento'}</span>
            </button>

            {testResult && (
              <div
                className={`p-3 rounded-xl border text-[11px] ${
                  testResult.success
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-800 text-rose-300'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Respuesta HTTP 200 ({testResult.timestamp})</span>
                </div>
                <div className="mt-1">{testResult.message}</div>
              </div>
            )}
          </div>
        </div>

        {/* Right 2 cols: Live Audit Stream */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-200">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-400" />
              <h2 className="font-bold text-white text-sm">Bitácora de Eventos Recibidos en WebLogic</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">{logs.length} registros</span>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Aún no se han registrado eventos hacia el CORE de seguros. Realiza renovaciones, cancelaciones o adición de riesgos para disparar sincronizaciones.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition text-xs space-y-2"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        {log.evento}
                      </span>
                      <span className="text-slate-300 font-semibold">Póliza ID: {log.polizaId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(log.timestamp).toLocaleTimeString()} ({new Date(log.timestamp).toLocaleDateString()})</span>
                      <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">
                        HTTP {log.statusCode}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-300 text-xs">{log.detalle}</p>

                  <div className="bg-slate-900/90 p-2 rounded-lg font-mono text-[10px] text-slate-400 overflow-x-auto">
                    {JSON.stringify(log.payload)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

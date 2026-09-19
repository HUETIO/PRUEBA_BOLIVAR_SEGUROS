import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DashboardMonthly } from './components/DashboardMonthly';
import { PolicyManager } from './components/PolicyManager';
import { RiskModal } from './components/RiskModal';
import { CreatePolicyModal } from './components/CreatePolicyModal';
import { RenewModal } from './components/RenewModal';
import { RemindersView } from './components/RemindersView';
import { CoreMockConsole } from './components/CoreMockConsole';
import { TechnicalInstructionsSection, InstructionTab } from './components/TechnicalInstructionsSection';

import { 
  polizasApi, 
  remindersApi, 
  metricsApi, 
  coreMockApi, 
  getApiKey 
} from './lib/api';
import { Poliza, Reminder, CoreMockLog } from './types';
import { AlertTriangle, CheckCircle2, Info, Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeInstructionTab, setActiveInstructionTab] = useState<InstructionTab>('endpoints');
  const [isInstructionsOpen, setIsInstructionsOpen] = useState<boolean>(false);

  // State
  const [polizas, setPolizas] = useState<Poliza[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [coreLogs, setCoreLogs] = useState<CoreMockLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Modals state
  const [showCreatePolicyModal, setShowCreatePolicyModal] = useState<boolean>(false);
  const [selectedPolizaForRisks, setSelectedPolizaForRisks] = useState<Poliza | null>(null);
  const [selectedPolizaForRenew, setSelectedPolizaForRenew] = useState<Poliza | null>(null);
  const [policyToCancel, setPolicyToCancel] = useState<Poliza | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleNavigateToInstruction = (tab: InstructionTab) => {
    setActiveInstructionTab(tab);
    setIsInstructionsOpen(true);
    setTimeout(() => {
      const el = document.getElementById('seccion-instrucciones');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  // Fetch all initial data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [polizasRes, remindersRes, metricsRes, coreLogsRes] = await Promise.all([
        polizasApi.getAll(),
        remindersApi.getAll(),
        metricsApi.getMonthly(),
        coreMockApi.getLogs(),
      ]);

      setPolizas(polizasRes);
      setReminders(remindersRes);
      setMetrics(metricsRes);
      setCoreLogs(coreLogsRes);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setErrorMessage(
        err.message || 'Error al conectar con la API de Seguros. Verifique el header x-api-key.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Actions
  const handleCreatePolicy = async (policyData: any) => {
    setIsActionLoading(true);
    try {
      const created = await polizasApi.create(policyData);
      showToast(`Póliza ${created.numeroPoliza} emitida y sincronizada con el CORE.`);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error al emitir la póliza');
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRenewPolicy = async (polizaId: number, porcentajeIpc: number) => {
    setIsActionLoading(true);
    try {
      const renewed = await polizasApi.renovar(polizaId, porcentajeIpc);
      showToast(`Póliza ${renewed.numeroPoliza} renovada con éxito (+${porcentajeIpc}% IPC).`);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error al renovar la póliza');
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmCancelPolicy = async () => {
    if (!policyToCancel) return;
    setIsActionLoading(true);
    try {
      const cancelled = await polizasApi.cancelar(policyToCancel.id);
      showToast(`Póliza ${cancelled.numeroPoliza} y sus riesgos fueron cancelados.`);
      setPolicyToCancel(null);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error al cancelar póliza');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAddRisk = async (polizaId: number, riskData: any) => {
    setIsActionLoading(true);
    try {
      await polizasApi.addRiesgo(polizaId, riskData);
      showToast('Nuevo riesgo agregado y notificado a la capa media WebLogic.');
      await fetchData();

      // Update selectedPolizaForRisks locally
      const updatedPolizas = await polizasApi.getAll();
      const updated = updatedPolizas.find((p) => p.id === polizaId) || null;
      setSelectedPolizaForRisks(updated);
    } catch (err: any) {
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancelRisk = async (riesgoId: number) => {
    if (!confirm('¿Está seguro de cancelar este riesgo amparado?')) return;
    setIsActionLoading(true);
    try {
      await polizasApi.cancelarRiesgo(riesgoId);
      showToast('Riesgo cancelado y estado actualizado en el CORE.');
      await fetchData();

      if (selectedPolizaForRisks) {
        const updatedPolizas = await polizasApi.getAll();
        const updated = updatedPolizas.find((p) => p.id === selectedPolizaForRisks.id) || null;
        setSelectedPolizaForRisks(updated);
      }
    } catch (err: any) {
      alert(err.message || 'Error al cancelar riesgo');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCreateReminder = async (reminderData: any) => {
    try {
      await remindersApi.create(reminderData);
      showToast('Recordatorio programado con éxito.');
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error al crear recordatorio');
    }
  };

  const handleToggleReminder = async (id: string) => {
    try {
      await remindersApi.toggle(id);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error al actualizar recordatorio');
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await remindersApi.delete(id);
      showToast('Recordatorio eliminado.');
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar recordatorio');
    }
  };

  const handleDispatchCoreEvent = async (evento: string, polizaId: number) => {
    try {
      await coreMockApi.sendEvent(evento, polizaId);
      showToast(`Evento "${evento}" despachado al CORE en WebLogic.`);
      await fetchData();
    } catch (err: any) {
      throw err;
    }
  };

  const pendingRemindersCount = reminders.filter((r) => !r.completado).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Toast */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 border border-emerald-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header with Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreatePolicy={() => setShowCreatePolicyModal(true)}
        onOpenCreateReminder={() => setActiveTab('reminders')}
        pendingRemindersCount={pendingRemindersCount}
        onRefresh={fetchData}
        isRefreshing={isLoading}
        onScrollToInstructions={() => handleNavigateToInstruction(activeInstructionTab)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Error / Unauthorized Warning */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-rose-100 block">Atención: Error en la llamada API</strong>
                <span>{errorMessage}</span>
                <div className="mt-1 text-slate-400">
                  Asegúrate de que la clave en el botón superior sea <code className="text-emerald-400 font-mono">123456</code>.
                </div>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="px-3 py-1 bg-rose-900/60 hover:bg-rose-800 text-white rounded-lg font-medium text-xs whitespace-nowrap"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Tab Views: Operational Components */}
        {activeTab === 'dashboard' && (
          <DashboardMonthly
            polizas={polizas}
            reminders={reminders}
            metrics={metrics}
            onOpenRenewModal={(p) => setSelectedPolizaForRenew(p)}
            onOpenCreateReminder={() => setActiveTab('reminders')}
            onNavigateTab={(tab) => {
              if (['endpoints', 'systemdesign', 'optimization', 'code'].includes(tab)) {
                handleNavigateToInstruction(tab as InstructionTab);
              } else {
                setActiveTab(tab);
              }
            }}
          />
        )}

        {activeTab === 'polizas' && (
          <PolicyManager
            polizas={polizas}
            onOpenCreatePolicy={() => setShowCreatePolicyModal(true)}
            onOpenRiskModal={(p) => setSelectedPolizaForRisks(p)}
            onOpenRenewModal={(p) => setSelectedPolizaForRenew(p)}
            onCancelPolicy={(p) => setPolicyToCancel(p)}
            onRefresh={fetchData}
          />
        )}

        {activeTab === 'reminders' && (
          <RemindersView
            reminders={reminders}
            polizas={polizas}
            onCreateReminder={handleCreateReminder}
            onToggleReminder={handleToggleReminder}
            onDeleteReminder={handleDeleteReminder}
            onOpenRenewModal={(p) => setSelectedPolizaForRenew(p)}
            isLoading={isActionLoading}
          />
        )}

        {activeTab === 'coremock' && (
          <CoreMockConsole
            logs={coreLogs}
            polizas={polizas}
            onDispatchEvent={handleDispatchCoreEvent}
            onRefresh={fetchData}
            isLoading={isLoading}
          />
        )}

        {/* Sección Exclusiva al final de todo el proyecto: Instrucciones, Arquitectura & Consumo de Endpoints */}
        <TechnicalInstructionsSection
          activeInstructionTab={activeInstructionTab}
          setActiveInstructionTab={setActiveInstructionTab}
          isOpen={isInstructionsOpen}
          setIsOpen={setIsInstructionsOpen}
        />
      </main>

      {/* Modal: Create Policy */}
      <CreatePolicyModal
        isOpen={showCreatePolicyModal}
        onClose={() => setShowCreatePolicyModal(false)}
        onSubmit={handleCreatePolicy}
        isLoading={isActionLoading}
      />

      {/* Modal: Risks */}
      <RiskModal
        poliza={selectedPolizaForRisks}
        onClose={() => setSelectedPolizaForRisks(null)}
        onAddRiesgo={handleAddRisk}
        onCancelRiesgo={handleCancelRisk}
        isLoading={isActionLoading}
      />

      {/* Modal: Renew Policy (+IPC) */}
      <RenewModal
        poliza={selectedPolizaForRenew}
        onClose={() => setSelectedPolizaForRenew(null)}
        onRenew={handleRenewPolicy}
        isLoading={isActionLoading}
      />

      {/* Modal: Confirm Policy Cancellation */}
      {policyToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100 text-xs space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirmar Cancelación Contractual</h3>
                <p className="text-slate-400">Póliza: {policyToCancel.numeroPoliza}</p>
              </div>
            </div>

            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-200 leading-relaxed">
              <strong>Regla de negocio crítica:</strong> La cancelación de una póliza cancelará automáticamente todos sus riesgos asociados y notificará en tiempo real al CORE transaccional en WebLogic.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setPolicyToCancel(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
              >
                Regresar
              </button>
              <button
                onClick={handleConfirmCancelPolicy}
                disabled={isActionLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow transition active:scale-95"
              >
                {isActionLoading ? 'Cancelando...' : 'Confirmar Cancelación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

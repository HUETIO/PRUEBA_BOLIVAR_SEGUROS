import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Trash2, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  AlertCircle,
  Filter,
  Send,
  Sparkles,
  Shield,
  XCircle
} from 'lucide-react';
import { Reminder, Poliza, ReminderPriority, ReminderType, ReminderCanal } from '../types';

interface RemindersViewProps {
  reminders: Reminder[];
  polizas: Poliza[];
  onCreateReminder: (data: any) => Promise<void>;
  onToggleReminder: (id: string) => Promise<void>;
  onDeleteReminder: (id: string) => Promise<void>;
  onOpenRenewModal: (poliza: Poliza) => void;
  isLoading: boolean;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  polizas,
  onCreateReminder,
  onToggleReminder,
  onDeleteReminder,
  onOpenRenewModal,
  isLoading,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'PENDING' | 'COMPLETED' | 'ALL'>('PENDING');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  // Form state
  const [polizaId, setPolizaId] = useState<string>('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaLimite, setFechaLimite] = useState('2026-09-30');
  const [prioridad, setPrioridad] = useState<ReminderPriority>('MEDIA');
  const [tipo, setTipo] = useState<ReminderType>('RENOVACION');
  const [canal, setCanal] = useState<ReminderCanal>('EMAIL');

  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const presets = [
    {
      label: '📅 Aviso Renovación (30 días)',
      titulo: 'Aviso formal de vencimiento y renovación contractual (30 días)',
      descripcion: 'Enviar notificación previa al arrendatario indicando fecha límite de prórroga y ajuste según IPC.',
      tipo: 'RENOVACION' as ReminderType,
      prioridad: 'ALTA' as ReminderPriority,
      canal: 'EMAIL' as ReminderCanal,
    },
    {
      label: '📈 Notificación Incremento IPC',
      titulo: 'Notificación de incremento del canon según IPC DANE',
      descripcion: 'Remitir carta de anexo de canon con ajuste legal del +9.28% para la nueva vigencia.',
      tipo: 'AJUSTE_IPC' as ReminderType,
      prioridad: 'ALTA' as ReminderPriority,
      canal: 'EMAIL' as ReminderCanal,
    },
    {
      label: '📱 Recordatorio Pago Canon SMS',
      titulo: 'Recordatorio oportuno de pago mensual de canon',
      descripcion: 'Mensaje de texto automático para recordar la consignación del canon los primeros 5 días.',
      tipo: 'VENCIMIENTO_CANON' as ReminderType,
      prioridad: 'MEDIA' as ReminderPriority,
      canal: 'SMS' as ReminderCanal,
    },
    {
      label: '🏢 Auditoría Inmuebles Colectiva',
      titulo: 'Revisión y verificación de riesgos colectivos',
      descripcion: 'Comprobar vigencia de contratos de sub-arrendatarios y estado de inmuebles en la inmobiliaria.',
      tipo: 'REVISION_RIESGOS' as ReminderType,
      prioridad: 'MEDIA' as ReminderPriority,
      canal: 'PUSH' as ReminderCanal,
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setTitulo(p.titulo);
    setDescripcion(p.descripcion);
    setTipo(p.tipo);
    setPrioridad(p.prioridad);
    setCanal(p.canal);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !fechaLimite) return;

    await onCreateReminder({
      polizaId: polizaId ? parseInt(polizaId) : undefined,
      titulo,
      descripcion,
      fechaLimite,
      prioridad,
      tipo,
      canal,
    });

    setShowCreateModal(false);
    setTitulo('');
    setDescripcion('');
    setPolizaId('');
  };

  const handleSimulateDispatch = (reminder: Reminder) => {
    const channelName = reminder.canal === 'SMS' ? 'SMS celular' : reminder.canal === 'EMAIL' ? 'Correo Electrónico' : 'Notificación Push';
    setNotificationToast(
      `Evento de Notificación despachado vía ${channelName} para "${reminder.titulo}"`
    );
    setTimeout(() => setNotificationToast(null), 4500);
  };

  const filteredReminders = reminders.filter((r) => {
    const matchStatus =
      filterStatus === 'ALL'
        ? true
        : filterStatus === 'PENDING'
        ? !r.completado
        : r.completado;

    const matchPriority =
      filterPriority === 'ALL' || r.prioridad === filterPriority;

    return matchStatus && matchPriority;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {notificationToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs animate-in slide-in-from-bottom-5">
          <Send className="w-4 h-4 text-emerald-200" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Sistema de Recordatorios & Alertas Preventivas
              </span>
              <span className="text-xs text-slate-400">Eventos de Notificación Email / SMS</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Recordatorios de Vencimientos & Renovaciones
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              Configura alertas automáticas de renovación contractual a 30 días, notificaciones de ajuste por IPC, control de pagos mensuales y auditorías de pólizas colectivas.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Programar Recordatorio</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Estado:</span>
            <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setFilterStatus('PENDING')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  filterStatus === 'PENDING'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pendientes ({reminders.filter((r) => !r.completado).length})
              </button>
              <button
                onClick={() => setFilterStatus('COMPLETED')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  filterStatus === 'COMPLETED'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Completados ({reminders.filter((r) => r.completado).length})
              </button>
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  filterStatus === 'ALL'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos ({reminders.length})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Prioridad:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-slate-950/60 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Todas las prioridades</option>
              <option value="ALTA">Alta</option>
              <option value="MEDIA">Media</option>
              <option value="BAJA">Baja</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reminders List */}
      {filteredReminders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Sin recordatorios en esta vista</h3>
          <p className="text-xs text-slate-500">
            Crea tu primer recordatorio para programar avisos de renovación o pagos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReminders.map((rem) => {
            const linkedPolicy = polizas.find((p) => p.id === rem.polizaId);
            return (
              <div
                key={rem.id}
                className={`p-5 rounded-2xl border transition text-slate-200 flex flex-col justify-between ${
                  rem.completado
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-65'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleReminder(rem.id)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                          rem.completado
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'border-slate-600 hover:border-slate-400 bg-slate-800'
                        }`}
                        title={rem.completado ? 'Marcar pendiente' : 'Marcar completado'}
                      >
                        {rem.completado && <CheckCircle className="w-4 h-4" />}
                      </button>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        rem.prioridad === 'ALTA' ? 'bg-rose-950 text-rose-300 border-rose-800' :
                        rem.prioridad === 'MEDIA' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {rem.prioridad}
                      </span>

                      <span className="text-[10px] font-semibold text-slate-400 uppercase bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
                        {rem.tipo}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-teal-400 flex items-center gap-1 font-mono">
                        {rem.canal === 'SMS' ? <Smartphone className="w-3 h-3" /> :
                         rem.canal === 'EMAIL' ? <Mail className="w-3 h-3" /> :
                         <Bell className="w-3 h-3" />}
                        {rem.canal}
                      </span>
                      <button
                        onClick={() => onDeleteReminder(rem.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition ml-2"
                        title="Eliminar recordatorio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className={`font-bold text-sm mt-3 ${rem.completado ? 'line-through text-slate-400' : 'text-white'}`}>
                    {rem.titulo}
                  </h3>
                  {rem.descripcion && (
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {rem.descripcion}
                    </p>
                  )}

                  {linkedPolicy && (
                    <div className="mt-3 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">
                        Póliza: <strong className="text-slate-200">{linkedPolicy.numeroPoliza}</strong> ({linkedPolicy.tipo})
                      </span>
                      <span className="text-slate-400">
                        Tomador: <strong className="text-slate-200">{linkedPolicy.tomador}</strong>
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Límite: <strong className="text-slate-200">{rem.fechaLimite}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSimulateDispatch(rem)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium transition flex items-center gap-1"
                      title="Simular envío de notificación por correo o SMS"
                    >
                      <Send className="w-3 h-3 text-emerald-400" />
                      <span>Despachar Alerta</span>
                    </button>

                    {linkedPolicy && linkedPolicy.estado !== 'CANCELADA' && (
                      <button
                        onClick={() => onOpenRenewModal(linkedPolicy)}
                        className="px-2.5 py-1 bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 rounded-lg text-[11px] font-medium transition"
                      >
                        Renovar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal to Create Reminder */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl text-slate-100 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Programar Nuevo Recordatorio</h2>
                  <p className="text-xs text-slate-400">
                    Notificaciones programadas para contratos de arrendamiento
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              {/* Presets */}
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Plantillas Rápidas:</label>
                <div className="grid grid-cols-2 gap-2">
                  {presets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="p-2 bg-slate-950 border border-slate-800 hover:border-emerald-500/60 rounded-xl text-left transition text-[11px] text-slate-300"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Policy */}
              <div>
                <label className="block text-slate-300 mb-1">Título del Recordatorio *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Enviar preaviso de renovación con IPC a Arrendatario"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Póliza Vinculada (Opcional)</label>
                <select
                  value={polizaId}
                  onChange={(e) => setPolizaId(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Sin póliza vinculada (General) --</option>
                  {polizas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.numeroPoliza} - {p.tomador} ({p.tipo} • {p.estado})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Fecha Límite *</label>
                  <input
                    type="date"
                    required
                    value={fechaLimite}
                    onChange={(e) => setFechaLimite(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Prioridad</label>
                  <select
                    value={prioridad}
                    onChange={(e) => setPrioridad(e.target.value as ReminderPriority)}
                    className="w-full bg-slate-950/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ALTA">ALTA</option>
                    <option value="MEDIA">MEDIA</option>
                    <option value="BAJA">BAJA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Canal de Envío</label>
                  <select
                    value={canal}
                    onChange={(e) => setCanal(e.target.value as ReminderCanal)}
                    className="w-full bg-slate-950/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="EMAIL">Correo Electrónico</option>
                    <option value="SMS">SMS Celular</option>
                    <option value="PUSH">Notificación Push</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Notas / Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre las condiciones de renovación o documentos requeridos..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow"
                >
                  Guardar Recordatorio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

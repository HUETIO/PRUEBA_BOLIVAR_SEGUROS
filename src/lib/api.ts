import { Poliza, Riesgo, Reminder, CoreMockLog, TipoPoliza, EstadoPoliza } from '../types';

let currentApiKey = '123456';

export const getApiKey = () => currentApiKey;
export const setApiKey = (key: string) => {
  currentApiKey = key;
};

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'x-api-key': currentApiKey,
});

export const api = {
  // Pólizas
  async getPolizas(tipo?: TipoPoliza, estado?: EstadoPoliza): Promise<Poliza[]> {
    const params = new URLSearchParams();
    if (tipo) params.append('tipo', tipo);
    if (estado) params.append('estado', estado);
    const url = `/api/polizas${params.toString() ? `?${params.toString()}` : ''}`;
    
    const res = await fetch(url, { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.mensaje || 'Error al obtener pólizas');
    return json.datos;
  },

  async getPolizaById(id: number): Promise<Poliza> {
    const res = await fetch(`/api/polizas/${id}`, { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.mensaje || 'Error al obtener póliza');
    return json.datos;
  },

  async createPoliza(data: any): Promise<Poliza> {
    const res = await fetch('/api/polizas', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.mensaje || 'Error al crear póliza');
    return json.datos;
  },

  async renovarPoliza(id: number, porcentajeIpc: number): Promise<Poliza> {
    const res = await fetch(`/api/polizas/${id}/renovar`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ porcentajeIpc }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.mensaje || 'Error al renovar póliza');
    return json.datos;
  },

  async cancelarPoliza(id: number): Promise<Poliza> {
    const res = await fetch(`/api/polizas/${id}/cancelar`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.mensaje || 'Error al cancelar póliza');
    return json.datos;
  },

  // Riesgos
  async getRiesgos(polizaId: number): Promise<Riesgo[]> {
    const res = await fetch(`/api/polizas/${polizaId}/riesgos`, { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.mensaje || 'Error al obtener riesgos');
    return json.datos;
  },

  async addRiesgo(polizaId: number, data: any): Promise<Riesgo> {
    const res = await fetch(`/api/polizas/${polizaId}/riesgos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.mensaje || 'Error al agregar riesgo');
    return json.datos;
  },

  async cancelarRiesgo(riesgoId: number): Promise<Riesgo> {
    const res = await fetch(`/api/riesgos/${riesgoId}/cancelar`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.mensaje || 'Error al cancelar riesgo');
    return json.datos;
  },

  // Mock Externo CORE WebLogic
  async enviarEventoCore(evento: string, polizaId: number): Promise<any> {
    const res = await fetch('/api/core-mock/evento', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ evento, polizaId }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.mensaje || 'Error en endpoint mock CORE');
    return json;
  },

  async getCoreLogs(): Promise<CoreMockLog[]> {
    const res = await fetch('/api/core-mock/logs', { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.mensaje || 'Error al obtener logs de CORE');
    return json.datos;
  },

  // Recordatorios
  async getReminders(): Promise<Reminder[]> {
    const res = await fetch('/api/reminders', { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.mensaje || 'Error al obtener recordatorios');
    return json.datos;
  },

  async createReminder(data: any): Promise<Reminder> {
    const res = await fetch('/api/reminders', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.mensaje || 'Error al crear recordatorio');
    return json.datos;
  },

  async toggleReminder(id: string): Promise<Reminder> {
    const res = await fetch(`/api/reminders/${id}/toggle`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.mensaje || 'Error al actualizar recordatorio');
    return json.datos;
  },

  async deleteReminder(id: string): Promise<void> {
    const res = await fetch(`/api/reminders/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al eliminar recordatorio');
  },

  // Métricas mensuales
  async getMonthlyMetrics(): Promise<any> {
    const res = await fetch('/api/monthly-metrics', { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.mensaje || 'Error al obtener métricas');
    return json.datos;
  }
};

export const polizasApi = {
  getAll: (tipo?: TipoPoliza, estado?: EstadoPoliza) => api.getPolizas(tipo, estado),
  getById: (id: number) => api.getPolizaById(id),
  create: (data: any) => api.createPoliza(data),
  renovar: (id: number, ipc: number) => api.renovarPoliza(id, ipc),
  cancelar: (id: number) => api.cancelarPoliza(id),
  getRiesgos: (id: number) => api.getRiesgos(id),
  addRiesgo: (id: number, data: any) => api.addRiesgo(id, data),
  cancelarRiesgo: (id: number) => api.cancelarRiesgo(id),
};

export const remindersApi = {
  getAll: () => api.getReminders(),
  create: (data: any) => api.createReminder(data),
  toggle: (id: string) => api.toggleReminder(id),
  delete: (id: string) => api.deleteReminder(id),
};

export const metricsApi = {
  getMonthly: () => api.getMonthlyMetrics(),
};

export const coreMockApi = {
  sendEvent: (evento: string, polizaId: number) => api.enviarEventoCore(evento, polizaId),
  getLogs: () => api.getCoreLogs(),
};


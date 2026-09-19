export type TipoPoliza = 'INDIVIDUAL' | 'COLECTIVA';
export type EstadoPoliza = 'ACTIVA' | 'RENOVADA' | 'CANCELADA';
export type EstadoRiesgo = 'ACTIVO' | 'CANCELADO';

export type ReminderPriority = 'ALTA' | 'MEDIA' | 'BAJA';
export type ReminderType = 'RENOVACION' | 'AJUSTE_IPC' | 'VENCIMIENTO_CANON' | 'REVISION_RIESGOS' | 'CONTACTO_CLIENTE';
export type ReminderCanal = 'EMAIL' | 'SMS' | 'PUSH';

export interface Riesgo {
  id: number;
  polizaId: number;
  direccion: string;
  ciudad: string;
  valorCanon: number;
  descripcionInmueble: string;
  arrendatarioNombre: string;
  arrendatarioDoc: string;
  estado: EstadoRiesgo;
  fechaCreacion: string;
}

export interface Poliza {
  id: number;
  numeroPoliza: string;
  tipo: TipoPoliza;
  estado: EstadoPoliza;
  tomador: string;
  tomadorDoc: string;
  asegurado: string;
  beneficiario: string;
  vigenciaMeses: number;
  fechaInicio: string;
  fechaFin: string;
  canonMensual: number;
  primaTotal: number;
  porcentajeIpcUltimaRenovacion?: number;
  fechaUltimaRenovacion?: string;
  riesgos: Riesgo[];
}

export interface CoreMockLog {
  id: string;
  timestamp: string;
  evento: string;
  polizaId: number;
  detalle: string;
  statusCode: number;
  payload: {
    evento: string;
    polizaId: number;
    timestamp?: string;
  };
}

export interface Reminder {
  id: string;
  polizaId?: number;
  numeroPoliza?: string;
  titulo: string;
  descripcion: string;
  fechaLimite: string;
  prioridad: ReminderPriority;
  tipo: ReminderType;
  completado: boolean;
  canal: ReminderCanal;
  creadoEn: string;
}

export interface MonthlyProgressItem {
  mes: string;
  mesCorto: string;
  polizasActivas: number;
  renovacionesMeta: number;
  renovacionesRealizadas: number;
  canonTotal: number;
  primasTotales: number;
  ipcPromedio: number;
}

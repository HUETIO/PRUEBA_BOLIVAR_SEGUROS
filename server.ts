import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Data Store mirroring Spring Boot Entities
interface RiesgoItem {
  id: number;
  polizaId: number;
  direccion: string;
  ciudad: string;
  valorCanon: number;
  descripcionInmueble: string;
  arrendatarioNombre: string;
  arrendatarioDoc: string;
  estado: 'ACTIVO' | 'CANCELADO';
  fechaCreacion: string;
}

interface PolizaItem {
  id: number;
  numeroPoliza: string;
  tipo: 'INDIVIDUAL' | 'COLECTIVA';
  estado: 'ACTIVA' | 'RENOVADA' | 'CANCELADA';
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
}

interface CoreLogItem {
  id: string;
  timestamp: string;
  evento: string;
  polizaId: number;
  detalle: string;
  statusCode: number;
  payload: any;
}

interface ReminderItem {
  id: string;
  polizaId?: number;
  numeroPoliza?: string;
  titulo: string;
  descripcion: string;
  fechaLimite: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  tipo: 'RENOVACION' | 'AJUSTE_IPC' | 'VENCIMIENTO_CANON' | 'REVISION_RIESGOS' | 'CONTACTO_CLIENTE';
  completado: boolean;
  canal: 'EMAIL' | 'SMS' | 'PUSH';
  creadoEn: string;
}

let initialPolizas: PolizaItem[] = [
  {
    id: 1,
    numeroPoliza: 'POL-IND-2026-001',
    tipo: 'INDIVIDUAL',
    estado: 'ACTIVA',
    tomador: 'Santiago Restrepo',
    tomadorDoc: 'CC 1017245890',
    asegurado: 'Santiago Restrepo',
    beneficiario: 'Inversiones Bolívar S.A.S.',
    vigenciaMeses: 12,
    fechaInicio: '2026-01-15',
    fechaFin: '2027-01-15',
    canonMensual: 2850000,
    primaTotal: 2850000 * 12,
  },
  {
    id: 2,
    numeroPoliza: 'POL-COL-2026-044',
    tipo: 'COLECTIVA',
    estado: 'ACTIVA',
    tomador: 'Inmobiliaria Santa María & Cía.',
    tomadorDoc: 'NIT 900.876.543-1',
    asegurado: 'Colectivo Arrendatarios Zona Norte',
    beneficiario: 'Propietarios Agrupación Santa María',
    vigenciaMeses: 12,
    fechaInicio: '2025-10-01',
    fechaFin: '2026-10-01',
    canonMensual: 9600000,
    primaTotal: 9600000 * 12,
  },
  {
    id: 3,
    numeroPoliza: 'POL-IND-2025-089',
    tipo: 'INDIVIDUAL',
    estado: 'RENOVADA',
    tomador: 'Valentina Ospina Gómez',
    tomadorDoc: 'CC 52894123',
    asegurado: 'Valentina Ospina Gómez',
    beneficiario: 'Carlos Eduardo Ramírez',
    vigenciaMeses: 12,
    fechaInicio: '2026-03-01',
    fechaFin: '2027-03-01',
    canonMensual: 1950000,
    primaTotal: 1950000 * 12,
    porcentajeIpcUltimaRenovacion: 9.28,
    fechaUltimaRenovacion: '2026-02-28',
  },
  {
    id: 4,
    numeroPoliza: 'POL-COL-2025-012',
    tipo: 'COLECTIVA',
    estado: 'ACTIVA',
    tomador: 'Administraciones Metropolitanas LTDA',
    tomadorDoc: 'NIT 830.122.901-4',
    asegurado: 'Copropietarios y Residentes Edificio Panorámica',
    beneficiario: 'Fideicomiso Arrendadores Panorámica',
    vigenciaMeses: 12,
    fechaInicio: '2025-11-15',
    fechaFin: '2026-11-15',
    canonMensual: 14500000,
    primaTotal: 14500000 * 12,
  },
  {
    id: 5,
    numeroPoliza: 'POL-IND-2024-032',
    tipo: 'INDIVIDUAL',
    estado: 'CANCELADA',
    tomador: 'Mateo Cárdenas Silva',
    tomadorDoc: 'CC 80145632',
    asegurado: 'Mateo Cárdenas Silva',
    beneficiario: 'Inmobiliaria del Parque',
    vigenciaMeses: 12,
    fechaInicio: '2025-04-01',
    fechaFin: '2026-04-01',
    canonMensual: 2100000,
    primaTotal: 2100000 * 12,
  }
];

let initialRiesgos: RiesgoItem[] = [
  {
    id: 1,
    polizaId: 1,
    direccion: 'Carrera 15 # 93-45 Apto 401',
    ciudad: 'Bogotá D.C.',
    valorCanon: 2850000,
    descripcionInmueble: 'Apartamento 2 alcobas, balcón y parqueadero',
    arrendatarioNombre: 'Santiago Restrepo',
    arrendatarioDoc: 'CC 1017245890',
    estado: 'ACTIVO',
    fechaCreacion: '2026-01-15',
  },
  {
    id: 2,
    polizaId: 2,
    direccion: 'Calle 127 # 19-30 Apto 203',
    ciudad: 'Bogotá D.C.',
    valorCanon: 3100000,
    descripcionInmueble: 'Apartaestudio amoblado',
    arrendatarioNombre: 'Laura Marcela Benítez',
    arrendatarioDoc: 'CC 1032489654',
    estado: 'ACTIVO',
    fechaCreacion: '2025-10-01',
  },
  {
    id: 3,
    polizaId: 2,
    direccion: 'Calle 127 # 19-30 Apto 501',
    ciudad: 'Bogotá D.C.',
    valorCanon: 3500000,
    descripcionInmueble: 'Penthouse dúplex 3 habitaciones',
    arrendatarioNombre: 'Andrés Felipe Morales',
    arrendatarioDoc: 'CC 79845120',
    estado: 'ACTIVO',
    fechaCreacion: '2025-10-01',
  },
  {
    id: 4,
    polizaId: 2,
    direccion: 'Calle 127 # 19-30 Local 102',
    ciudad: 'Bogotá D.C.',
    valorCanon: 3000000,
    descripcionInmueble: 'Local comercial con vitrina',
    arrendatarioNombre: 'Droguerías Vida Sana',
    arrendatarioDoc: 'NIT 901.458.112-9',
    estado: 'ACTIVO',
    fechaCreacion: '2025-10-01',
  },
  {
    id: 5,
    polizaId: 3,
    direccion: 'Carrera 43A # 18 Sur-60 Apto 1102',
    ciudad: 'Medellín',
    valorCanon: 1950000,
    descripcionInmueble: 'Apartamento El Poblado',
    arrendatarioNombre: 'Valentina Ospina Gómez',
    arrendatarioDoc: 'CC 52894123',
    estado: 'ACTIVO',
    fechaCreacion: '2025-03-01',
  },
  {
    id: 6,
    polizaId: 4,
    direccion: 'Av. Circunvalar # 72-10 Torre 1 Apto 302',
    ciudad: 'Bogotá D.C.',
    valorCanon: 4800000,
    descripcionInmueble: 'Apartamento campestre vista a la ciudad',
    arrendatarioNombre: 'Felipe Jaramillo Londoño',
    arrendatarioDoc: 'CC 71258963',
    estado: 'ACTIVO',
    fechaCreacion: '2025-11-15',
  },
  {
    id: 7,
    polizaId: 4,
    direccion: 'Av. Circunvalar # 72-10 Torre 2 Apto 804',
    ciudad: 'Bogotá D.C.',
    valorCanon: 5200000,
    descripcionInmueble: 'Apartamento familiar de 140m2',
    arrendatarioNombre: 'Mariana Duarte Rivas',
    arrendatarioDoc: 'CC 1026548970',
    estado: 'ACTIVO',
    fechaCreacion: '2025-11-15',
  },
  {
    id: 8,
    polizaId: 4,
    direccion: 'Av. Circunvalar # 72-10 Torre 2 Apto 1001',
    ciudad: 'Bogotá D.C.',
    valorCanon: 4500000,
    descripcionInmueble: 'Apartamento piso alto',
    arrendatarioNombre: 'Juliana Pardo Castro',
    arrendatarioDoc: 'CC 53147895',
    estado: 'ACTIVO',
    fechaCreacion: '2025-11-15',
  },
  {
    id: 9,
    polizaId: 5,
    direccion: 'Calle 100 # 15-20 Apto 704',
    ciudad: 'Bogotá D.C.',
    valorCanon: 2100000,
    descripcionInmueble: 'Apartamento residencial',
    arrendatarioNombre: 'Mateo Cárdenas Silva',
    arrendatarioDoc: 'CC 80145632',
    estado: 'CANCELADO',
    fechaCreacion: '2025-04-01',
  }
];

let initialReminders: ReminderItem[] = [
  {
    id: 'rem-1',
    polizaId: 2,
    numeroPoliza: 'POL-COL-2026-044',
    titulo: 'Aviso de renovación anticipada (30 días)',
    descripcion: 'Contactar a Inmobiliaria Santa María para acordar ajuste de canon según proyección IPC.',
    fechaLimite: '2026-09-01',
    prioridad: 'ALTA',
    tipo: 'RENOVACION',
    completado: false,
    canal: 'EMAIL',
    creadoEn: '2026-08-15',
  },
  {
    id: 'rem-2',
    polizaId: 4,
    numeroPoliza: 'POL-COL-2025-012',
    titulo: 'Revisión y auditoría de riesgos colectivos',
    descripcion: 'Verificar inventario de riesgos activos y certificados de arrendatarios en Edificio Panorámica.',
    fechaLimite: '2026-10-15',
    prioridad: 'MEDIA',
    tipo: 'REVISION_RIESGOS',
    completado: false,
    canal: 'PUSH',
    creadoEn: '2026-08-20',
  },
  {
    id: 'rem-3',
    polizaId: 1,
    numeroPoliza: 'POL-IND-2026-001',
    titulo: 'Vencimiento cuota mensual de arrendamiento',
    descripcion: 'Enviar recordatorio SMS de pago oportuno de canon a Santiago Restrepo.',
    fechaLimite: '2026-09-05',
    prioridad: 'MEDIA',
    tipo: 'VENCIMIENTO_CANON',
    completado: true,
    canal: 'SMS',
    creadoEn: '2026-08-01',
  },
  {
    id: 'rem-4',
    polizaId: 3,
    numeroPoliza: 'POL-IND-2025-089',
    titulo: 'Confirmar emisión de anexo IPC firmado',
    descripcion: 'Validar constancia de entrega de incremento 9.28% a la arrendataria Valentina Ospina.',
    fechaLimite: '2026-09-20',
    prioridad: 'BAJA',
    tipo: 'AJUSTE_IPC',
    completado: false,
    canal: 'EMAIL',
    creadoEn: '2026-08-25',
  }
];

let polizas: PolizaItem[] = [...initialPolizas];
let riesgos: RiesgoItem[] = [...initialRiesgos];
let reminders: ReminderItem[] = [...initialReminders];
let coreLogs: CoreLogItem[] = [
  {
    id: 'log-seed-1',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    evento: 'ACTUALIZACION',
    polizaId: 3,
    detalle: 'Renovación de póliza con incremento IPC (+9.28%). Sincronizado con capa media WebLogic.',
    statusCode: 200,
    payload: { evento: 'ACTUALIZACION', polizaId: 3, timestamp: new Date(Date.now() - 3600000 * 5).toISOString() }
  },
  {
    id: 'log-seed-2',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    evento: 'ACTUALIZACION',
    polizaId: 5,
    detalle: 'Cancelación total de póliza y cascada a todos sus riesgos asociados.',
    statusCode: 200,
    payload: { evento: 'ACTUALIZACION', polizaId: 5, timestamp: new Date(Date.now() - 3600000 * 24).toISOString() }
  }
];

// Helper to log event to external mock WebLogic CORE
function notifyCore(polizaId: number, detalle: string) {
  const logEntry: CoreLogItem = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    evento: 'ACTUALIZACION',
    polizaId,
    detalle,
    statusCode: 200,
    payload: {
      evento: 'ACTUALIZACION',
      polizaId,
      timestamp: new Date().toISOString()
    }
  };
  coreLogs.unshift(logEntry);
  console.log(`[WEBLOGIC CORE MOCK] Evento ACTUALIZACION registrado para póliza ${polizaId}: ${detalle}`);
  return logEntry;
}

// Security Middleware: Header x-api-key: 123456
const apiKeyMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Allow bypassing if query ?apiKeyBypass=true is passed for testing only, otherwise strictly validate header
  const headerKey = req.headers['x-api-key'];
  if (headerKey !== '123456' && req.query.apiKeyBypass !== 'true') {
    return res.status(401).json({
      exito: false,
      mensaje: "Acceso no autorizado: Header 'x-api-key: 123456' requerido o inválido"
    });
  }
  next();
};

// ==========================================
// API ROUTES (Exact contract matching Spring Boot)
// ==========================================

// 1. GET /api/polizas - Listar pólizas por "tipo" y "estado"
app.get('/api/polizas', apiKeyMiddleware, (req, res) => {
  const { tipo, estado } = req.query;

  let filtradas = polizas.map(p => {
    const pRiesgos = riesgos.filter(r => r.polizaId === p.id);
    return {
      ...p,
      riesgos: pRiesgos,
      totalRiesgos: pRiesgos.length,
      riesgosActivos: pRiesgos.filter(r => r.estado === 'ACTIVO').length
    };
  });

  if (tipo) {
    filtradas = filtradas.filter(p => p.tipo === tipo);
  }
  if (estado) {
    filtradas = filtradas.filter(p => p.estado === estado);
  }

  res.json({
    exito: true,
    mensaje: 'Pólizas obtenidas exitosamente',
    datos: filtradas
  });
});

// GET /api/polizas/:id
app.get('/api/polizas/:id', apiKeyMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const poliza = polizas.find(p => p.id === id);
  if (!poliza) {
    return res.status(404).json({ exito: false, mensaje: `Póliza no encontrada con ID: ${id}` });
  }
  const pRiesgos = riesgos.filter(r => r.polizaId === poliza.id);
  res.json({
    exito: true,
    mensaje: 'Póliza encontrada',
    datos: {
      ...poliza,
      riesgos: pRiesgos
    }
  });
});

// POST /api/polizas (Crear póliza)
app.post('/api/polizas', apiKeyMiddleware, (req, res) => {
  const {
    numeroPoliza,
    tipo,
    tomador,
    tomadorDoc,
    asegurado,
    beneficiario,
    vigenciaMeses,
    fechaInicio,
    canonMensual,
    direccionRiesgoInicial,
    ciudadRiesgoInicial,
    descripcionInmuebleInicial
  } = req.body;

  if (!numeroPoliza || !tipo || !tomador || !asegurado || !beneficiario || !vigenciaMeses || !canonMensual) {
    return res.status(400).json({ exito: false, mensaje: 'Todos los campos obligatorios deben ser proporcionados' });
  }

  const newId = polizas.length > 0 ? Math.max(...polizas.map(p => p.id)) + 1 : 1;
  const meses = parseInt(vigenciaMeses);
  const canon = parseFloat(canonMensual);
  const prima = canon * meses;
  const inicio = fechaInicio || new Date().toISOString().split('T')[0];
  const d = new Date(inicio);
  d.setMonth(d.getMonth() + meses);
  const fechaFin = d.toISOString().split('T')[0];

  const nuevaPoliza: PolizaItem = {
    id: newId,
    numeroPoliza,
    tipo,
    estado: 'ACTIVA',
    tomador,
    tomadorDoc: tomadorDoc || 'CC 00000000',
    asegurado,
    beneficiario,
    vigenciaMeses: meses,
    fechaInicio: inicio,
    fechaFin,
    canonMensual: canon,
    primaTotal: prima
  };

  polizas.unshift(nuevaPoliza);

  // Riesgo inicial
  if (direccionRiesgoInicial) {
    const nuevoRiesgo: RiesgoItem = {
      id: riesgos.length > 0 ? Math.max(...riesgos.map(r => r.id)) + 1 : 1,
      polizaId: newId,
      direccion: direccionRiesgoInicial,
      ciudad: ciudadRiesgoInicial || 'Bogotá D.C.',
      valorCanon: canon,
      descripcionInmueble: descripcionInmuebleInicial || 'Inmueble Residencial',
      arrendatarioNombre: asegurado,
      arrendatarioDoc: tomadorDoc || 'CC 00000000',
      estado: 'ACTIVO',
      fechaCreacion: new Date().toISOString().split('T')[0]
    };
    riesgos.push(nuevoRiesgo);
  }

  // Notificar al CORE de seguros vía capa media WebLogic
  notifyCore(newId, `Creación de nueva póliza ${tipo} ${numeroPoliza}`);

  res.status(201).json({
    exito: true,
    mensaje: 'Póliza creada exitosamente y sincronizada con el CORE de seguros',
    datos: nuevaPoliza
  });
});

// 2. GET /api/polizas/:id/riesgos
app.get('/api/polizas/:id/riesgos', apiKeyMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const poliza = polizas.find(p => p.id === id);
  if (!poliza) {
    return res.status(404).json({ exito: false, mensaje: `Póliza no encontrada con ID: ${id}` });
  }
  const rList = riesgos.filter(r => r.polizaId === id);
  res.json({
    exito: true,
    mensaje: 'Riesgos de la póliza obtenidos exitosamente',
    datos: rList
  });
});

// 3. POST /api/polizas/:id/renovar
// Incrementa canon y prima en +IPC. Estado pasa a "RENOVADA".
app.post('/api/polizas/:id/renovar', apiKeyMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const poliza = polizas.find(p => p.id === id);
  if (!poliza) {
    return res.status(404).json({ exito: false, mensaje: `Póliza no encontrada con ID: ${id}` });
  }

  // Regla de Negocio: No se puede renovar una póliza cancelada
  if (poliza.estado === 'CANCELADA') {
    return res.status(422).json({
      exito: false,
      mensaje: 'Regla de Negocio Incumplida: No se puede renovar una póliza que se encuentra CANCELADA.'
    });
  }

  const porcentajeIpc = req.body.porcentajeIpc ? parseFloat(req.body.porcentajeIpc) : 9.28;
  const factor = 1 + porcentajeIpc / 100;
  const nuevoCanon = Math.round(poliza.canonMensual * factor);
  const nuevaPrima = Math.round(nuevoCanon * poliza.vigenciaMeses);

  poliza.canonMensual = nuevoCanon;
  poliza.primaTotal = nuevaPrima;
  poliza.estado = 'RENOVADA';
  poliza.porcentajeIpcUltimaRenovacion = porcentajeIpc;
  poliza.fechaUltimaRenovacion = new Date().toISOString().split('T')[0];

  // Renovar por el mismo periodo inicial
  poliza.fechaInicio = poliza.fechaFin;
  const d = new Date(poliza.fechaInicio);
  d.setMonth(d.getMonth() + poliza.vigenciaMeses);
  poliza.fechaFin = d.toISOString().split('T')[0];

  // Notificar al CORE
  notifyCore(poliza.id, `Renovación de póliza con incremento IPC (+${porcentajeIpc}%). Nuevo Canon: $${nuevoCanon.toLocaleString()}`);

  res.json({
    exito: true,
    mensaje: `Póliza renovada con éxito según IPC (+${porcentajeIpc}%)`,
    datos: poliza
  });
});

// 4. POST /api/polizas/:id/cancelar
// Cancela la póliza y todos sus riesgos
app.post('/api/polizas/:id/cancelar', apiKeyMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const poliza = polizas.find(p => p.id === id);
  if (!poliza) {
    return res.status(404).json({ exito: false, mensaje: `Póliza no encontrada con ID: ${id}` });
  }

  if (poliza.estado === 'CANCELADA') {
    return res.status(422).json({ exito: false, mensaje: 'La póliza ya se encuentra en estado CANCELADA.' });
  }

  poliza.estado = 'CANCELADA';

  // Regla de Negocio: La cancelación de una póliza cancela todos sus riesgos
  riesgos.forEach(r => {
    if (r.polizaId === id) {
      r.estado = 'CANCELADO';
    }
  });

  // Notificar al CORE
  notifyCore(poliza.id, 'Cancelación total de póliza y cascada automática a todos sus riesgos asociados');

  res.json({
    exito: true,
    mensaje: 'Póliza y todos sus riesgos asociados han sido cancelados exitosamente',
    datos: poliza
  });
});

// 5. POST /api/polizas/:id/riesgos
// Solo si tipo = Colectiva (o individual si tiene 0 riesgos)
app.post('/api/polizas/:id/riesgos', apiKeyMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const poliza = polizas.find(p => p.id === id);
  if (!poliza) {
    return res.status(404).json({ exito: false, mensaje: `Póliza no encontrada con ID: ${id}` });
  }

  if (poliza.estado === 'CANCELADA') {
    return res.status(422).json({ exito: false, mensaje: 'No se pueden agregar riesgos a una póliza en estado CANCELADA.' });
  }

  const riesgosActuales = riesgos.filter(r => r.polizaId === id && r.estado === 'ACTIVO');

  // Reglas de negocio esenciales:
  // - Una póliza individual solo puede tener 1 riesgo.
  // - Agregar riesgo exige validación del tipo de póliza.
  if (poliza.tipo === 'INDIVIDUAL' && riesgosActuales.length >= 1) {
    return res.status(422).json({
      exito: false,
      mensaje: 'Regla de Negocio Incumplida: Una póliza individual solo puede tener 1 riesgo. Solo las pólizas COLECTIVAS admiten agregar múltiples riesgos.'
    });
  }

  const { direccion, ciudad, valorCanon, descripcionInmueble, arrendatarioNombre, arrendatarioDoc } = req.body;
  if (!direccion || !arrendatarioNombre || !valorCanon) {
    return res.status(400).json({ exito: false, mensaje: 'Dirección, arrendatario y valor de canon son requeridos' });
  }

  const canon = parseFloat(valorCanon);
  const nuevoRiesgo: RiesgoItem = {
    id: riesgos.length > 0 ? Math.max(...riesgos.map(r => r.id)) + 1 : 1,
    polizaId: id,
    direccion,
    ciudad: ciudad || 'Bogotá D.C.',
    valorCanon: canon,
    descripcionInmueble: descripcionInmueble || 'Inmueble residencial',
    arrendatarioNombre,
    arrendatarioDoc: arrendatarioDoc || 'CC 00000000',
    estado: 'ACTIVO',
    fechaCreacion: new Date().toISOString().split('T')[0]
  };

  riesgos.push(nuevoRiesgo);

  // Si es colectiva, sumar canon
  if (poliza.tipo === 'COLECTIVA') {
    poliza.canonMensual += canon;
    poliza.primaTotal = poliza.canonMensual * poliza.vigenciaMeses;
  }

  notifyCore(poliza.id, `Nuevo riesgo agregado: ${direccion} (${arrendatarioNombre}). Canon: $${canon.toLocaleString()}`);

  res.status(201).json({
    exito: true,
    mensaje: 'Riesgo agregado exitosamente a la póliza',
    datos: nuevoRiesgo
  });
});

// 6. POST /api/riesgos/:id/cancelar
app.post('/api/riesgos/:id/cancelar', apiKeyMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const riesgo = riesgos.find(r => r.id === id);
  if (!riesgo) {
    return res.status(404).json({ exito: false, mensaje: `Riesgo no encontrado con ID: ${id}` });
  }

  if (riesgo.estado === 'CANCELADO') {
    return res.status(422).json({ exito: false, mensaje: 'El riesgo ya se encuentra en estado CANCELADO.' });
  }

  riesgo.estado = 'CANCELADO';
  const poliza = polizas.find(p => p.id === riesgo.polizaId);

  if (poliza && poliza.tipo === 'COLECTIVA') {
    poliza.canonMensual = Math.max(0, poliza.canonMensual - riesgo.valorCanon);
    poliza.primaTotal = poliza.canonMensual * poliza.vigenciaMeses;
  }

  if (poliza) {
    notifyCore(poliza.id, `Cancelación de riesgo ID ${id} (${riesgo.direccion}) notificada a WebLogic CORE`);
  }

  res.json({
    exito: true,
    mensaje: 'Riesgo cancelado exitosamente y notificado al CORE',
    datos: riesgo
  });
});

// 7. Mock Externo Obligatorio: POST /api/core-mock/evento
// Endpoint simple:
// POST /core-mock/evento
// { "evento": "ACTUALIZACION", "polizaId": 555 }
// Su único propósito: registrar en logs que la operación se intentó enviar al CORE.
app.post('/api/core-mock/evento', apiKeyMiddleware, (req, res) => {
  const { evento, polizaId } = req.body;
  const pId = parseInt(polizaId) || 555;
  const ev = evento || 'ACTUALIZACION';

  const logEntry = notifyCore(pId, `Llamada directa recibida en endpoint Mock Externo /core-mock/evento`);

  res.json({
    exito: true,
    mensaje: 'Evento registrado en logs de capa media WebLogic para CORE de seguros',
    datos: {
      evento: ev,
      polizaId: pId,
      logId: logEntry.id
    }
  });
});

// GET /api/core-mock/logs
app.get('/api/core-mock/logs', apiKeyMiddleware, (req, res) => {
  res.json({
    exito: true,
    datos: coreLogs
  });
});

// ==========================================
// REMINDERS API (Set Reminders & Monthly Tracker)
// ==========================================

app.get('/api/reminders', apiKeyMiddleware, (req, res) => {
  res.json({
    exito: true,
    datos: reminders
  });
});

app.post('/api/reminders', apiKeyMiddleware, (req, res) => {
  const { polizaId, titulo, descripcion, fechaLimite, prioridad, tipo, canal } = req.body;
  if (!titulo || !fechaLimite) {
    return res.status(400).json({ exito: false, mensaje: 'Título y fecha límite son obligatorios' });
  }

  const p = polizaId ? polizas.find(item => item.id === parseInt(polizaId)) : undefined;

  const newReminder: ReminderItem = {
    id: `rem-${Date.now()}`,
    polizaId: p?.id,
    numeroPoliza: p?.numeroPoliza,
    titulo,
    descripcion: descripcion || '',
    fechaLimite,
    prioridad: prioridad || 'MEDIA',
    tipo: tipo || 'RENOVACION',
    completado: false,
    canal: canal || 'EMAIL',
    creadoEn: new Date().toISOString().split('T')[0]
  };

  reminders.unshift(newReminder);
  res.status(201).json({
    exito: true,
    mensaje: 'Recordatorio programado con éxito',
    datos: newReminder
  });
});

app.patch('/api/reminders/:id/toggle', apiKeyMiddleware, (req, res) => {
  const { id } = req.params;
  const rem = reminders.find(r => r.id === id);
  if (!rem) {
    return res.status(404).json({ exito: false, mensaje: 'Recordatorio no encontrado' });
  }
  rem.completado = !rem.completado;
  res.json({
    exito: true,
    mensaje: `Recordatorio marcado como ${rem.completado ? 'completado' : 'pendiente'}`,
    datos: rem
  });
});

app.delete('/api/reminders/:id', apiKeyMiddleware, (req, res) => {
  const { id } = req.params;
  const index = reminders.findIndex(r => r.id === id);
  if (index === -1) {
    return res.status(404).json({ exito: false, mensaje: 'Recordatorio no encontrado' });
  }
  reminders.splice(index, 1);
  res.json({ exito: true, mensaje: 'Recordatorio eliminado' });
});

// GET /api/monthly-metrics - Métricas de progreso mensual
app.get('/api/monthly-metrics', apiKeyMiddleware, (req, res) => {
  const activas = polizas.filter(p => p.estado === 'ACTIVA');
  const renovadas = polizas.filter(p => p.estado === 'RENOVADA');
  const canceladas = polizas.filter(p => p.estado === 'CANCELADA');
  const colectivas = polizas.filter(p => p.tipo === 'COLECTIVA');
  const individuales = polizas.filter(p => p.tipo === 'INDIVIDUAL');

  const canonTotalActivo = [...activas, ...renovadas].reduce((acc, p) => acc + p.canonMensual, 0);
  const primasTotalesActivas = [...activas, ...renovadas].reduce((acc, p) => acc + p.primaTotal, 0);
  const totalRiesgosActivos = riesgos.filter(r => r.estado === 'ACTIVO').length;

  const monthlyHistory = [
    { mes: 'Mayo 2026', mesCorto: 'May', polizasActivas: 18, renovacionesMeta: 6, renovacionesRealizadas: 5, canonTotal: 38500000, primasTotales: 462000000, ipcPromedio: 9.2 },
    { mes: 'Junio 2026', mesCorto: 'Jun', polizasActivas: 21, renovacionesMeta: 7, renovacionesRealizadas: 7, canonTotal: 44200000, primasTotales: 530400000, ipcPromedio: 9.3 },
    { mes: 'Julio 2026', mesCorto: 'Jul', polizasActivas: 23, renovacionesMeta: 8, renovacionesRealizadas: 8, canonTotal: 48900000, primasTotales: 586800000, ipcPromedio: 9.1 },
    { mes: 'Agosto 2026', mesCorto: 'Ago', polizasActivas: 24, renovacionesMeta: 10, renovacionesRealizadas: 9, canonTotal: 52400000, primasTotales: 628800000, ipcPromedio: 9.28 },
    { mes: 'Septiembre 2026', mesCorto: 'Sep', polizasActivas: 26, renovacionesMeta: 12, renovacionesRealizadas: 11, canonTotal: canonTotalActivo, primasTotales: primasTotalesActivas, ipcPromedio: 9.28 },
    { mes: 'Octubre 2026 (Proyectado)', mesCorto: 'Oct', polizasActivas: 28, renovacionesMeta: 14, renovacionesRealizadas: 0, canonTotal: canonTotalActivo * 1.08, primasTotales: primasTotalesActivas * 1.08, ipcPromedio: 9.2 }
  ];

  res.json({
    exito: true,
    datos: {
      totalPolizas: polizas.length,
      activasCount: activas.length,
      renovadasCount: renovadas.length,
      canceladasCount: canceladas.length,
      colectivasCount: colectivas.length,
      individualesCount: individuales.length,
      canonTotalActivo,
      primasTotalesActivas,
      totalRiesgosActivos,
      metaMensualRenovaciones: 12,
      renovacionesEsteMes: renovadas.length,
      porcentajeMetaAlcanzada: Math.min(100, Math.round((renovadas.length / 12) * 100)),
      history: monthlyHistory
    }
  });
});

// Endpoint de prueba de salud
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Polizas Management System',
    backend: 'Spring Boot Contract & Node Runtime',
    time: new Date().toISOString()
  });
});

// Vite middleware setup
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SegurosPolizas Server running on http://0.0.0.0:${PORT}`);
  });
}

start();

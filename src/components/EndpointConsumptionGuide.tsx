import React, { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  Send, 
  Code2, 
  KeyRound, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Globe,
  FileJson,
  Play,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { getApiKey } from '../lib/api';

interface EndpointDefinition {
  id: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  title: string;
  category: string;
  description: string;
  requiredHeaders: Record<string, string>;
  queryParams?: { name: string; type: string; required: boolean; description: string; default?: string }[];
  pathParams?: { name: string; type: string; description: string; example: string }[];
  requestBody?: any;
  successResponseExample: any;
  errorResponses: { status: number; message: string; cause: string }[];
}

export const EndpointConsumptionGuide: React.FC = () => {
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>('get-polizas');
  const [codeLanguage, setCodeLanguage] = useState<'curl' | 'javascript' | 'java' | 'python'>('curl');
  const [copiedCode, setCopiedCode] = useState(false);

  // Interactive Live Tester state
  const [testPathParams, setTestPathParams] = useState<Record<string, string>>({ id: '1' });
  const [testQueryParams, setTestQueryParams] = useState<Record<string, string>>({ tipo: 'ALL', estado: 'ACTIVA' });
  const [testBody, setTestBody] = useState<string>('{\n  "porcentajeIpc": 9.28\n}');
  const [liveResponse, setLiveResponse] = useState<any | null>(null);
  const [liveStatusCode, setLiveStatusCode] = useState<number | null>(null);
  const [liveDuration, setLiveDuration] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const currentApiKey = getApiKey();

  const endpoints: EndpointDefinition[] = [
    {
      id: 'get-polizas',
      method: 'GET',
      path: '/api/polizas',
      title: 'Listar y Filtrar Pólizas',
      category: 'Módulo 2 • Pólizas',
      description: 'Obtiene el listado completo de pólizas con soporte de filtros opcionales por Tipo (INDIVIDUAL, COLECTIVA) y Estado (ACTIVA, RENOVADA, CANCELADA).',
      requiredHeaders: {
        'x-api-key': '123456',
        'Accept': 'application/json',
      },
      queryParams: [
        { name: 'tipo', type: 'string', required: false, description: 'Filtrar por INDIVIDUAL o COLECTIVA' },
        { name: 'estado', type: 'string', required: false, description: 'Filtrar por ACTIVA, RENOVADA o CANCELADA' },
      ],
      successResponseExample: {
        exito: true,
        mensaje: "Pólizas obtenidas exitosamente",
        datos: [
          {
            id: 1,
            numeroPoliza: "POL-IND-2026-001",
            tipo: "INDIVIDUAL",
            estado: "ACTIVA",
            tomador: "Santiago Restrepo",
            tomadorDoc: "CC 1017245890",
            asegurado: "Santiago Restrepo",
            beneficiario: "Inversiones Bolívar S.A.S.",
            vigenciaMeses: 12,
            fechaInicio: "2026-01-15",
            fechaFin: "2027-01-15",
            canonMensual: 2850000,
            primaTotal: 34200000,
            riesgos: [
              {
                id: 101,
                direccion: "Calle 116 # 18B-24 Apto 402",
                ciudad: "Bogotá D.C.",
                valorCanon: 2850000,
                estado: "ACTIVO"
              }
            ]
          }
        ]
      },
      errorResponses: [
        { status: 401, message: "No autorizado. Header x-api-key ausente o invalido.", cause: "Falta el header x-api-key o no coincide con '123456'" },
      ]
    },
    {
      id: 'get-riesgos',
      method: 'GET',
      path: '/api/polizas/{id}/riesgos',
      title: 'Listar Riesgos de una Póliza',
      category: 'Módulo 2 • Riesgos',
      description: 'Devuelve todos los inmuebles o riesgos asociados al contrato especificado por {id}.',
      requiredHeaders: {
        'x-api-key': '123456',
      },
      pathParams: [
        { name: 'id', type: 'number', description: 'ID numérico de la póliza', example: '1' }
      ],
      successResponseExample: {
        exito: true,
        datos: [
          {
            id: 101,
            polizaId: 1,
            direccion: "Calle 116 # 18B-24 Apto 402",
            ciudad: "Bogotá D.C.",
            valorCanon: 2850000,
            arrendatarioNombre: "Santiago Restrepo",
            arrendatarioDoc: "CC 1017245890",
            estado: "ACTIVO"
          }
        ]
      },
      errorResponses: [
        { status: 401, message: "No autorizado.", cause: "Header x-api-key ausente o inválido" },
        { status: 404, message: "Póliza con id 999 no encontrada.", cause: "La póliza no existe en el repositorio" },
      ]
    },
    {
      id: 'post-renovar',
      method: 'POST',
      path: '/api/polizas/{id}/renovar',
      title: 'Renovar Póliza (+IPC)',
      category: 'Módulo 2 • Ciclo de Vida',
      description: 'Renueva la póliza por el mismo periodo de vigencia incrementando el canon mensual y la prima según el % de IPC enviado en el body. Cambia el estado a RENOVADA y notifica al CORE en WebLogic.',
      requiredHeaders: {
        'Content-Type': 'application/json',
        'x-api-key': '123456',
      },
      pathParams: [
        { name: 'id', type: 'number', description: 'ID numérico de la póliza a renovar', example: '1' }
      ],
      requestBody: {
        porcentajeIpc: 9.28
      },
      successResponseExample: {
        exito: true,
        mensaje: "Póliza renovada con éxito según IPC (+9.28%)",
        datos: {
          id: 1,
          numeroPoliza: "POL-IND-2026-001",
          tipo: "INDIVIDUAL",
          estado: "RENOVADA",
          canonMensual: 3114480,
          primaTotal: 37373760,
          porcentajeIpcUltimaRenovacion: 9.28,
          fechaFin: "2028-01-15"
        }
      },
      errorResponses: [
        { status: 401, message: "No autorizado.", cause: "Header x-api-key ausente o inválido" },
        { status: 422, message: "Regla de negocio: No se puede renovar una póliza CANCELADA.", cause: "La póliza ya se encuentra cancelada" },
        { status: 400, message: "El porcentaje de IPC debe ser mayor o igual a cero.", cause: "Payload JSON inválido" }
      ]
    },
    {
      id: 'post-cancelar-poliza',
      method: 'POST',
      path: '/api/polizas/{id}/cancelar',
      title: 'Cancelar Póliza en Cascada',
      category: 'Módulo 2 • Ciclo de Vida',
      description: 'Cancela la póliza y ejecuta la regla de negocio en cascada cancelando todos sus riesgos asociados. Notifica al servicio agnóstico en WebLogic.',
      requiredHeaders: {
        'x-api-key': '123456',
      },
      pathParams: [
        { name: 'id', type: 'number', description: 'ID de la póliza a cancelar', example: '1' }
      ],
      successResponseExample: {
        exito: true,
        mensaje: "Póliza y todos sus riesgos cancelados con éxito",
        datos: {
          id: 1,
          numeroPoliza: "POL-IND-2026-001",
          estado: "CANCELADA"
        }
      },
      errorResponses: [
        { status: 401, message: "No autorizado.", cause: "Header x-api-key ausente o inválido" },
        { status: 404, message: "Póliza no encontrada.", cause: "ID inexistente" }
      ]
    },
    {
      id: 'post-add-riesgo',
      method: 'POST',
      path: '/api/polizas/{id}/riesgos',
      title: 'Agregar Riesgo a Póliza (Validación Colectiva)',
      category: 'Módulo 2 • Riesgos',
      description: 'Agrega un nuevo riesgo. Exige validación de negocio: si la póliza es INDIVIDUAL solo puede tener 1 riesgo; si es COLECTIVA admite 1..N riesgos.',
      requiredHeaders: {
        'Content-Type': 'application/json',
        'x-api-key': '123456',
      },
      pathParams: [
        { name: 'id', type: 'number', description: 'ID de la póliza', example: '2' }
      ],
      requestBody: {
        direccion: "Cra 7 # 72-11 Torre B Of 801",
        ciudad: "Bogotá D.C.",
        valorCanon: 3800000,
        descripcionInmueble: "Oficina corporativa",
        arrendatarioNombre: "Consultores Financieros S.A.S.",
        arrendatarioDoc: "NIT 901234567-1"
      },
      successResponseExample: {
        exito: true,
        mensaje: "Riesgo agregado exitosamente",
        datos: {
          id: 106,
          polizaId: 2,
          direccion: "Cra 7 # 72-11 Torre B Of 801",
          valorCanon: 3800000,
          estado: "ACTIVO"
        }
      },
      errorResponses: [
        { status: 422, message: "Regla de negocio: Una póliza individual solo puede tener 1 riesgo.", cause: "Se intentó agregar un segundo riesgo a una póliza INDIVIDUAL" },
        { status: 422, message: "No se pueden agregar riesgos a una póliza CANCELADA.", cause: "Póliza inactiva" }
      ]
    },
    {
      id: 'post-core-mock',
      method: 'POST',
      path: '/api/core-mock/evento',
      title: 'Mock Externo Obligatorio (WebLogic CORE)',
      category: 'Módulo 2 • Integración WebLogic',
      description: 'Endpoint mock de capa media para registrar en logs y bitácora que la operación de negocio se intentó enviar al sistema CORE.',
      requiredHeaders: {
        'Content-Type': 'application/json',
        'x-api-key': '123456',
      },
      requestBody: {
        evento: "ACTUALIZACION",
        polizaId: 555
      },
      successResponseExample: {
        exito: true,
        mensaje: "Evento procesado y registrado en bitácora de auditoría WebLogic CORE",
        datos: {
          id: "log-1789784499",
          evento: "ACTUALIZACION",
          polizaId: 555,
          timestamp: "2026-09-19T03:00:00.000Z",
          statusCode: 200
        }
      },
      errorResponses: [
        { status: 401, message: "No autorizado. Header x-api-key requerido.", cause: "Header de seguridad ausente" },
        { status: 400, message: "Body incompleto: 'evento' y 'polizaId' son obligatorios.", cause: "Faltan campos requeridos" }
      ]
    },
    {
      id: 'get-monthly-metrics',
      method: 'GET',
      path: '/api/monthly-metrics',
      title: 'Progreso Mensual & Metas de Cartera',
      category: 'Dashboard • Métricas',
      description: 'Retorna los KPIs agregados de cartera: canon total activo, primas anualizadas, cumplimiento de metas de renovación e historial mes a mes.',
      requiredHeaders: {
        'x-api-key': '123456',
      },
      successResponseExample: {
        exito: true,
        datos: {
          totalPolizas: 5,
          activasCount: 3,
          renovadasCount: 1,
          canonTotalActivo: 28900000,
          metaMensualRenovaciones: 12,
          renovacionesEsteMes: 1,
          history: [
            { mes: "Septiembre 2026", canonTotal: 28900000, renovacionesRealizadas: 11, ipcPromedio: 9.28 }
          ]
        }
      },
      errorResponses: [
        { status: 401, message: "No autorizado.", cause: "Falta x-api-key: 123456" }
      ]
    }
  ];

  const currentEndpoint = endpoints.find(e => e.id === selectedEndpointId) || endpoints[0];

  // Code Snippet Generator
  const generateSnippet = (lang: string, ep: EndpointDefinition) => {
    let fullPath = ep.path;
    if (ep.pathParams) {
      ep.pathParams.forEach(p => {
        fullPath = fullPath.replace(`{${p.name}}`, testPathParams[p.name] || p.example);
      });
    }

    const host = window.location.origin;
    const url = `${host}${fullPath}`;

    if (lang === 'curl') {
      let cmd = `curl -X ${ep.method} "${url}" \\\n  -H "x-api-key: ${currentApiKey}"`;
      if (ep.method === 'POST' || ep.method === 'PATCH') {
        cmd += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(ep.requestBody || {}, null, 2).replace(/'/g, "'\\''")}'`;
      }
      return cmd;
    }

    if (lang === 'javascript') {
      const options: any = {
        method: ep.method,
        headers: {
          'x-api-key': currentApiKey,
        }
      };
      if (ep.method === 'POST' || ep.method === 'PATCH') {
        options.headers['Content-Type'] = 'application/json';
        options.body = 'JSON.stringify(' + JSON.stringify(ep.requestBody || {}, null, 2) + ')';
      }

      return `// Consumo con Fetch API en React / JavaScript
const consumirEndpoint = async () => {
  try {
    const response = await fetch("${url}", {
      method: "${ep.method}",
      headers: {
        "x-api-key": "${currentApiKey}",
        ${ep.requestBody ? '"Content-Type": "application/json"' : ''}
      },
      ${ep.requestBody ? `body: JSON.stringify(${JSON.stringify(ep.requestBody, null, 2)})` : ''}
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.mensaje || \`HTTP error! status: \${response.status}\`);
    }

    const json = await response.json();
    console.log("Datos recibidos:", json.datos);
    return json.datos;
  } catch (error) {
    console.error("Error al consumir ${ep.path}:", error);
  }
};`;
    }

    if (lang === 'java') {
      return `// Consumo en Spring Boot usando WebClient o RestTemplate
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

public class PolizasApiClient {

    private final WebClient webClient;

    public PolizasApiClient() {
        this.webClient = WebClient.builder()
                .baseUrl("${host}")
                .defaultHeader("x-api-key", "${currentApiKey}")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public void ejecutarPeticion() {
        var respuesta = webClient.${ep.method.toLowerCase()}()
                .uri("${fullPath}")
                ${ep.requestBody ? `.bodyValue(${JSON.stringify(ep.requestBody)})` : ''}
                .retrieve()
                .bodyToMono(String.class)
                .block();

        System.out.println("Respuesta del servidor: " + respuesta);
    }
}`;
    }

    if (lang === 'python') {
      return `# Consumo en Python con biblioteca requests
import requests

url = "${url}"
headers = {
    "x-api-key": "${currentApiKey}",
    ${ep.requestBody ? '"Content-Type": "application/json"' : ''}
}
${ep.requestBody ? `payload = ${JSON.stringify(ep.requestBody, null, 2)}` : ''}

response = requests.${ep.method.toLowerCase()}(
    url,
    headers=headers,
    ${ep.requestBody ? 'json=payload' : ''}
)

if response.status_code == 200:
    print("Datos:", response.json())
else:
    print(f"Error {response.status_code}:", response.text)
`;
    }

    return '';
  };

  const handleCopySnippet = () => {
    const code = generateSnippet(codeLanguage, currentEndpoint);
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Run live test through current browser
  const handleExecuteLiveTest = async () => {
    setIsExecuting(true);
    setLiveResponse(null);
    setLiveStatusCode(null);
    const start = performance.now();

    let fullPath = currentEndpoint.path;
    if (currentEndpoint.pathParams) {
      currentEndpoint.pathParams.forEach(p => {
        const val = testPathParams[p.name] || p.example;
        fullPath = fullPath.replace(`{${p.name}}`, val);
      });
    }

    if (currentEndpoint.queryParams && currentEndpoint.id === 'get-polizas') {
      const q = new URLSearchParams();
      if (testQueryParams.tipo && testQueryParams.tipo !== 'ALL') q.append('tipo', testQueryParams.tipo);
      if (testQueryParams.estado && testQueryParams.estado !== 'ALL') q.append('estado', testQueryParams.estado);
      if (q.toString()) fullPath += `?${q.toString()}`;
    }

    try {
      const headers: Record<string, string> = {
        'x-api-key': currentApiKey,
        'Accept': 'application/json',
      };
      if (currentEndpoint.method === 'POST' || currentEndpoint.method === 'PATCH') {
        headers['Content-Type'] = 'application/json';
      }

      const options: RequestInit = {
        method: currentEndpoint.method,
        headers,
      };

      if (currentEndpoint.method === 'POST' || currentEndpoint.method === 'PATCH') {
        let bodyToSend = testBody;
        if (currentEndpoint.id !== 'post-renovar' && currentEndpoint.requestBody) {
          bodyToSend = JSON.stringify(currentEndpoint.requestBody);
        }
        options.body = bodyToSend;
      }

      const res = await fetch(fullPath, options);
      const elapsed = Math.round(performance.now() - start);
      setLiveDuration(elapsed);
      setLiveStatusCode(res.status);

      const json = await res.json();
      setLiveResponse(json);
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - start);
      setLiveDuration(elapsed);
      setLiveStatusCode(500);
      setLiveResponse({ error: err.message || 'Error de red o conexión' });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 text-slate-100 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Sección Exclusiva • Consumo de Endpoints
              </span>
              <span className="text-xs text-slate-400 font-mono">REST API Specification</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Globe className="w-7 h-7 text-teal-400" />
              <span>Cómo Consumir Datos a Través de los Endpoints</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Guía técnica exhaustiva para integrar y consumir los servicios del backend. Incluye especificación de contratos, autenticación por cabecera, ejemplos en múltiples lenguajes (cURL, JavaScript, Spring Boot, Python) y un cliente interactivo para ejecutar llamadas en vivo.
            </p>
          </div>

          {/* Key status badge */}
          <div className="bg-slate-950/80 border border-slate-700 rounded-xl p-3.5 min-w-[240px] text-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-semibold">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" /> Cabecera Requerida:
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
                Obligatorio
              </span>
            </div>
            <div className="font-mono text-emerald-300 font-bold text-sm bg-slate-900 p-1.5 rounded border border-slate-800 flex items-center justify-between">
              <span>x-api-key: {currentApiKey}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Sin esta cabecera el servidor rechazará la petición con HTTP 401 Unauthorized.
            </span>
          </div>
        </div>

        {/* 3 Steps summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
          <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800">
            <span className="font-bold text-teal-300 block mb-1">1. Autenticación & Headers</span>
            <p className="text-slate-400 text-[11px]">
              Toda solicitud debe incluir <code className="text-emerald-400 font-mono">x-api-key: 123456</code> y para operaciones POST/PATCH el encabezado <code className="text-slate-300 font-mono">Content-Type: application/json</code>.
            </p>
          </div>
          <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800">
            <span className="font-bold text-teal-300 block mb-1">2. Estructura de Respuesta Unificada</span>
            <p className="text-slate-400 text-[11px]">
              Las respuestas retornan formato estándar JSON: <code className="text-slate-300 font-mono">&#123; exito: boolean, mensaje: string, datos: T &#125;</code> facilitando la deserialización.
            </p>
          </div>
          <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800">
            <span className="font-bold text-teal-300 block mb-1">3. Códigos de Estado Semánticos</span>
            <p className="text-slate-400 text-[11px]">
              <span className="text-emerald-400">200/201 OK</span> éxito, <span className="text-rose-400">401</span> no autorizado, <span className="text-amber-400">422</span> violación de regla de negocio, <span className="text-blue-400">404</span> no encontrado.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Endpoint Selector | Right Details & Live Runner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Endpoints Menu (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-teal-400" />
                <span>Endpoints Disponibles ({endpoints.length})</span>
              </span>
            </div>

            <div className="space-y-1.5">
              {endpoints.map((ep) => {
                const isSelected = ep.id === selectedEndpointId;
                const methodColor = 
                  ep.method === 'GET' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                  ep.method === 'POST' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                  ep.method === 'PATCH' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                  'bg-rose-500/10 text-rose-400 border-rose-500/30';

                return (
                  <button
                    key={ep.id}
                    onClick={() => {
                      setSelectedEndpointId(ep.id);
                      setLiveResponse(null);
                      setLiveStatusCode(null);
                    }}
                    className={`w-full p-3 rounded-xl text-left transition-all flex flex-col gap-1 border ${
                      isSelected
                        ? 'bg-slate-800/90 border-teal-500/80 shadow-md ring-1 ring-teal-500/40'
                        : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${methodColor}`}>
                          {ep.method}
                        </span>
                        <span className="text-xs font-bold text-white truncate">{ep.title}</span>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 truncate pl-0.5">
                      {ep.path}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5">{ep.category}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Endpoint Specification & Code Generator & Live Sandbox (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Endpoint Details Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                    currentEndpoint.method === 'GET' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                    currentEndpoint.method === 'POST' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {currentEndpoint.method}
                  </span>
                  <span className="font-mono text-sm font-bold text-white bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                    {currentEndpoint.path}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-2">{currentEndpoint.title}</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{currentEndpoint.description}</p>
              </div>

              {/* Quick test button */}
              <button
                onClick={handleExecuteLiveTest}
                disabled={isExecuting}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow flex items-center gap-2 transition active:scale-95 whitespace-nowrap self-start sm:self-center"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isExecuting ? 'Ejecutando...' : 'Probar en Vivo'}</span>
              </button>
            </div>

            {/* Parameters Table */}
            {(currentEndpoint.pathParams || currentEndpoint.queryParams) && (
              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-300 block uppercase text-[11px] tracking-wider">
                  Parámetros de Entrada
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300 border border-slate-800 rounded-xl overflow-hidden">
                    <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase font-semibold">
                      <tr>
                        <th className="p-2.5">Nombre</th>
                        <th className="p-2.5">Ubicación</th>
                        <th className="p-2.5">Tipo</th>
                        <th className="p-2.5">Descripción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                      {currentEndpoint.pathParams?.map(p => (
                        <tr key={p.name}>
                          <td className="p-2.5 font-mono text-teal-300 font-bold">{p.name}</td>
                          <td className="p-2.5"><span className="bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded text-[10px]">Path</span></td>
                          <td className="p-2.5 font-mono text-slate-400">{p.type}</td>
                          <td className="p-2.5 text-slate-300">{p.description} (ej: {p.example})</td>
                        </tr>
                      ))}
                      {currentEndpoint.queryParams?.map(q => (
                        <tr key={q.name}>
                          <td className="p-2.5 font-mono text-blue-300 font-bold">{q.name}</td>
                          <td className="p-2.5"><span className="bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded text-[10px]">Query</span></td>
                          <td className="p-2.5 font-mono text-slate-400">{q.type}</td>
                          <td className="p-2.5 text-slate-300">{q.description} {q.required ? '(Requerido)' : '(Opcional)'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Code Snippets Section with Language Tabs */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-bold text-slate-300 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span>Código de Consumo Listo para Usar</span>
                </span>

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  {(['curl', 'javascript', 'java', 'python'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setCodeLanguage(lang)}
                      className={`px-3 py-1 rounded-lg font-medium transition uppercase text-[11px] ${
                        codeLanguage === lang
                          ? 'bg-teal-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang === 'javascript' ? 'JavaScript / React' : lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-72">
                  {generateSnippet(codeLanguage, currentEndpoint)}
                </pre>
                <button
                  onClick={handleCopySnippet}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 flex items-center gap-1.5 transition backdrop-blur-xs"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Error handling documentation */}
            <div className="space-y-2 pt-2 text-xs">
              <span className="font-bold text-slate-300 uppercase text-[11px] tracking-wider block">
                Manejo de Errores & Códigos HTTP
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentEndpoint.errorResponses.map((err, i) => (
                  <div key={i} className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        err.status === 401 ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        err.status === 422 ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        HTTP {err.status}
                      </span>
                      <span className="text-[11px] text-slate-300 font-medium">{err.cause}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">{err.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Live Response Sandbox Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-white text-base">Consola de Ejecución en Vivo (Sandbox)</h3>
              </div>

              {liveStatusCode !== null && (
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    liveStatusCode >= 200 && liveStatusCode < 300 
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    HTTP {liveStatusCode}
                  </span>
                  <span className="text-slate-400">{liveDuration} ms</span>
                </div>
              )}
            </div>

            {/* Custom input controls if POST renovar */}
            {currentEndpoint.id === 'post-renovar' && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                <label className="text-slate-300 font-semibold block">Payload Body para Renovación:</label>
                <textarea
                  rows={3}
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-xs text-teal-300 focus:outline-none focus:border-teal-500"
                />
              </div>
            )}

            {/* Custom input controls if GET polizas filters */}
            {currentEndpoint.id === 'get-polizas' && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Query ?tipo=</label>
                  <select
                    value={testQueryParams.tipo}
                    onChange={(e) => setTestQueryParams({ ...testQueryParams, tipo: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                  >
                    <option value="ALL">Todos</option>
                    <option value="INDIVIDUAL">INDIVIDUAL</option>
                    <option value="COLECTIVA">COLECTIVA</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Query ?estado=</label>
                  <select
                    value={testQueryParams.estado}
                    onChange={(e) => setTestQueryParams({ ...testQueryParams, estado: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                  >
                    <option value="ALL">Todos</option>
                    <option value="ACTIVA">ACTIVA</option>
                    <option value="RENOVADA">RENOVADA</option>
                    <option value="CANCELADA">CANCELADA</option>
                  </select>
                </div>
              </div>
            )}

            {/* Live Response Output or Example Placeholder */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-semibold">
                  {liveResponse ? 'Respuesta Real del Servidor:' : 'Ejemplo de Respuesta Esperada (200 OK):'}
                </span>
                {liveResponse && (
                  <button
                    onClick={() => setLiveResponse(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto max-h-72 leading-relaxed">
                {JSON.stringify(liveResponse || currentEndpoint.successResponseExample, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

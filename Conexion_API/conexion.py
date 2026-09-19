# Cliente Terminal - Seguros Polizas Bolivar
# Consume los 7 endpoints del Modulo 2 + Dashboard
# Requiere: pip install requests
# Uso: python conexion.py

import json
import sys

try:
    import requests
except ImportError:
    print("Falta la libreria 'requests'. Instalala con: pip install requests")
    sys.exit(1)


# ---------------------------------------------------------------- Config
BASE_URL = "https://segurospolizas-bolivar.ai.studio"
API_KEY = "123456"
HEADERS = {"x-api-key": API_KEY, "Content-Type": "application/json"}
TIMEOUT = 15


# ------------------------------------------------------- Estilo terminal
class C:
    RESET = "\033[0m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    RED = "\033[91m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    MAGENTA = "\033[95m"
    CYAN = "\033[96m"
    WHITE = "\033[97m"
    BG_BLUE = "\033[44m"
    BG_GREEN = "\033[42m"


def banner():
    print(C.BG_BLUE + C.WHITE + C.BOLD)
    print("  SEGUROS BOLIVAR - CONEXION API (Modulo 2 + Dashboard)  ".center(70))
    print(C.RESET + C.CYAN + "  Base: " + BASE_URL + C.RESET)
    print(C.DIM + "  x-api-key configurado | Timeout 15s" + C.RESET)
    print("-" * 70)


def menu():
    print()
    print(C.BOLD + C.WHITE + "  ENDPOINTS DISPONIBLES (7)" + C.RESET)
    print(C.GREEN + "  [1] " + C.RESET + "GET  " + C.CYAN + "/api/polizas" + C.RESET + "                 Listar y Filtrar Polizas")
    print(C.GREEN + "  [2] " + C.RESET + "GET  " + C.CYAN + "/api/polizas/{id}/riesgos" + C.RESET + "    Listar Riesgos de una Poliza")
    print(C.YELLOW + "  [3] " + C.RESET + "POST " + C.CYAN + "/api/polizas/{id}/renovar" + C.RESET + "     Renovar Poliza (+IPC)")
    print(C.RED + "  [4] " + C.RESET + "POST " + C.CYAN + "/api/polizas/{id}/cancelar" + C.RESET + "    Cancelar Poliza en Cascada")
    print(C.YELLOW + "  [5] " + C.RESET + "POST " + C.CYAN + "/api/polizas/{id}/riesgos" + C.RESET + "    Agregar Riesgo (Valid. Colectiva)")
    print(C.MAGENTA + "  [6] " + C.RESET + "POST " + C.CYAN + "/api/core-mock/evento" + C.RESET + "       Mock Externo (WebLogic CORE)")
    print(C.BLUE + "  [7] " + C.RESET + "GET  " + C.CYAN + "/api/monthly-metrics" + C.RESET + "          Progreso Mensual & Metas")
    print(C.DIM + "  [0]  Salir" + C.RESET)
    print("-" * 70)


def titulo_endpoint(metodo, ruta, descripcion):
    color = C.GREEN if metodo == "GET" else (C.RED if "cancelar" in ruta else C.YELLOW)
    if "core-mock" in ruta:
        color = C.MAGENTA
    if "monthly" in ruta:
        color = C.BLUE
    print()
    print(color + C.BOLD + f" {metodo} {ruta}" + C.RESET + C.DIM + f"  - {descripcion}" + C.RESET)
    print("-" * 70)


def pedir(texto, defecto=""):
    suf = f" [{defecto}]" if defecto else ""
    val = input(C.BOLD + f"  > {texto}{suf}: " + C.RESET).strip()
    return val if val else defecto


def mostrar_respuesta(resp):
    print(f"  Status: {colorea_status(resp.status_code)}")
    try:
        data = resp.json()
        print(C.DIM + "  Respuesta JSON:" + C.RESET)
        print(C.WHITE + json.dumps(data, indent=2, ensure_ascii=False) + C.RESET)
        # Resumen rapido si es lista
        if isinstance(data, list):
            print(C.CYAN + f"  -> {len(data)} registro(s) recibidos." + C.RESET)
        elif isinstance(data, dict):
            for k in ("data", "polizas", "riesgos", "items", "results"):
                if k in data and isinstance(data[k], list):
                    print(C.CYAN + f"  -> {len(data[k])} registro(s) en '{k}'." + C.RESET)
                    break
    except Exception:
        print(C.DIM + "  Respuesta (texto):" + C.RESET)
        print(resp.text[:3000])


def colorea_status(code):
    if 200 <= code < 300:
        return C.GREEN + C.BOLD + str(code) + " OK" + C.RESET
    if 400 <= code < 500:
        return C.YELLOW + C.BOLD + str(code) + " Error cliente" + C.RESET
    return C.RED + C.BOLD + str(code) + " Error" + C.RESET


def llamar(metodo, ruta, params=None, payload=None):
    url = BASE_URL + ruta
    print(C.DIM + f"  {metodo} {url}" + C.RESET)
    if params:
        print(C.DIM + f"  Params: {params}" + C.RESET)
    if payload:
        print(C.DIM + f"  Body: {json.dumps(payload, ensure_ascii=False)}" + C.RESET)
    try:
        if metodo == "GET":
            r = requests.get(url, headers=HEADERS, params=params, timeout=TIMEOUT)
        else:
            r = requests.post(url, headers=HEADERS, params=params,
                              json=payload, timeout=TIMEOUT)
        mostrar_respuesta(r)
    except requests.exceptions.ConnectionError:
        print(C.RED + "  [X] Error de conexion. Verifica internet o BASE_URL." + C.RESET)
    except requests.exceptions.Timeout:
        print(C.RED + "  [X] Timeout (15s). El servidor no respondio." + C.RESET)
    except Exception as e:
        print(C.RED + f"  [X] Error inesperado: {e}" + C.RESET)
    input(C.DIM + "\n  Pulsa ENTER para volver al menu..." + C.RESET)


# ---------------------------------------------------------- 1..7
def ep_listar_polizas():
    titulo_endpoint("GET", "/api/polizas", "Listar y Filtrar Polizas")
    print(C.DIM + "  Filtros opcionales (ENTER = omitir)" + C.RESET)
    estado = pedir("estado (ej: activa, vencida, cancelada)")
    cliente = pedir("cliente / documento / nombre")
    page = pedir("page", "1")
    limit = pedir("limit", "20")
    params = {}
    if estado:
        params["estado"] = estado
    if cliente:
        params["cliente"] = cliente
    if page:
        params["page"] = page
    if limit:
        params["limit"] = limit
    llamar("GET", "/api/polizas", params=params or None)


def ep_listar_riesgos():
    titulo_endpoint("GET", "/api/polizas/{id}/riesgos", "Listar Riesgos de una Poliza")
    pid = pedir("ID de poliza (obligatorio)")
    if not pid:
        print(C.RED + "  [!] El ID es obligatorio." + C.RESET)
        return
    llamar("GET", f"/api/polizas/{pid}/riesgos")


def ep_renovar():
    titulo_endpoint("POST", "/api/polizas/{id}/renovar", "Renovar Poliza (+IPC)")
    pid = pedir("ID de poliza a renovar (obligatorio)")
    if not pid:
        print(C.RED + "  [!] El ID es obligatorio." + C.RESET)
        return
    print(C.DIM + "  El backend aplica el IPC automaticamente. Body opcional." + C.RESET)
    obs = pedir("observacion (opcional)")
    payload = {"observacion": obs} if obs else None
    llamar("POST", f"/api/polizas/{pid}/renovar", payload=payload)


def ep_cancelar():
    titulo_endpoint("POST", "/api/polizas/{id}/cancelar", "Cancelar Poliza en Cascada")
    pid = pedir("ID de poliza a cancelar (obligatorio)")
    if not pid:
        print(C.RED + "  [!] El ID es obligatorio." + C.RESET)
        return
    motivo = pedir("motivo cancelacion", "solicitud cliente")
    conf = pedir(f"Confirmar cancelacion en cascada de {pid}? (s/N)", "N")
    if conf.lower() not in ("s", "si", "sí", "y", "yes"):
        print(C.YELLOW + "  [-] Operacion cancelada por el usuario." + C.RESET)
        return
    llamar("POST", f"/api/polizas/{pid}/cancelar", payload={"motivo": motivo})


def ep_agregar_riesgo():
    titulo_endpoint("POST", "/api/polizas/{id}/riesgos", "Agregar Riesgo (Validacion Colectiva)")
    pid = pedir("ID de poliza (obligatorio)")
    if not pid:
        print(C.RED + "  [!] El ID es obligatorio." + C.RESET)
        return
    print(C.DIM + "  Datos del riesgo (ENTER usa valor por defecto)" + C.RESET)
    tipo = pedir("tipo (ej: vida, auto, hogar, salud)", "vida")
    descripcion = pedir("descripcion", "Riesgo agregado desde terminal")
    valor = pedir("valor_asegurado", "1000000")
    beneficiario = pedir("beneficiario (opcional)")
    try:
        valor_num = float(valor) if "." in valor else int(valor)
    except ValueError:
        valor_num = valor  # lo envia como string si no es numerico
    payload = {"tipo": tipo, "descripcion": descripcion, "valor_asegurado": valor_num}
    if beneficiario:
        payload["beneficiario"] = beneficiario
    llamar("POST", f"/api/polizas/{pid}/riesgos", payload=payload)


def ep_core_mock():
    titulo_endpoint("POST", "/api/core-mock/evento", "Mock Externo Obligatorio (WebLogic CORE)")
    print(C.DIM + "  Simula el evento hacia el CORE WebLogic" + C.RESET)
    tipo = pedir("tipo_evento", "emision")
    poliza_id = pedir("poliza_id (opcional)")
    mensaje = pedir("mensaje", "Evento de prueba desde terminal")
    payload = {"tipo_evento": tipo, "mensaje": mensaje}
    # algunos mocks usan 'tipo' en vez de 'tipo_evento'; enviamos ambos alias si aplica
    if poliza_id:
        payload["poliza_id"] = poliza_id
    llamar("POST", "/api/core-mock/evento", payload=payload)


def ep_monthly():
    titulo_endpoint("GET", "/api/monthly-metrics", "Progreso Mensual & Metas de Cartera")
    print(C.DIM + "  Sin parametros obligatorios. Puedes filtrar por periodo." + C.RESET)
    anio = pedir("anio (ej: 2026, ENTER = actual)")
    mes = pedir("mes (1-12, ENTER = todos)")
    params = {}
    if anio:
        params["anio"] = anio
    if mes:
        params["mes"] = mes
    llamar("GET", "/api/monthly-metrics", params=params or None)


def main():
    banner()
    acciones = {
        "1": ep_listar_polizas,
        "2": ep_listar_riesgos,
        "3": ep_renovar,
        "4": ep_cancelar,
        "5": ep_agregar_riesgo,
        "6": ep_core_mock,
        "7": ep_monthly,
    }
    while True:
        menu()
        op = input(C.BOLD + C.YELLOW + "  Selecciona endpoint [0-7]: " + C.RESET).strip()
        if op == "0":
            print(C.CYAN + "\n  Hasta luego." + C.RESET)
            break
        fn = acciones.get(op)
        if fn:
            fn()
        else:
            print(C.RED + "  [!] Opcion invalida. Elige 0-7." + C.RESET)


if __name__ == "__main__":
    main()

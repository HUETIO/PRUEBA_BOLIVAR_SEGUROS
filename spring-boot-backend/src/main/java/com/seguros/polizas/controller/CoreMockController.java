package com.seguros.polizas.controller;

import com.seguros.polizas.dto.ApiResponse;
import com.seguros.polizas.dto.CoreMockEventoDTO;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/core-mock")
public class CoreMockController {

    private static final Logger log = LoggerFactory.getLogger(CoreMockController.class);

    /**
     * Requerimiento Mock Externo:
     * Endpoint que simula la capa media WebLogic conectada al sistema CORE de seguros.
     * Su único propósito es registrar en logs que la operación se intentó enviar al CORE.
     */
    @PostMapping("/evento")
    public ResponseEntity<ApiResponse<CoreMockEventoDTO>> registrarEventoCore(
            @Valid @RequestBody CoreMockEventoDTO eventoDTO) {
        log.info("================================================================================");
        log.info("[WEBLOGIC MIDDLEWARE CORE MOCK] REGISTRO DE EVENTO RECIBIDO DEL SERVICIO DE PÓLIZAS");
        log.info("[WEBLOGIC MIDDLEWARE CORE MOCK] Evento: {}", eventoDTO.getEvento());
        log.info("[WEBLOGIC MIDDLEWARE CORE MOCK] Póliza ID: {}", eventoDTO.getPolizaId());
        log.info("[WEBLOGIC MIDDLEWARE CORE MOCK] Estado: Operación registrada e intentada enviar al CORE de seguros con éxito");
        log.info("================================================================================");

        return ResponseEntity.ok(ApiResponse.ok(
                "Evento registrado en logs de capa media WebLogic para CORE de seguros",
                eventoDTO
        ));
    }
}

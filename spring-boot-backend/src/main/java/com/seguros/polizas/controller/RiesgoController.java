package com.seguros.polizas.controller;

import com.seguros.polizas.dto.ApiResponse;
import com.seguros.polizas.model.entity.Riesgo;
import com.seguros.polizas.service.RiesgoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/riesgos")
public class RiesgoController {

    private final RiesgoService riesgoService;

    public RiesgoController(RiesgoService riesgoService) {
        this.riesgoService = riesgoService;
    }

    /**
     * Requerimiento 6: POST /riesgos/{id}/cancelar
     */
    @PostMapping("/{id}/cancelar")
    public ResponseEntity<ApiResponse<Riesgo>> cancelarRiesgo(@PathVariable Long id) {
        Riesgo riesgo = riesgoService.cancelarRiesgo(id);
        return ResponseEntity.ok(ApiResponse.ok("Riesgo cancelado exitosamente y notificado al CORE", riesgo));
    }
}

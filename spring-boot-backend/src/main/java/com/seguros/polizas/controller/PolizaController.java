package com.seguros.polizas.controller;

import com.seguros.polizas.dto.ApiResponse;
import com.seguros.polizas.dto.CreatePolizaDTO;
import com.seguros.polizas.dto.CreateRiesgoDTO;
import com.seguros.polizas.dto.RenovarPolizaDTO;
import com.seguros.polizas.model.entity.Poliza;
import com.seguros.polizas.model.entity.Riesgo;
import com.seguros.polizas.model.enums.EstadoPoliza;
import com.seguros.polizas.model.enums.TipoPoliza;
import com.seguros.polizas.service.PolizaService;
import com.seguros.polizas.service.RiesgoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/polizas")
public class PolizaController {

    private final PolizaService polizaService;
    private final RiesgoService riesgoService;

    public PolizaController(PolizaService polizaService, RiesgoService riesgoService) {
        this.polizaService = polizaService;
        this.riesgoService = riesgoService;
    }

    /**
     * Requerimiento 1: GET /polizas
     * Listar pólizas por "tipo" y "estado".
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Poliza>>> listarPolizas(
            @RequestParam(required = false) TipoPoliza tipo,
            @RequestParam(required = false) EstadoPoliza estado) {
        List<Poliza> resultado = polizaService.listarPolizas(tipo, estado);
        return ResponseEntity.ok(ApiResponse.ok("Pólizas obtenidas exitosamente", resultado));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Poliza>> obtenerPorId(@PathVariable Long id) {
        Poliza poliza = polizaService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponse.ok("Póliza encontrada", poliza));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Poliza>> crearPoliza(@Valid @RequestBody CreatePolizaDTO dto) {
        Poliza creada = polizaService.crearPoliza(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Póliza creada exitosamente y sincronizada con CORE", creada));
    }

    /**
     * Requerimiento 2: GET /polizas/{id}/riesgos
     */
    @GetMapping("/{id}/riesgos")
    public ResponseEntity<ApiResponse<List<Riesgo>>> obtenerRiesgos(@PathVariable Long id) {
        List<Riesgo> riesgos = riesgoService.obtenerRiesgosPorPoliza(id);
        return ResponseEntity.ok(ApiResponse.ok("Riesgos de la póliza obtenidos exitosamente", riesgos));
    }

    /**
     * Requerimiento 3: POST /polizas/{id}/renovar
     * Incrementa canon y prima en +IPC. Estado pasa a "RENOVADA".
     */
    @PostMapping("/{id}/renovar")
    public ResponseEntity<ApiResponse<Poliza>> renovarPoliza(
            @PathVariable Long id,
            @Valid @RequestBody RenovarPolizaDTO dto) {
        Poliza renovada = polizaService.renovarPoliza(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Póliza renovada con éxito según IPC (+ " + dto.getPorcentajeIpc() + "%)", renovada));
    }

    /**
     * Requerimiento 4: POST /polizas/{id}/cancelar
     * Cancela la póliza y todos sus riesgos asociados.
     */
    @PostMapping("/{id}/cancelar")
    public ResponseEntity<ApiResponse<Poliza>> cancelarPoliza(@PathVariable Long id) {
        Poliza cancelada = polizaService.cancelarPoliza(id);
        return ResponseEntity.ok(ApiResponse.ok("Póliza y todos sus riesgos asociados han sido cancelados exitosamente", cancelada));
    }

    /**
     * Requerimiento 5: POST /polizas/{id}/riesgos
     * Solo si tipo = Colectiva (o primer riesgo si individual).
     */
    @PostMapping("/{id}/riesgos")
    public ResponseEntity<ApiResponse<Riesgo>> agregarRiesgo(
            @PathVariable Long id,
            @Valid @RequestBody CreateRiesgoDTO dto) {
        Riesgo riesgo = riesgoService.agregarRiesgoAPoliza(id, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Riesgo agregado exitosamente a la póliza", riesgo));
    }
}

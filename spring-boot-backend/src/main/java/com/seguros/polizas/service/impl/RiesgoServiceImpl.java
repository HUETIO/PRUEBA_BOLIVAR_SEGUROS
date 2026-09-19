package com.seguros.polizas.service.impl;

import com.seguros.polizas.dto.CreateRiesgoDTO;
import com.seguros.polizas.exception.BusinessException;
import com.seguros.polizas.exception.ResourceNotFoundException;
import com.seguros.polizas.model.entity.Poliza;
import com.seguros.polizas.model.entity.Riesgo;
import com.seguros.polizas.model.enums.EstadoPoliza;
import com.seguros.polizas.model.enums.EstadoRiesgo;
import com.seguros.polizas.model.enums.TipoPoliza;
import com.seguros.polizas.repository.PolizaRepository;
import com.seguros.polizas.repository.RiesgoRepository;
import com.seguros.polizas.service.CoreIntegrationService;
import com.seguros.polizas.service.RiesgoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class RiesgoServiceImpl implements RiesgoService {

    private final RiesgoRepository riesgoRepository;
    private final PolizaRepository polizaRepository;
    private final CoreIntegrationService coreIntegrationService;

    public RiesgoServiceImpl(RiesgoRepository riesgoRepository,
                             PolizaRepository polizaRepository,
                             CoreIntegrationService coreIntegrationService) {
        this.riesgoRepository = riesgoRepository;
        this.polizaRepository = polizaRepository;
        this.coreIntegrationService = coreIntegrationService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Riesgo> obtenerRiesgosPorPoliza(Long polizaId) {
        if (!polizaRepository.existsById(polizaId)) {
            throw new ResourceNotFoundException("Póliza no encontrada con ID: " + polizaId);
        }
        return riesgoRepository.findByPolizaId(polizaId);
    }

    @Override
    public Riesgo agregarRiesgoAPoliza(Long polizaId, CreateRiesgoDTO dto) {
        Poliza poliza = polizaRepository.findById(polizaId)
                .orElseThrow(() -> new ResourceNotFoundException("Póliza no encontrada con ID: " + polizaId));

        if (poliza.getEstado() == EstadoPoliza.CANCELADA) {
            throw new BusinessException("No se pueden agregar riesgos a una póliza en estado CANCELADA.");
        }

        // Regla de Negocio: Agregar riesgo exige validación del tipo de póliza.
        // Requerimiento 5: POST /polizas/{id}/riesgos -> "Solo si tipo = Colectiva."
        // Reglas esenciales: "Una póliza individual solo puede tener 1 riesgo."
        if (poliza.getTipo() == TipoPoliza.INDIVIDUAL) {
            long riesgosExistentes = riesgoRepository.countByPolizaIdAndEstado(polizaId, EstadoRiesgo.ACTIVO);
            if (riesgosExistentes >= 1) {
                throw new BusinessException("Regla de Negocio Incumplida: Una póliza individual solo puede tener 1 riesgo. Use una póliza COLECTIVA para múltiples riesgos.");
            }
        }

        Riesgo nuevoRiesgo = Riesgo.builder()
                .poliza(poliza)
                .direccion(dto.getDireccion())
                .ciudad(dto.getCiudad())
                .valorCanon(dto.getValorCanon())
                .descripcionInmueble(dto.getDescripcionInmueble())
                .arrendatarioNombre(dto.getArrendatarioNombre())
                .arrendatarioDoc(dto.getArrendatarioDoc())
                .estado(EstadoRiesgo.ACTIVO)
                .fechaCreacion(LocalDate.now())
                .build();

        Riesgo riesgoGuardado = riesgoRepository.save(nuevoRiesgo);

        // Si es colectiva, sumar el nuevo canon al canon acumulado de la póliza
        if (poliza.getTipo() == TipoPoliza.COLECTIVA) {
            BigDecimal canonAcumulado = poliza.getCanonMensual().add(dto.getValorCanon());
            poliza.setCanonMensual(canonAcumulado);
            poliza.setPrimaTotal(canonAcumulado.multiply(BigDecimal.valueOf(poliza.getVigenciaMeses())));
            polizaRepository.save(poliza);
        }

        // Notificar al CORE de seguros vía capa media WebLogic
        coreIntegrationService.notificarCambioCore(poliza.getId(), "AGREGAR_RIESGO");

        return riesgoGuardado;
    }

    @Override
    public Riesgo cancelarRiesgo(Long riesgoId) {
        Riesgo riesgo = riesgoRepository.findById(riesgoId)
                .orElseThrow(() -> new ResourceNotFoundException("Riesgo no encontrado con ID: " + riesgoId));

        if (riesgo.getEstado() == EstadoRiesgo.CANCELADO) {
            throw new BusinessException("El riesgo ya se encuentra en estado CANCELADO.");
        }

        riesgo.setEstado(EstadoRiesgo.CANCELADO);
        Riesgo riesgoCancelado = riesgoRepository.save(riesgo);

        Poliza poliza = riesgo.getPoliza();
        // Si es colectiva, restar del canon acumulado si aún quedan activos
        if (poliza.getTipo() == TipoPoliza.COLECTIVA) {
            BigDecimal nuevoCanon = poliza.getCanonMensual().subtract(riesgo.getValorCanon());
            if (nuevoCanon.compareTo(BigDecimal.ZERO) < 0) {
                nuevoCanon = BigDecimal.ZERO;
            }
            poliza.setCanonMensual(nuevoCanon);
            poliza.setPrimaTotal(nuevoCanon.multiply(BigDecimal.valueOf(poliza.getVigenciaMeses())));
            polizaRepository.save(poliza);
        }

        // Notificar al CORE de seguros vía capa media WebLogic
        coreIntegrationService.notificarCambioCore(poliza.getId(), "CANCELAR_RIESGO");

        return riesgoCancelado;
    }
}

package com.seguros.polizas.service.impl;

import com.seguros.polizas.dto.CreatePolizaDTO;
import com.seguros.polizas.dto.RenovarPolizaDTO;
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
import com.seguros.polizas.service.PolizaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class PolizaServiceImpl implements PolizaService {

    private final PolizaRepository polizaRepository;
    private final RiesgoRepository riesgoRepository;
    private final CoreIntegrationService coreIntegrationService;

    public PolizaServiceImpl(PolizaRepository polizaRepository,
                             RiesgoRepository riesgoRepository,
                             CoreIntegrationService coreIntegrationService) {
        this.polizaRepository = polizaRepository;
        this.riesgoRepository = riesgoRepository;
        this.coreIntegrationService = coreIntegrationService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Poliza> listarPolizas(TipoPoliza tipo, EstadoPoliza estado) {
        return polizaRepository.findByTipoAndEstado(tipo, estado);
    }

    @Override
    @Transactional(readOnly = true)
    public Poliza obtenerPorId(Long id) {
        return polizaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Póliza no encontrada con ID: " + id));
    }

    @Override
    public Poliza crearPoliza(CreatePolizaDTO dto) {
        // En pólizas individuales: tomador y asegurado es el arrendatario, beneficiario es el arrendador
        // En pólizas colectivas: inmobiliaria / administración es el tomador, se aseguran arrendatarios, beneficiario arrendador
        BigDecimal primaTotal = dto.getCanonMensual().multiply(BigDecimal.valueOf(dto.getVigenciaMeses()));
        LocalDate fechaFin = dto.getFechaInicio().plusMonths(dto.getVigenciaMeses());

        Poliza poliza = Poliza.builder()
                .numeroPoliza(dto.getNumeroPoliza())
                .tipo(dto.getTipo())
                .estado(EstadoPoliza.ACTIVA)
                .tomador(dto.getTomador())
                .tomadorDoc(dto.getTomadorDoc())
                .asegurado(dto.getAsegurado())
                .beneficiario(dto.getBeneficiario())
                .vigenciaMeses(dto.getVigenciaMeses())
                .fechaInicio(dto.getFechaInicio())
                .fechaFin(fechaFin)
                .canonMensual(dto.getCanonMensual())
                .primaTotal(primaTotal)
                .riesgos(new ArrayList<>())
                .build();

        Poliza saved = polizaRepository.save(poliza);

        // Si se incluye riesgo inicial, asociarlo
        if (dto.getDireccionRiesgoInicial() != null && !dto.getDireccionRiesgoInicial().isBlank()) {
            Riesgo riesgoInicial = Riesgo.builder()
                    .poliza(saved)
                    .direccion(dto.getDireccionRiesgoInicial())
                    .ciudad(dto.getCiudadRiesgoInicial() != null ? dto.getCiudadRiesgoInicial() : "Bogotá D.C.")
                    .valorCanon(dto.getCanonMensual())
                    .descripcionInmueble(dto.getDescripcionInmuebleInicial() != null ? dto.getDescripcionInmuebleInicial() : "Inmueble Residencial")
                    .arrendatarioNombre(dto.getAsegurado())
                    .arrendatarioDoc(dto.getTomadorDoc())
                    .estado(EstadoRiesgo.ACTIVO)
                    .fechaCreacion(LocalDate.now())
                    .build();

            riesgoRepository.save(riesgoInicial);
            saved.getRiesgos().add(riesgoInicial);
        }

        // Notificar al CORE de seguros mediante el servicio agnóstico en WebLogic
        coreIntegrationService.notificarCambioCore(saved.getId(), "CREACION_POLIZA");

        return saved;
    }

    @Override
    public Poliza renovarPoliza(Long id, RenovarPolizaDTO dto) {
        Poliza poliza = obtenerPorId(id);

        // Regla de negocio: No se puede renovar una póliza cancelada
        if (poliza.getEstado() == EstadoPoliza.CANCELADA) {
            throw new BusinessException("Regla de Negocio Incumplida: No se puede renovar una póliza que se encuentra CANCELADA.");
        }

        // Cálculo de incremento según IPC: nuevoCanon = canonActual * (1 + IPC/100)
        BigDecimal multiplicador = BigDecimal.ONE.add(dto.getPorcentajeIpc().divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP));
        BigDecimal nuevoCanon = poliza.getCanonMensual().multiply(multiplicador).setScale(2, RoundingMode.HALF_UP);
        BigDecimal nuevaPrima = nuevoCanon.multiply(BigDecimal.valueOf(poliza.getVigenciaMeses())).setScale(2, RoundingMode.HALF_UP);

        poliza.setCanonMensual(nuevoCanon);
        poliza.setPrimaTotal(nuevaPrima);
        poliza.setEstado(EstadoPoliza.RENOVADA);
        poliza.setPorcentajeIpcUltimaRenovacion(dto.getPorcentajeIpc());
        poliza.setFechaUltimaRenovacion(LocalDate.now());

        // Renovar por el mismo periodo de vigencia inicial
        poliza.setFechaInicio(poliza.getFechaFin());
        poliza.setFechaFin(poliza.getFechaInicio().plusMonths(poliza.getVigenciaMeses()));

        Poliza polizaGuardada = polizaRepository.save(poliza);

        // Notificar al CORE de seguros vía servicio en WebLogic
        coreIntegrationService.notificarCambioCore(polizaGuardada.getId(), "RENOVACION_IPC");

        return polizaGuardada;
    }

    @Override
    public Poliza cancelarPoliza(Long id) {
        Poliza poliza = obtenerPorId(id);

        if (poliza.getEstado() == EstadoPoliza.CANCELADA) {
            throw new BusinessException("La póliza ya se encuentra en estado CANCELADA.");
        }

        poliza.setEstado(EstadoPoliza.CANCELADA);

        // Regla de negocio: La cancelación de una póliza cancela todos sus riesgos
        List<Riesgo> riesgos = riesgoRepository.findByPolizaId(poliza.getId());
        for (Riesgo riesgo : riesgos) {
            riesgo.setEstado(EstadoRiesgo.CANCELADO);
        }
        riesgoRepository.saveAll(riesgos);

        Poliza polizaCancelada = polizaRepository.save(poliza);

        // Notificar al CORE de seguros vía capa media WebLogic
        coreIntegrationService.notificarCambioCore(polizaCancelada.getId(), "CANCELACION_POLIZA_Y_RIESGOS");

        return polizaCancelada;
    }
}

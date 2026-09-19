package com.seguros.polizas.service;

import com.seguros.polizas.dto.CreateRiesgoDTO;
import com.seguros.polizas.model.entity.Riesgo;

import java.util.List;

public interface RiesgoService {

    List<Riesgo> obtenerRiesgosPorPoliza(Long polizaId);

    Riesgo agregarRiesgoAPoliza(Long polizaId, CreateRiesgoDTO dto);

    Riesgo cancelarRiesgo(Long riesgoId);
}

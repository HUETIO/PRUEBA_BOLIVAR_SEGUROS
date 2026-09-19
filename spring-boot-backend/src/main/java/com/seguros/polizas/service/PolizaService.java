package com.seguros.polizas.service;

import com.seguros.polizas.dto.CreatePolizaDTO;
import com.seguros.polizas.dto.RenovarPolizaDTO;
import com.seguros.polizas.model.entity.Poliza;
import com.seguros.polizas.model.enums.EstadoPoliza;
import com.seguros.polizas.model.enums.TipoPoliza;

import java.util.List;

public interface PolizaService {

    List<Poliza> listarPolizas(TipoPoliza tipo, EstadoPoliza estado);

    Poliza obtenerPorId(Long id);

    Poliza crearPoliza(CreatePolizaDTO dto);

    Poliza renovarPoliza(Long id, RenovarPolizaDTO dto);

    Poliza cancelarPoliza(Long id);
}

package com.seguros.polizas.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RenovarPolizaDTO {

    @NotNull(message = "El porcentaje de incremento del IPC es obligatorio")
    @DecimalMin(value = "0.00", message = "El incremento IPC no puede ser negativo")
    private BigDecimal porcentajeIpc;
}

package com.seguros.polizas.dto;

import com.seguros.polizas.model.enums.TipoPoliza;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePolizaDTO {

    @NotBlank(message = "El número de póliza es obligatorio")
    private String numeroPoliza;

    @NotNull(message = "El tipo de póliza es obligatorio (INDIVIDUAL o COLECTIVA)")
    private TipoPoliza tipo;

    @NotBlank(message = "El tomador es obligatorio")
    private String tomador;

    @NotBlank(message = "El documento del tomador es obligatorio")
    private String tomadorDoc;

    @NotBlank(message = "El asegurado es obligatorio")
    private String asegurado;

    @NotBlank(message = "El beneficiario es obligatorio (arrendador)")
    private String beneficiario;

    @NotNull(message = "La vigencia en meses es obligatoria")
    @Min(value = 1, message = "La vigencia mínima es de 1 mes")
    private Integer vigenciaMeses;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    @NotNull(message = "El canon mensual es obligatorio")
    @DecimalMin(value = "0.01", message = "El canon mensual debe ser mayor a 0")
    private BigDecimal canonMensual;

    // Campos opcionales para crear el primer riesgo de una póliza individual o colectiva
    private String direccionRiesgoInicial;
    private String ciudadRiesgoInicial;
    private String descripcionInmuebleInicial;
}

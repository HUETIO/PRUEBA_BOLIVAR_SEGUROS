package com.seguros.polizas.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
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
public class CreateRiesgoDTO {

    @NotBlank(message = "La dirección del inmueble es obligatoria")
    private String direccion;

    @NotBlank(message = "La ciudad es obligatoria")
    private String ciudad;

    @NotNull(message = "El valor del canon es obligatorio")
    @DecimalMin(value = "0.01", message = "El valor del canon debe ser mayor a 0")
    private BigDecimal valorCanon;

    private String descripcionInmueble;

    @NotBlank(message = "El nombre del arrendatario asegurado es obligatorio")
    private String arrendatarioNombre;

    @NotBlank(message = "El documento del arrendatario asegurado es obligatorio")
    private String arrendatarioDoc;
}

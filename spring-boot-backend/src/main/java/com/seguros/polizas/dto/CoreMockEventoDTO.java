package com.seguros.polizas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoreMockEventoDTO {

    @NotBlank(message = "El nombre del evento es obligatorio")
    private String evento; // "ACTUALIZACION"

    @NotNull(message = "El ID de la póliza es obligatorio")
    private Long polizaId;
}

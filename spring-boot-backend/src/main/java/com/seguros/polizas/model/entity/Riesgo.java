package com.seguros.polizas.model.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.seguros.polizas.model.enums.EstadoRiesgo;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "riesgos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Riesgo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poliza_id", nullable = false)
    @JsonBackReference
    private Poliza poliza;

    @Column(nullable = false)
    private String direccion;

    @Column(nullable = false)
    private String ciudad;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal valorCanon;

    private String descripcionInmueble;

    @Column(nullable = false)
    private String arrendatarioNombre;

    @Column(nullable = false)
    private String arrendatarioDoc;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoRiesgo estado;

    @Column(nullable = false)
    private LocalDate fechaCreacion;
}

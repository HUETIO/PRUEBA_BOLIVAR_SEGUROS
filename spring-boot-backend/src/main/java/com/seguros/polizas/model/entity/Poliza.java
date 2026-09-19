package com.seguros.polizas.model.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.seguros.polizas.model.enums.EstadoPoliza;
import com.seguros.polizas.model.enums.TipoPoliza;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "polizas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Poliza {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String numeroPoliza;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoPoliza tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoPoliza estado;

    @Column(nullable = false)
    private String tomador;

    @Column(nullable = false)
    private String tomadorDoc;

    @Column(nullable = false)
    private String asegurado;

    @Column(nullable = false)
    private String beneficiario;

    @Column(nullable = false)
    private Integer vigenciaMeses;

    @Column(nullable = false)
    private LocalDate fechaInicio;

    @Column(nullable = false)
    private LocalDate fechaFin;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal canonMensual;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal primaTotal;

    @Column(precision = 5, scale = 2)
    private BigDecimal porcentajeIpcUltimaRenovacion;

    private LocalDate fechaUltimaRenovacion;

    @OneToMany(mappedBy = "poliza", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    @Builder.Default
    private List<Riesgo> riesgos = new ArrayList<>();

    @PrePersist
    @PreUpdate
    public void calcularPrima() {
        if (this.canonMensual != null && this.vigenciaMeses != null) {
            this.primaTotal = this.canonMensual.multiply(BigDecimal.valueOf(this.vigenciaMeses));
        }
    }
}

import React, { useState } from 'react';
import { 
  FolderTree, 
  FileCode, 
  Copy, 
  Check, 
  Server, 
  ShieldCheck, 
  Layers, 
  Coffee,
  Code2
} from 'lucide-react';

export const SpringBootExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('PolizaController.java');
  const [copied, setCopied] = useState(false);

  const files: Record<string, { path: string; category: string; description: string; code: string }> = {
    'PolizaController.java': {
      path: 'src/main/java/com/segurospolizas/app/controller/PolizaController.java',
      category: 'REST Controller',
      description: 'Expone los endpoints solicitados en Módulo 2 con validación de x-api-key.',
      code: `package com.segurospolizas.app.controller;

import com.segurospolizas.app.dto.RenovacionRequest;
import com.segurospolizas.app.dto.RiesgoRequest;
import com.segurospolizas.app.entity.Poliza;
import com.segurospolizas.app.entity.Riesgo;
import com.segurospolizas.app.service.PolizaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/polizas")
public class PolizaController {

    private final PolizaService polizaService;

    public PolizaController(PolizaService polizaService) {
        this.polizaService = polizaService;
    }

    // Requerimiento 1: GET /polizas (filtrar por tipo y estado)
    @GetMapping
    public ResponseEntity<List<Poliza>> listarPolizas(
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String estado) {
        return ResponseEntity.ok(polizaService.obtenerPolizas(tipo, estado));
    }

    // Requerimiento 2: GET /polizas/{id}/riesgos
    @GetMapping("/{id}/riesgos")
    public ResponseEntity<List<Riesgo>> listarRiesgosDePoliza(@PathVariable Long id) {
        return ResponseEntity.ok(polizaService.obtenerRiesgosDePoliza(id));
    }

    // Requerimiento 3: POST /polizas/{id}/renovar
    // Incrementa canon y prima con IPC, actualiza estado a RENOVADA y notifica al CORE
    @PostMapping("/{id}/renovar")
    public ResponseEntity<Poliza> renovarPoliza(
            @PathVariable Long id,
            @Valid @RequestBody RenovacionRequest request) {
        Poliza renovada = polizaService.renovarPoliza(id, request.getPorcentajeIpc());
        return ResponseEntity.ok(renovada);
    }

    // Requerimiento 4: POST /polizas/{id}/cancelar
    // Cancela la póliza y todos sus riesgos asociados en cascada
    @PostMapping("/{id}/cancelar")
    public ResponseEntity<Poliza> cancelarPoliza(@PathVariable Long id) {
        Poliza cancelada = polizaService.cancelarPoliza(id);
        return ResponseEntity.ok(cancelada);
    }

    // Requerimiento 5: POST /polizas/{id}/riesgos
    // Solo permitido si la póliza es de tipo COLECTIVA
    @PostMapping("/{id}/riesgos")
    public ResponseEntity<Riesgo> agregarRiesgo(
            @PathVariable Long id,
            @Valid @RequestBody RiesgoRequest request) {
        Riesgo nuevoRiesgo = polizaService.agregarRiesgo(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoRiesgo);
    }
}`
    },

    'PolizaService.java': {
      path: 'src/main/java/com/segurospolizas/app/service/PolizaService.java',
      category: 'Service Layer (Dominio)',
      description: 'Reglas de negocio puras, cálculo de prima, validaciones de tipo de póliza y despacho al CORE.',
      code: `package com.segurospolizas.app.service;

import com.segurospolizas.app.dto.RiesgoRequest;
import com.segurospolizas.app.entity.Poliza;
import com.segurospolizas.app.entity.Riesgo;
import com.segurospolizas.app.repository.PolizaRepository;
import com.segurospolizas.app.repository.RiesgoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class PolizaService {

    private final PolizaRepository polizaRepository;
    private final RiesgoRepository riesgoRepository;
    private final CoreMockIntegrationService coreIntegrationService;

    public PolizaService(PolizaRepository polizaRepository,
                         RiesgoRepository riesgoRepository,
                         CoreMockIntegrationService coreIntegrationService) {
        this.polizaRepository = polizaRepository;
        this.riesgoRepository = riesgoRepository;
        this.coreIntegrationService = coreIntegrationService;
    }

    public List<Poliza> obtenerPolizas(String tipo, String estado) {
        if (tipo != null && estado != null) {
            return polizaRepository.findByTipoAndEstado(tipo, estado);
        } else if (tipo != null) {
            return polizaRepository.findByTipo(tipo);
        } else if (estado != null) {
            return polizaRepository.findByEstado(estado);
        }
        return polizaRepository.findAll();
    }

    public List<Riesgo> obtenerRiesgosDePoliza(Long polizaId) {
        return riesgoRepository.findByPolizaId(polizaId);
    }

    @Transactional
    public Poliza renovarPoliza(Long id, BigDecimal porcentajeIpc) {
        Poliza poliza = polizaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Póliza no encontrada"));

        if ("CANCELADA".equalsIgnoreCase(poliza.getEstado())) {
            throw new IllegalStateException("No es posible renovar una póliza cancelada.");
        }

        // 1. Ajuste de Canon según incremento del IPC
        BigDecimal factor = BigDecimal.ONE.add(porcentajeIpc.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
        BigDecimal nuevoCanon = poliza.getCanonMensual().multiply(factor).setScale(2, RoundingMode.HALF_UP);
        poliza.setCanonMensual(nuevoCanon);

        // 2. Prima Total = nuevo Canon Mensual * Meses de vigencia
        BigDecimal nuevaPrima = nuevoCanon.multiply(BigDecimal.valueOf(poliza.getVigenciaMeses()));
        poliza.setPrimaTotal(nuevaPrima);

        // 3. Extender fecha fin
        poliza.setFechaFin(poliza.getFechaFin().plusMonths(poliza.getVigenciaMeses()));
        poliza.setEstado("RENOVADA");
        poliza.setPorcentajeIpcUltimaRenovacion(porcentajeIpc);

        Poliza guardada = polizaRepository.save(poliza);

        // 4. Servicio agnóstico en WebLogic para mantener actualizado el CORE
        coreIntegrationService.notificarCore("ACTUALIZACION", guardada.getId());

        return guardada;
    }

    @Transactional
    public Poliza cancelarPoliza(Long id) {
        Poliza poliza = polizaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Póliza no encontrada"));

        poliza.setEstado("CANCELADA");

        // Regla: La cancelación de una póliza cancela todos sus riesgos
        List<Riesgo> riesgos = riesgoRepository.findByPolizaId(id);
        for (Riesgo r : riesgos) {
            r.setEstado("CANCELADO");
            riesgoRepository.save(r);
        }

        Poliza cancelada = polizaRepository.save(poliza);
        coreIntegrationService.notificarCore("CANCELACION", cancelada.getId());
        return cancelada;
    }

    @Transactional
    public Riesgo agregarRiesgo(Long polizaId, RiesgoRequest req) {
        Poliza poliza = polizaRepository.findById(polizaId)
                .orElseThrow(() -> new IllegalArgumentException("Póliza no encontrada"));

        // Regla: En una póliza individual solo tiene un riesgo
        if ("INDIVIDUAL".equalsIgnoreCase(poliza.getTipo())) {
            long activos = riesgoRepository.countByPolizaIdAndEstado(polizaId, "ACTIVO");
            if (activos >= 1) {
                throw new IllegalStateException("Una póliza individual solo puede tener 1 riesgo.");
            }
        }

        Riesgo nuevo = new Riesgo();
        nuevo.setPoliza(poliza);
        nuevo.setDireccion(req.getDireccion());
        nuevo.setCiudad(req.getCiudad());
        nuevo.setValorCanon(req.getValorCanon());
        nuevo.setDescripcionInmueble(req.getDescripcionInmueble());
        nuevo.setArrendatarioNombre(req.getArrendatarioNombre());
        nuevo.setArrendatarioDoc(req.getArrendatarioDoc());
        nuevo.setEstado("ACTIVO");

        Riesgo guardado = riesgoRepository.save(nuevo);
        coreIntegrationService.notificarCore("ADICION_RIESGO", poliza.getId());
        return guardado;
    }
}`
    },

    'Poliza.java': {
      path: 'src/main/java/com/segurospolizas/app/entity/Poliza.java',
      category: 'JPA Entity',
      description: 'Entidad relacional de Póliza con mapeo 1 a N hacia Riesgos.',
      code: `package com.segurospolizas.app.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "polizas")
public class Poliza {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_poliza", unique = true, nullable = false)
    private String numeroPoliza;

    @Column(nullable = false)
    private String tipo; // "INDIVIDUAL" o "COLECTIVA"

    @Column(nullable = false)
    private String estado; // "ACTIVA", "RENOVADA", "CANCELADA"

    @Column(nullable = false)
    private String tomador;

    @Column(name = "tomador_doc", nullable = false)
    private String tomadorDoc;

    @Column(nullable = false)
    private String asegurado;

    @Column(nullable = false)
    private String beneficiario;

    @Column(name = "vigencia_meses", nullable = false)
    private Integer vigenciaMeses;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(name = "canon_mensual", nullable = false)
    private BigDecimal canonMensual;

    @Column(name = "prima_total", nullable = false)
    private BigDecimal primaTotal;

    @Column(name = "porcentaje_ipc_ultima_renovacion")
    private BigDecimal porcentajeIpcUltimaRenovacion;

    @OneToMany(mappedBy = "poliza", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Riesgo> riesgos = new ArrayList<>();

    // Getters, Setters y constructores
}`
    },

    'ApiKeyAuthFilter.java': {
      path: 'src/main/java/com/segurospolizas/app/security/ApiKeyAuthFilter.java',
      category: 'Security Filter',
      description: 'Intercepta y valida el header obligatorio x-api-key: 123456 en todas las peticiones.',
      code: `package com.segurospolizas.app.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    private static final String API_KEY_HEADER = "x-api-key";
    private static final String EXPECTED_KEY = "123456";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Excluir endpoints públicos como Swagger/Health
        String path = request.getRequestURI();
        if (path.startsWith("/swagger-ui") || path.startsWith("/actuator")) {
            filterChain.doFilter(request, response);
            return;
        }

        String apiKey = request.getHeader(API_KEY_HEADER);

        if (apiKey == null || !EXPECTED_KEY.equals(apiKey)) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType("application/json");
            response.getWriter().write("{\\"error\\":\\"No autorizado. Header x-api-key invalido o ausente.\\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}`
    },

    'pom.xml': {
      path: 'pom.xml',
      category: 'Maven Build Descriptor',
      description: 'Dependencias de Spring Boot 3.2.4, Spring Data JPA, H2/PostgreSQL y Validation.',
      code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.4</version>
        <relativePath/>
    </parent>
    <groupId>com.segurospolizas</groupId>
    <artifactId>polizas-backend</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>polizas-backend</name>
    <description>Sistema de Gestión de Pólizas y Riesgos de Arrendamiento</description>
    <properties>
        <java.version>17</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
    </dependencies>
</project>`
    }
  };

  const current = files[selectedFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 text-slate-100">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
            Backend Java • Spring Boot 3.2.4
          </span>
          <span className="text-xs text-slate-400">Código Fuente Completo /spring-boot-backend</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Coffee className="w-7 h-7 text-orange-400" />
          <span>Explorador de Código Spring Boot</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Estructura de arquitectura en capas (Controllers, Services, Repositories, Entities y Security Filters) desarrollada para la evaluación técnica.
        </p>
      </div>

      {/* Explorer layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: File Tree */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2 flex items-center gap-1.5">
            <FolderTree className="w-4 h-4 text-emerald-400" />
            <span>Archivos del Proyecto</span>
          </div>

          <div className="space-y-1">
            {Object.keys(files).map((fileName) => {
              const file = files[fileName];
              const isSelected = selectedFile === fileName;
              return (
                <button
                  key={fileName}
                  onClick={() => setSelectedFile(fileName)}
                  className={`w-full p-2.5 rounded-xl text-left transition flex items-center justify-between text-xs ${
                    isSelected
                      ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCode className="w-4 h-4 shrink-0 text-orange-400" />
                    <span className="truncate">{fileName}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded ml-1 shrink-0">
                    {file.category.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 3 Cols: Code Viewer */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base font-mono">{selectedFile}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {current.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{current.description}</p>
              <span className="text-[10px] text-slate-500 font-mono block mt-1">{current.path}</span>
            </div>

            <button
              onClick={handleCopy}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-slate-700 flex items-center gap-2 transition shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado' : 'Copiar Código'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-[550px]">
            {current.code}
          </pre>
        </div>
      </div>
    </div>
  );
};

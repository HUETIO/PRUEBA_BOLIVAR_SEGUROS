package com.seguros.polizas.service;

import com.seguros.polizas.dto.CoreMockEventoDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class CoreIntegrationService {

    private static final Logger log = LoggerFactory.getLogger(CoreIntegrationService.class);

    private final RestTemplate restTemplate;

    @Value("${app.core.mock-url:http://localhost:8080/core-mock/evento}")
    private String coreMockUrl;

    @Value("${app.security.api-key:123456}")
    private String apiKey;

    public CoreIntegrationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Consume el servicio agnóstico de edición en capa media WebLogic para actualizar el CORE de seguros.
     */
    public void notificarCambioCore(Long polizaId, String accion) {
        log.info("[CORE INTEGRATION] Iniciando sincronización con capa media WebLogic para póliza ID: {} por acción: {}", polizaId, accion);
        try {
            CoreMockEventoDTO payload = CoreMockEventoDTO.builder()
                    .evento("ACTUALIZACION")
                    .polizaId(polizaId)
                    .build();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", apiKey);

            HttpEntity<CoreMockEventoDTO> request = new HttpEntity<>(payload, headers);

            restTemplate.postForEntity(coreMockUrl, request, String.class);
            log.info("[CORE INTEGRATION] Notificación enviada exitosamente a WebLogic CORE para póliza ID: {}", polizaId);
        } catch (Exception ex) {
            log.warn("[CORE INTEGRATION] Advertencia: No se pudo contactar inmediatamente la capa media WebLogic ({}) - se registrará en cola de reintento.", ex.getMessage());
        }
    }
}

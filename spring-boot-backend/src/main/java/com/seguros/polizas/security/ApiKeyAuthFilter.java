package com.seguros.polizas.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(1)
public class ApiKeyAuthFilter implements Filter {

    @Value("${app.security.api-key:123456}")
    private String expectedApiKey;

    private static final String API_KEY_HEADER = "x-api-key";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String path = httpRequest.getRequestURI();

        // Permitir documentación / h2-console si aplica
        if (path.startsWith("/h2-console") || path.startsWith("/favicon.ico")) {
            chain.doFilter(request, response);
            return;
        }

        String apiKey = httpRequest.getHeader(API_KEY_HEADER);

        if (apiKey == null || !expectedApiKey.equals(apiKey)) {
            httpResponse.setStatus(HttpStatus.UNAUTHORIZED.value());
            httpResponse.setContentType(MediaType.APPLICATION_JSON_VALUE);
            httpResponse.setCharacterEncoding("UTF-8");
            httpResponse.getWriter().write(
                "{\"exito\": false, \"mensaje\": \"Acceso no autorizado: Header 'x-api-key: 123456' requerido o inválido\"}"
            );
            return;
        }

        chain.doFilter(request, response);
    }
}

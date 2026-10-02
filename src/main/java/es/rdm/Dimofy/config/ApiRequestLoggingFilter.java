package es.rdm.Dimofy.config;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class ApiRequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(ApiRequestLoggingFilter.class);

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/assets/") || path.startsWith("/uploads/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        long start = System.currentTimeMillis();
        try {
            filterChain.doFilter(request, response);
        } finally {
            long elapsed = System.currentTimeMillis() - start;
            int status = response.getStatus();
            if (status >= 500) {
                log.error("{} {} -> {} ({} ms)", request.getMethod(), request.getRequestURI(), status, elapsed);
            } else if (status >= 400) {
                log.warn("{} {} -> {} ({} ms)", request.getMethod(), request.getRequestURI(), status, elapsed);
            } else {
                log.info("{} {} -> {} ({} ms)", request.getMethod(), request.getRequestURI(), status, elapsed);
            }
        }
    }
}

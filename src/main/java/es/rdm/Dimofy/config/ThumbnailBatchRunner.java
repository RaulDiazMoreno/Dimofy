package es.rdm.Dimofy.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import es.rdm.Dimofy.service.ThumbnailService;

@Component
public class ThumbnailBatchRunner implements CommandLineRunner {
    private final ThumbnailService service;
    @Value("${app.thumbnails.generate-on-startup:false}") private boolean enabled;
    public ThumbnailBatchRunner(ThumbnailService service) { this.service = service; }
    @Override public void run(String... args) throws Exception {
        if (!enabled) return;
        System.out.println("=== GENERANDO THUMBNAILS DIMOFY ===");
        System.out.println(service.generarTodos());
    }
}

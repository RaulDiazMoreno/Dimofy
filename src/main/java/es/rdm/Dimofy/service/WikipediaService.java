package es.rdm.Dimofy.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class WikipediaService {

    private final WebClient webClient = WebClient.builder()
        .baseUrl("https://es.wikipedia.org/api/rest_v1")
        .defaultHeader("User-Agent", "MiAppSpringBoot/1.0")
        .build();

    public Mono<String> getResumen(String nombreArtista) {
        return webClient.get()
            .uri("/page/summary/{title}", nombreArtista.replace(" ", "_"))
            .retrieve()
            .bodyToMono(String.class)
            .map(json -> {
                try {
                    com.fasterxml.jackson.databind.JsonNode node = 
                        new com.fasterxml.jackson.databind.ObjectMapper().readTree(json);
                    return node.get("extract").asText();
                } catch (Exception e) {
                    return "Resumen no disponible.";
                }
            });
    }
}


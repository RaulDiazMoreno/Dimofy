package es.rdm.Dimofy.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import es.rdm.Dimofy.dto.AlbumDTO;
import es.rdm.Dimofy.dto.ArtistaDashboardDTO;
import es.rdm.Dimofy.dto.EstadisticaDashboardDTO;
import es.rdm.Dimofy.dto.ListaDashboardDTO;
import es.rdm.Dimofy.dto.GraficaDashboardDTO;
import es.rdm.Dimofy.repository.Listas;
import es.rdm.Dimofy.service.RecomendacionService;

@RestController
@RequestMapping("/app/dashboard/recomendaciones")
public class DashboardController {

    private final RecomendacionService recomendacionService;

    public DashboardController(RecomendacionService recomendacionService) {
        this.recomendacionService = recomendacionService;
    }

    @GetMapping("/generos")
    public ResponseEntity<List<AlbumDTO>> getAlbums(@RequestParam String userName) {
        return ResponseEntity.ok(recomendacionService.recomendarGeneros(userName));
    }

    @GetMapping("/artistas")
    public ResponseEntity<List<ArtistaDashboardDTO>> getArtistas(@RequestParam String userName) {
        return ResponseEntity.ok(recomendacionService.recomendarArtistas(userName));
    }
    
    @GetMapping("/novedades")
    public ResponseEntity<List<AlbumDTO>> getNovedades() {
        List<AlbumDTO> novedades = recomendacionService.obtenerNovedades();
        return ResponseEntity.ok(novedades);
    }
    @GetMapping("/listas")
    public ResponseEntity<List<ListaDashboardDTO>> getListas(@RequestParam String userName) {
        List<Listas> listas = recomendacionService.recomendarListas(userName);

        List<ListaDashboardDTO> dto = listas.stream()
            .map(l -> new ListaDashboardDTO(
                l.getIdLista(),
                l.getNombre(),
                l.getCaratula(),
                l.getNumeroCanciones()
            ))
            .toList();

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/estadisticas")
    public ResponseEntity<List<EstadisticaDashboardDTO>> obtenerEstadisticas() {

    	List<EstadisticaDashboardDTO> estadisticas = new ArrayList<>();

    	estadisticas.add(new EstadisticaDashboardDTO("Usuarios", recomendacionService.contarUsuarios()));
    	estadisticas.add(new EstadisticaDashboardDTO("Géneros Totales", recomendacionService.contarGeneros()));
    	estadisticas.add(new EstadisticaDashboardDTO("Artistas Totales", recomendacionService.contarArtistas()));
    	estadisticas.add(new EstadisticaDashboardDTO("Albums Totales", recomendacionService.contarAlbums())); 	
    	estadisticas.add(new EstadisticaDashboardDTO("Canciones Totales", recomendacionService.contarCanciones()));
    	estadisticas.add(new EstadisticaDashboardDTO("Novedades", recomendacionService.contarNovedades()));
    	estadisticas.add(new EstadisticaDashboardDTO("Listas de reproducción", recomendacionService.contarListas()));

    	return ResponseEntity.ok(estadisticas);

    }
    @GetMapping("/graficas/albums-por-anyo")
    public ResponseEntity<List<GraficaDashboardDTO>> albumsPorAnyo() {
        return ResponseEntity.ok(recomendacionService.albumsUltimosDiezAnyos());
    }

    @GetMapping("/graficas/top-paises")
    public ResponseEntity<List<GraficaDashboardDTO>> topPaises() {
        return ResponseEntity.ok(recomendacionService.topDiezPaisesArtistas());
    }

    @GetMapping("/graficas/artistas-por-genero")
    public ResponseEntity<List<GraficaDashboardDTO>> artistasPorGenero() {
        return ResponseEntity.ok(recomendacionService.artistasPorGenero());
    }

    @GetMapping("/graficas/top-artistas-albums")
    public ResponseEntity<List<GraficaDashboardDTO>> topArtistasAlbums() {
        return ResponseEntity.ok(recomendacionService.topTreintaArtistasPorAlbums());
    }

}

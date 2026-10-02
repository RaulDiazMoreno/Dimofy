package es.rdm.Dimofy.service;

import java.time.Year;
import java.util.List;

import org.springframework.stereotype.Service;

import es.rdm.Dimofy.dto.AlbumDTO;
import es.rdm.Dimofy.dto.ArtistaDashboardDTO;
import es.rdm.Dimofy.dto.GraficaDashboardDTO;
import es.rdm.Dimofy.repository.AlbumRepository;
import es.rdm.Dimofy.repository.ArtistaRepository;
import java.util.ArrayList;
import java.util.Collections;
import es.rdm.Dimofy.repository.Artista;
import es.rdm.Dimofy.repository.Listas;

@Service
public class RecomendacionService {

    private final UsuariosService usuariosService;
    private final AlbumService albumService;
    private final ListasService listaService;
    private final GeneroService generoService;
    private final ArtistaService artistaService;
    private final CancionesService cancionesService;
    private final AlbumRepository albumRepository;
    private final ArtistaRepository artistaRepository;

    public RecomendacionService(UsuariosService usuariosService, AlbumService albumService,ListasService listaService,
    							GeneroService generoService,ArtistaService artistaService,CancionesService cancionesService,
                                AlbumRepository albumRepository, ArtistaRepository artistaRepository) {
        this.usuariosService = usuariosService;
        this.albumService = albumService;
        this.listaService = listaService;  
        this.generoService=generoService;
        this.artistaService=artistaService;
        this.cancionesService=cancionesService;
        this.albumRepository=albumRepository;
        this.artistaRepository=artistaRepository;
    }

    public List<AlbumDTO> recomendarGeneros(String userName) {
    	
        List<String> generos = usuariosService.obtenerGenerosPorUserName(userName);
        List<AlbumDTO> albums=albumService.findAlbumsByNombreGeneros(generos);
        
        return albums;
    }
    
    public List<ArtistaDashboardDTO> recomendarArtistas(String userName) {
        List<String> nombres = usuariosService.obtenerArtistasPorUserName(userName);
        return artistaService.buscarPorNombres(nombres).stream()
            .map(a -> new ArtistaDashboardDTO(a.getIdArtista(), a.getNombre(), a.getFoto()))
            .toList();
    }

	public List<AlbumDTO> obtenerNovedades() {
		
		String anyoActual = String.valueOf(Year.now().getValue());
		List<AlbumDTO> albums=albumService.findAlbumsByAnyo(anyoActual);
		return albums;
	}

	public List<Listas> recomendarListas(String userName) {
		return listaService.obtenerListasPorUserName(userName);
	}

	public int contarNovedades() {
		String anyoActual = String.valueOf(Year.now().getValue());
		List<AlbumDTO> albums=albumService.findAlbumsByAnyo(anyoActual);
		return albums.size();
	}

	public int contarGeneros() {
		
		return generoService.contarGeneros();
	}

	public int contarArtistas() {
		
		return artistaService.contarArtistas();
	}

	public int contarListas() {

		return listaService.contarListas();
	}

	public int contarAlbums() {
		
		return albumService.contarAlbums();
	}

	public int contarCanciones() {
		
		return cancionesService.contarCanciones();
	}

	public int contarUsuarios() {
		
		return usuariosService.contarUsuarios();
	}
    public List<GraficaDashboardDTO> albumsUltimosDiezAnyos() {
        List<Object[]> rows = albumRepository.contarAlbumsPorAnyo();
        java.util.Map<Integer, Long> porAnyo = new java.util.HashMap<>();

        for (Object[] row : rows) {
            try {
                int anyo = Integer.parseInt(String.valueOf(row[0]).trim());
                porAnyo.put(anyo, ((Number) row[1]).longValue());
            } catch (NumberFormatException ignored) {
                // Ignoramos valores de año no numéricos para la gráfica.
            }
        }

        int actual = Year.now().getValue();
        List<GraficaDashboardDTO> result = new ArrayList<>();
        for (int anyo = actual - 9; anyo <= actual; anyo++) {
            result.add(new GraficaDashboardDTO(String.valueOf(anyo), porAnyo.getOrDefault(anyo, 0L)));
        }
        return result;
    }

    public List<GraficaDashboardDTO> topDiezPaisesArtistas() {
        return artistaRepository.contarArtistasPorPais().stream().limit(10)
            .map(r -> new GraficaDashboardDTO(String.valueOf(r[0]), ((Number) r[1]).longValue())).toList();
    }

    public List<GraficaDashboardDTO> artistasPorGenero() {
        return artistaRepository.contarArtistasPorGenero().stream()
            .map(r -> new GraficaDashboardDTO(String.valueOf(r[0]), ((Number) r[1]).longValue())).toList();
    }

    public List<GraficaDashboardDTO> topTreintaArtistasPorAlbums() {
        return artistaRepository.contarAlbumsPorArtista().stream().limit(50)
            .map(r -> new GraficaDashboardDTO(String.valueOf(r[0]), ((Number) r[1]).longValue())).toList();
    }

}

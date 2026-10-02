package es.rdm.Dimofy.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import es.rdm.Dimofy.config.CancionUtils;
import es.rdm.Dimofy.dto.AlbumCancionesDTO;
import es.rdm.Dimofy.dto.CancionesDTO;
import es.rdm.Dimofy.repository.Album;
import es.rdm.Dimofy.repository.Artista;
import es.rdm.Dimofy.repository.Canciones;
import es.rdm.Dimofy.service.AlbumService;
import es.rdm.Dimofy.service.ArtistaService;
import es.rdm.Dimofy.service.CancionesService;

@RestController
@RequestMapping("/app/canciones")
public class CancionesController {
	
	
	private final CancionesService cancionesService;
	private final AlbumService albumService;
	private final ArtistaService artistaService;
	
	public CancionesController(CancionesService cancionesService,AlbumService albumService, ArtistaService artistaService) {
		this.cancionesService = cancionesService;
		this.albumService = albumService;
		this.artistaService = artistaService;
	}
	
	@GetMapping("/buscar")
	public ResponseEntity<List<AlbumCancionesDTO>> buscarCanciones(
	        @RequestParam(required = false) String titulo,
	        @RequestParam(required = false) String artista,
	        @RequestParam(required = false) String anyo,
	        @RequestParam(required = false) String genero,
	        @RequestParam(required = false) String album) {

	        List<AlbumCancionesDTO> resultados = cancionesService.buscarCanciones(artista, titulo, album,anyo,genero);
	        return ResponseEntity.ok(resultados);
	}
	
	@PostMapping("/crear")
	public ResponseEntity<?> crearCanciones(@RequestBody List<CancionesDTO> cancionesDTO) {
	    
	    List<String> errores = new ArrayList<>();
	    
	    Map<String, String> duraciones = CancionUtils.obtenerDuracionesDesdeCarpeta(cancionesDTO.get(0).getAlbum());
	    
	    for (CancionesDTO dto : cancionesDTO) {
	        try {
	            Canciones cancion = new Canciones();
	    

	            
	            Artista artista = artistaService.buscarPorNombre(dto.getArtista());
	            if (artista == null) {
	                errores.add("Artista no encontrado para la canción: " + dto.getTitulo());
	                continue;
	            }

	            Optional<Album> album = albumService.buscarPorTituloYArtista(dto.getAlbum(), artista.getIdArtista());
	            if (album.isEmpty()) {
	                errores.add("Álbum no encontrado para la canción: " + dto.getTitulo());
	                continue;
	            }

	            cancion.setArtista(artista);
	            cancion.setAlbum(album.get());

	            String archivo = dto.getTitulo(); // "01 - Confession.mp3"

		         // Extrae el nombre después del " - "
		         int index = archivo.indexOf(" - ");
		         String nuevoNombre = (index != -1) ? archivo.substring(index + 3) : archivo;
	
		         // Elimina la extensión .mp3
		         nuevoNombre = nuevoNombre.replace(".mp3", "").trim();
	
		         // Ahora puedes buscar en el Map
		         String duracion = duraciones.get(nuevoNombre);
		         cancion.setTitulo(nuevoNombre);

	    	    if (duracion != null) {
	    	        cancion.setDuracion(duracion);
	    	    } else {
	    	    	cancion.setDuracion("00:00");
	    	    }
	            cancionesService.grabarCanciones(cancion);

	        } catch (Exception e) {
	            errores.add("Error al guardar la canción: " + dto.getTitulo());
	        }
	    }

	    if (!errores.isEmpty()) {
	        return ResponseEntity.badRequest().body(errores);
	    }

	    return ResponseEntity.ok().build();
	}
}




    

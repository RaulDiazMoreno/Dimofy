package es.rdm.Dimofy.controller;



import es.rdm.Dimofy.config.AssetPathUtils;
import org.springframework.beans.factory.annotation.Value;
import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.exc.StreamWriteException;
import com.fasterxml.jackson.databind.DatabindException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import es.rdm.Dimofy.DimofyComponent;
import es.rdm.Dimofy.dto.IdNombreDTO;
import es.rdm.Dimofy.repository.Artista;
import es.rdm.Dimofy.repository.Generos;
import es.rdm.Dimofy.repository.Paises;
import es.rdm.Dimofy.service.ArtistaService;
import es.rdm.Dimofy.service.GeneroService;
import es.rdm.Dimofy.service.PaisService;
import es.rdm.Dimofy.service.WikipediaService;




@RestController
@RequestMapping("/app/artistas")
public class ArtistaController {
    @Value("${app.artistas.path}")
    private String artistasPath;

	
	@Autowired
	private ArtistaService artistaService;
	
	@Autowired
	private GeneroService generoService;
	
	@Autowired
	private PaisService paisService;
	
	@Autowired
	private WikipediaService wikipediaService;
	
	
	@GetMapping
	public List<Artista> obtenerArtistas() {
		
		return artistaService.obtenerArtistas();
	}
	
	@GetMapping("/buscar")
	public ResponseEntity<List<Artista>> buscarArtistas(
	        @RequestParam(required = false) String nombre,
	        @RequestParam(required = false) Integer anyoInicio,
	        @RequestParam(required = false) String pais,
	        @RequestParam(required = false) String genero) {

	    List<Artista> resultado = artistaService.buscarArtistas(nombre, anyoInicio, pais, genero);
	    return ResponseEntity.ok(resultado);
	}

	@PostMapping("/crear")
    public ResponseEntity<?> crearArtista(
            @RequestParam("titulo") String titulo,
            @RequestParam("anyo") String anyo,
            @RequestParam("idGenero") Long idGenero,
            @RequestParam(value = "idPais", required = false) Long idPais,
            @RequestParam(value = "cover", required = false) MultipartFile cover) {

        try {
            Artista artista = new Artista();
            artista.setNombre(titulo);
            artista.setAnyoInicio(anyo);

            Generos genero = generoService.findById(idGenero)
                    .orElseThrow(() -> new RuntimeException("Género no encontrado"));
            artista.setGeneros(genero);

            if (idPais != null) {
                Paises pais = paisService.findById(idPais)
                        .orElseThrow(() -> new RuntimeException("País no encontrado"));
                artista.setPaises(pais);
            }

            if (cover != null && !cover.isEmpty()) {
                String nombreArchivo = titulo;
                String ruta = AssetPathUtils.asegurarDirectorio(artistasPath, "artistas").getAbsolutePath() + File.separator + nombreArchivo+".jpg";
                cover.transferTo(new java.io.File(ruta));
                ruta = AssetPathUtils.asegurarDirectorio(artistasPath, "artistas").getAbsolutePath() + File.separator + nombreArchivo+".webp";
                artista.setFoto(ruta); 
            }

            artistaService.grabar(artista);
            exportEntidad("Artista");
            return ResponseEntity.ok("Artista creado correctamente");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al crear el artista: " + e.getMessage());
        }
    }
	
	 private void exportEntidad(String entidad) throws StreamWriteException, DatabindException, IOException {
		   
		   List<IdNombreDTO> resultados = artistaService.obtenerIdYNombre();

	        ObjectMapper mapper = new ObjectMapper();
	        mapper.enable(SerializationFeature.INDENT_OUTPUT);
	        File file = new File ("C:/Users/Rauld/Downloads/React/dimofy/src/" + entidad.toLowerCase() + ".json");
	        file.getParentFile().mkdirs();
	        mapper.writeValue(file, resultados);
	}

	@GetMapping("/{id}")
	 public ResponseEntity<Artista> getArtistaById(@PathVariable Long id) {
	
		     Optional<Artista> optionalArtista = artistaService.findById(id);
		     if (optionalArtista.isEmpty()) {
		         return ResponseEntity.notFound().build();
		     }
		     Artista artista = optionalArtista.get();
		     String resumen = "";
		     if(artista.getResumenWikipedia()==null || artista.getResumenWikipedia().isEmpty()) {
		    	 try {
		    		 resumen = wikipediaService.getResumen(artista.getNombre()).block();
		    		 artista.setResumenWikipedia(resumen);
		    	 }catch(Exception e) {
		    		 artista.setResumenWikipedia("Sin información");
		    	 }
		     }
		     return ResponseEntity.ok(artista);
	 }
	 

	 @PostMapping("/editar/{idArtista}")
	 public ResponseEntity<?> editarArtista(@PathVariable("idArtista") Long idArtista, 
	         @RequestParam("nombre") String nombre,
	         @RequestParam("anyoInicio") String anyoInicio,
	         @RequestParam("resumenWikipedia") String resumenWikipedia,
	         @RequestParam("idPais") Long idPais,
	         @RequestParam("idGenero") Long idGenero,
	         @RequestHeader("Authorization") String authHeader,
	         @RequestParam(value = "foto", required = false) MultipartFile foto
	 ) {
	     try {
	         artistaService.editarArtista(idArtista, nombre, anyoInicio, resumenWikipedia, idPais, idGenero, foto);
	         return ResponseEntity.ok("Artista modificado correctamente");
	     } catch (Exception e) {
	         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al actualizar el artista");
	     }
	 }	
	 
	 @DeleteMapping("/eliminar/{id}")
	    public ResponseEntity<?> eliminarArtista(@PathVariable Long id) {
	        try {
	            boolean eliminado = artistaService.eliminarArtistaPorId(id);
	            if (eliminado) {
	                return ResponseEntity.ok().build();
	            } else {
	                return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                        .body("Artista no encontrado o no se pudo eliminar.");
	            }
	        } catch (Exception e) {
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                    .body("Error al eliminar el artista: " + e.getMessage());
	        }
	    }
	 
	 
}



 


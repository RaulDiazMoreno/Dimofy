package es.rdm.Dimofy.controller;




import java.io.File;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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



import es.rdm.Dimofy.dto.AlbumCancionesDTO;
import es.rdm.Dimofy.dto.AlbumDTO;
import es.rdm.Dimofy.dto.CancionesDTO;
import es.rdm.Dimofy.repository.Album;
import es.rdm.Dimofy.repository.Artista;
import es.rdm.Dimofy.repository.Generos;
import es.rdm.Dimofy.service.AlbumService;
import es.rdm.Dimofy.service.ArtistaService;
import es.rdm.Dimofy.service.CancionesService;
import es.rdm.Dimofy.service.GeneroService;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;


@RestController
@RequestMapping("/app/albums")
public class AlbumsController {
    @Value("${app.covers.path}")
    private String coversPath;

    private static final Logger log = LoggerFactory.getLogger(AlbumsController.class);

	
	private final AlbumService albumService;
	private final ArtistaService artistaService;
	private final GeneroService generoService;
	private final CancionesService cancionesService;
	
	
	public AlbumsController(AlbumService albumService,
							ArtistaService artistaService,
							GeneroService generoService,
							CancionesService cancionesService) {
		this.albumService=albumService;
		this.artistaService=artistaService;
		this.generoService=generoService;
		this.cancionesService=cancionesService;
	}
	
	@GetMapping("/buscar")
	public List<AlbumDTO> buscarAlbums(
	    @RequestParam(required = false) String genero,
	    @RequestParam(required = false) String artista,
	    @RequestParam(required = false) String anyo,
	    @RequestParam(required = false) String titulo
	) {
		List<AlbumDTO> albums= new ArrayList<AlbumDTO>();
		try {
			albums= albumService.buscarAlbums(genero, artista, anyo, titulo);
		}catch(Exception e) {
			e.printStackTrace();
		}
		return albums;
		
	}

	@GetMapping("/buscar/paginado")
	public ResponseEntity<Page<AlbumDTO>> buscarAlbumsPaginados(
	    @RequestParam(required = false) String genero,
	    @RequestParam(required = false) String artista,
	    @RequestParam(required = false) String anyoInicio,
	    @RequestParam(required = false) String anyoFin,
	    @RequestParam(required = false) String titulo,
	    @RequestParam(defaultValue = "0") int page,
	    @RequestParam(defaultValue = "12") int size
	) {
		int safePage = Math.max(0, page);
		int safeSize = Math.min(Math.max(1, size), 48);
		Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by("titulo").ascending());
		return ResponseEntity.ok(
			albumService.buscarAlbumsPaginados(genero, artista, anyoInicio, anyoFin, titulo, pageable)
		);
	}

	@GetMapping("/total")
	public List<AlbumDTO> todosAlbums() {
	    return albumService.todosAlbums();
	}
	

	@PostMapping(value = "/crear")
    public ResponseEntity<?> crearAlbum(
    	    @RequestParam("titulo") String titulo,
    	    @RequestParam("anyo") String anyo,
    	    @RequestParam("idGenero") Long idGenero,
    	    @RequestParam("idArtista") Long idArtista,
    	    @RequestParam(value = "cover", required = false) MultipartFile cover
    	){

        try {
             
            Optional<Artista> artistaOptional = artistaService.findById(idArtista);
            if (!artistaOptional.isPresent()) {
                return ResponseEntity.badRequest().body("Artista no encontrado con ID: " + idArtista);
            }
            Artista artista = artistaOptional.get();

            Optional<Generos> generoOptional = generoService.findById(idGenero);
            
            if (!generoOptional.isPresent()) {
                return ResponseEntity.badRequest().body("Género no encontrado con ID: " + idGenero);
            }
            
            Generos genero = generoOptional.get();
            
            String tituloNormalizado = normalizarTexto(titulo);            
            
            tituloNormalizado=removeAccents(tituloNormalizado);
            
            Optional<Album> albumExistente = albumService.buscarPorTituloYArtista(tituloNormalizado, idArtista);
            
            if (albumExistente.isPresent()) {
                Album a = albumExistente.get();
                if (normalizarTexto(a.getTitulo()).equals(tituloNormalizado)) {
                    return ResponseEntity.badRequest().body("Ya existe un álbum con ese título para el artista.");
                }
            }

            Album album = new Album();
            album.setTitulo(titulo.toUpperCase());
            album.setAnyo(anyo);
            album.setArtista(artista);
            album.setGenero(genero);

            if (cover != null && !cover.isEmpty()) {
                String nombreArchivo = artista.getNombre()+"-"+album.getTitulo()+".jpg";
                String ruta = coversPath + File.separator + nombreArchivo;
                cover.transferTo(new java.io.File(ruta));
                album.setCover("/assets/" + nombreArchivo); 
            }

            Album guardado = albumService.grabarAlbum(album);
            return ResponseEntity.ok(guardado);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al crear el álbum: " + e.getMessage());
        } 
    }

	private String normalizarTexto(String input) {

        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized).replaceAll("").toLowerCase().replaceAll("[^a-z0-9 ]", "");

	}
	
	 public String removeAccents(String input) {
         return Normalizer.normalize(input, Normalizer.Form.NFD)
                          .replaceAll("\\p{M}", "");
     }
	 
	 @DeleteMapping("/eliminar/{id}")
	 public ResponseEntity<Void> eliminarAlbum(@PathVariable Long id) {
	     albumService.eliminarAlbumYSusCanciones(id);
	     return ResponseEntity.noContent().build();
	 }
	 
	 @GetMapping("/{id}")
	 public ResponseEntity<AlbumCancionesDTO> getAlbumById(@PathVariable Long id) {
	
		     Optional<Album> optionalAlbum = albumService.findById(id);
		     if (optionalAlbum.isEmpty()) {
		         return ResponseEntity.notFound().build();
		     }

		     Album album = optionalAlbum.get();
		     AlbumCancionesDTO dto = new AlbumCancionesDTO();
		     dto.setIdAlbum(album.getIdAlbum());
		     dto.setTitulo(album.getTitulo());
		     dto.setAnyo(album.getAnyo());
		     dto.setCover(album.getCover());
		     dto.setArtista(album.getArtista().getNombre());
		     dto.setGenero(album.getGenero().getNombreGenero());

		     List<CancionesDTO> canciones = cancionesService.encontrarCancionesById(id);
		     dto.setCanciones(canciones);

		     return ResponseEntity.ok(dto);

	 }


	@PostMapping("/editar/{id}")
    public ResponseEntity<?> editarAlbum(
            @PathVariable Long id,
            @RequestParam("titulo") String titulo,
            @RequestParam("anyo") String anyo,
            @RequestParam("idArtista") String idArtista,
            @RequestParam("idGenero") String idGenero,
            @RequestParam(value = "cover", required = false) MultipartFile cover,
            @RequestHeader("Authorization") String authHeader
    ) {
		try {
		 Optional<Album> albumExistente = albumService.findById(id);
         if (!albumExistente.isPresent()) {
             return ResponseEntity.badRequest().body("Álbum no encontrado con ID: " + id);
         }

         Album album = albumExistente.get();
         album.setTitulo(titulo);
         album.setAnyo(anyo);

         // Procesar la imagen si se proporciona
         if (cover != null && !cover.isEmpty()) {
             String nombreArchivo = cover.getOriginalFilename();
             String ruta = coversPath + File.separator + nombreArchivo;
             cover.transferTo(new java.io.File(ruta));
             album.setCover("/assets/" + nombreArchivo);
         }

         // Buscar y asignar artista
        
         boolean esNumero = esDecimal(idArtista);
         if(esNumero) {
        	 Optional<Artista> artistaOptional = artistaService.findById(Long.valueOf(idArtista));
        	 if (!artistaOptional.isPresent()) {
                 return ResponseEntity.badRequest().body("Álbum no encontrado con ID: " + id);
             }
        	 album.setArtista(artistaOptional.get());
         }else {
        	 Artista artistaOptional = artistaService.buscarPorNombre(idArtista);
             if (artistaOptional==null) {
                 return ResponseEntity.badRequest().body("Artista no encontrado con ID: " + idArtista);
             }
             album.setArtista(artistaOptional);
         }
         
         // Buscar y asignar género
         esNumero = esDecimal(idGenero);
         if(esNumero) {
        	 Optional<Generos> generoOptional = generoService.findById(Long.valueOf(idGenero));
        	 if (!generoOptional.isPresent()) {
        		 return ResponseEntity.badRequest().body("Género no encontrado con ID: " + idGenero);
             }
        	 album.setGenero(generoOptional.get());
         }else {
        	 Generos generoOptional = generoService.findByNombre(idGenero);
             if (generoOptional==null) {
                 return ResponseEntity.badRequest().body("Género no encontrado con ID: " + idGenero);
             }
        	 album.setGenero(generoOptional);
         }
         
         

         // Guardar cambios
         Album guardado = albumService.grabarAlbum(album);
         return ResponseEntity.ok(guardado);

     } catch (Exception e) {

    	 return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("Error al actualizar el álbum: " + e.getMessage());

     }
   }
	
	@GetMapping("/generar")
	public ResponseEntity<?> generarFicheroCarga(@RequestParam(name = "recopilatorio", defaultValue = "false") boolean esRecopilatorio) {
	    try {   
	    	Path discosDir = null;
	    	if (esRecopilatorio) {
	    		discosDir = Paths.get("C:/Users/Rauld/Music/Recopilatorios");
	    	}else {
	    		discosDir = Paths.get("C:/Users/Rauld/Music/Discos");
	    	}
	    	

	        // Recorremos todos los álbumes dentro de "Discos"
	        try (DirectoryStream<Path> albums = Files.newDirectoryStream(discosDir)) {
	            for (Path album : albums) {
	                if (Files.isDirectory(album)) {
	                    log.info(String.valueOf("Procesando álbum: " + album.getFileName()));
	                    flattenAlbum(album);
	                }
	            }
	        }

	        ResponseEntity<List<AlbumCancionesDTO>> lista = albumService.generarJsonCarga(esRecopilatorio);
	        return ResponseEntity.ok(lista);
	    } catch (IOException e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body("Error al generar el fichero de carga");
	    }
	}

	
	@PostMapping("/cargar")
	public ResponseEntity<?> cargarFichero() {
	    try {
	        albumService.cargarDesdeJson();
	        return ResponseEntity.ok("Carga completada");
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                             .body("Error al leer el fichero JSON");
	    }
	}
	
	@DeleteMapping("/borradoMasivo")
	public ResponseEntity<?> borrarTodosLosAlbums() {
	    albumService.borradoMasivoAlbumsYCanciones();
	    return ResponseEntity.ok().build();
	}
	
	 public boolean esDecimal(String valor) {
 	    try {
 	        Double.parseDouble(valor);
 	        return true;
 	    } catch (NumberFormatException e) {
 	        return false;
 	    }
 	}
	 
	 @GetMapping("/pdf")
	 public ResponseEntity<Resource> getPdf() throws IOException {
	     // Ruta absoluta o relativa al archivo en el frontend
	     Path pdfPath = Paths.get("../public/assets/AvisosCargaMasivaAlbums.pdf").toAbsolutePath();
	     Resource resource = new UrlResource(pdfPath.toUri());

	     if (!resource.exists()) {
	         return ResponseEntity.notFound().build();
	     }

	     return ResponseEntity.ok()
	         .contentType(MediaType.APPLICATION_PDF)
	         .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=AvisosCargaMasivaAlbums.pdf")
	         .body(resource);
	 }
	 
	 private static void flattenAlbum(Path baseDir) throws IOException {
	        Files.walkFileTree(baseDir, new SimpleFileVisitor<Path>() {
	            @Override
	            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
	                Path parent = file.getParent();
	                if (!parent.equals(baseDir)) {
	                    Path target = baseDir.resolve(file.getFileName());
	                    Files.move(file, target, StandardCopyOption.REPLACE_EXISTING);
	                    log.info(String.valueOf("Movido: " + file + " -> " + target));
	                }
	                return FileVisitResult.CONTINUE;
	            }

	            @Override
	            public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
	                if (!dir.equals(baseDir)) {
	                    try (DirectoryStream<Path> stream = Files.newDirectoryStream(dir)) {
	                        boolean hasSubfolders = false;
	                        for (Path entry : stream) {
	                            if (Files.isDirectory(entry)) {
	                                hasSubfolders = true;
	                                break;
	                            }
	                        }
	                        if (!hasSubfolders) {
	                            try (DirectoryStream<Path> checkEmpty = Files.newDirectoryStream(dir)) {
	                                if (!checkEmpty.iterator().hasNext()) {
	                                    Files.delete(dir);
	                                    log.info(String.valueOf("Eliminado directorio vacío: " + dir));
	                                }
	                            }
	                        }
	                    }
	                }
	                return FileVisitResult.CONTINUE;
	            }
	        });
	    }
	 

	 @GetMapping("/artista/{idArtista}")
	 public ResponseEntity<List<AlbumDTO>> getAlbumsByArtista(@PathVariable Long idArtista) {
	     List<Album> albums = albumService.findByArtistaId(idArtista);
	     List<AlbumDTO> dtoList = albums.stream()
	         .map(album -> new AlbumDTO(album.getIdAlbum(), album.getCover(),album.getAnyo(),album.getTitulo()))
	         .collect(Collectors.toList());
	     return ResponseEntity.ok(dtoList);
	 }
	 
	 @GetMapping("/artista/{idArtista}/paginado")
	 public ResponseEntity<Page<AlbumDTO>> getAlbumsByArtistaPaginados(
	         @PathVariable Long idArtista,
	         @RequestParam(defaultValue = "0") int page,
	         @RequestParam(defaultValue = "12") int size) {
	     int safePage = Math.max(0, page);
	     int safeSize = Math.min(Math.max(1, size), 48);
	     Pageable pageable = PageRequest.of(
	             safePage,
	             safeSize,
	             Sort.by(Sort.Order.desc("anyo"), Sort.Order.asc("titulo"))
	     );
	     return ResponseEntity.ok(albumService.buscarAlbumsPorArtistaPaginados(idArtista, pageable));
	 }

	 @GetMapping("/genero/{idGenero}")
	 public ResponseEntity<Page<AlbumDTO>> getAlbumsPorGenero(
	         @PathVariable Long idGenero,
	         @RequestParam(defaultValue = "0") int page,
	         @RequestParam(defaultValue = "12") int size
	 ) {
	     int safePage = Math.max(0, page);
	     int safeSize = Math.min(Math.max(1, size), 48);
	     Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by("titulo").ascending());
	     return ResponseEntity.ok(albumService.buscarAlbumsPorGenero(idGenero, pageable));
	 }

	 @GetMapping("/genero/{idGenero}/iniciales-artistas")
	 public ResponseEntity<List<String>> getInicialesArtistasPorGenero(@PathVariable Long idGenero) {
	     return ResponseEntity.ok(albumService.buscarInicialesArtistasPorGenero(idGenero));
	 }

	 @GetMapping("/genero/{idGenero}/inicial/{inicial}")
	 public ResponseEntity<Page<AlbumDTO>> getAlbumsPorGeneroEInicialArtista(
	         @PathVariable Long idGenero,
	         @PathVariable String inicial,
	         @RequestParam(defaultValue = "0") int page,
	         @RequestParam(defaultValue = "12") int size
	 ) {
	     int safePage = Math.max(0, page);
	     int safeSize = Math.min(Math.max(1, size), 12);
	     String safeInicial = inicial == null ? "" : inicial.trim();
	     if (safeInicial.isEmpty()) {
	         return ResponseEntity.badRequest().build();
	     }
	     Pageable pageable = PageRequest.of(
	             safePage,
	             safeSize,
	             Sort.by(Sort.Order.asc("artista.nombre"), Sort.Order.asc("titulo"))
	     );
	     return ResponseEntity.ok(
	             albumService.buscarAlbumsPorGeneroEInicialArtista(idGenero, safeInicial.substring(0, 1), pageable)
	     );
	 }
	 
	 @GetMapping("/artistAlbum/{idAlbum}")
     public ResponseEntity<List<AlbumDTO>> getAlbumsPorArtista(@PathVariable Long idAlbum) {
		 List<AlbumDTO> albums = albumService.buscarAlbumsPorArtista(idAlbum);
        return ResponseEntity.ok(albums);
    }
	 
	 @GetMapping("/titulo/{titulo}")
     public ResponseEntity<AlbumCancionesDTO> getAlbumPorCancion(@PathVariable String titulo) {
		 List<AlbumDTO> albums =  albumService.buscarAlbumsPorTitulo(titulo);
		 Optional<Album> optionalAlbum = albumService.findById(albums.get(0).getIdAlbum());
	     if (optionalAlbum.isEmpty()) {
	         return ResponseEntity.notFound().build();
	     }

	     Album album = optionalAlbum.get();
	     AlbumCancionesDTO dto = new AlbumCancionesDTO();
	     dto.setIdAlbum(album.getIdAlbum());
	     dto.setTitulo(album.getTitulo());
	     dto.setAnyo(album.getAnyo());
	     dto.setCover(album.getCover());
	     dto.setArtista(album.getArtista().getNombre());
	     dto.setGenero(album.getGenero().getNombreGenero());

	     List<CancionesDTO> canciones = cancionesService.encontrarCancionesById(dto.getIdAlbum());
	     dto.setCanciones(canciones);

	     return ResponseEntity.ok(dto);

    }	
}

    



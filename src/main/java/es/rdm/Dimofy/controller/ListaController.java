package es.rdm.Dimofy.controller;



import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.StreamWriteConstraints;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import es.rdm.Dimofy.dto.CancionesDTO;
import es.rdm.Dimofy.dto.ListaDashboardDTO;
import es.rdm.Dimofy.dto.PlaylistDetailDTO;
import es.rdm.Dimofy.repository.Canciones;
import es.rdm.Dimofy.repository.Listas;
import es.rdm.Dimofy.repository.Usuarios;
import es.rdm.Dimofy.service.CancionesService;
import es.rdm.Dimofy.service.ListasService;
import es.rdm.Dimofy.service.UsuariosService;

@RestController
@RequestMapping("/app/listas")
public class ListaController {
    @Value("${app.covers.path}")
    private String coversPath;

    private static final Logger log = LoggerFactory.getLogger(ListaController.class);

	
	private final ListasService listaService;
	private final CancionesService cancionesService;
	private final UsuariosService usuariosService;
	
	public ListaController(ListasService listaService, CancionesService cancionesService,UsuariosService usuariosService) {
	        this.listaService = listaService;
	        this.cancionesService = cancionesService;
	        this.usuariosService= usuariosService;
	}

	@GetMapping("/usuario/{id}")
	public ResponseEntity<List<ListaDashboardDTO>> obtenerListasPorUsuario(@PathVariable("id") Long userId) {
	    List<Listas> listas = listaService.obtenerListasPorUsuario(userId);

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

	
	
	@GetMapping("/canciones")
	public ResponseEntity<List<CancionesDTO>>buscarCanciones(
	            @RequestParam(required = false) String artista,
	            @RequestParam(required = false) String titulo) {

		log.info(String.valueOf("🔍 Buscando canciones con artista: " + artista + ", título: " + titulo));

	   	List<CancionesDTO> canciones= cancionesService.buscarPorArtistaOTitulo(artista, titulo);
	   	return ResponseEntity.ok(canciones);
	 }
	
	@PostMapping("/guardarLista")
	public ResponseEntity<?> guardarLista(
	    @RequestParam("nombre") String nombre,
	    @RequestParam(value = "caratula", required = false) MultipartFile caratula,
	    @RequestParam("canciones") String cancionesJson,
	    @RequestParam("userName") String userName,
	    @RequestParam("userId") Long userId
	) throws IOException {
	    // Parsear canciones
	    ObjectMapper mapper = new ObjectMapper();
	
	    mapper.getFactory().setStreamWriteConstraints(
	        StreamWriteConstraints.builder().maxNestingDepth(2000).build()
	    );


	    List<Long> cancionesIds = mapper.readValue(cancionesJson, new TypeReference<List<Long>>() {});

	    // Buscar usuario
	    Usuarios usuario = (Usuarios) usuariosService.encontrarById(userId);

	    // Buscar canciones
	    List<Canciones> canciones = cancionesService.encontrarCancionesById(cancionesIds);

	    // Guardar carátula (si aplica)
	    String caratulaPath = null;
	    if (caratula != null && !caratula.isEmpty()) {
	        // Guardar archivo en disco o en la nube
	        caratulaPath = guardarArchivo(caratula,nombre);
	    }
	    
	    // Crear y guardar lista
	    Listas lista = new Listas();
	    lista.setNombre(nombre);
	    lista.setCaratula(caratulaPath);
	    lista.setUsuario(usuario);
	    lista.setUserName(userName);
	    lista.setCanciones(canciones);
	    lista.setNumeroCanciones(String.valueOf(canciones.size()));

	    listaService.grabarLista(lista);

	    return ResponseEntity.ok("Lista guardada correctamente");
	}
	
	

	public String guardarArchivo(MultipartFile archivo, String nombreLista) throws IOException {
	    // Ruta base donde se guardarán las carátulas
	    String directorioBase = "C:/Users/Rauld/Downloads/React/dimofy/public/assets/Cover/";

	    // Crear el directorio si no existe
	    File directorio = new File(directorioBase);
	    if (!directorio.exists()) {
	        directorio.mkdirs();
	    }

	    // Limpiar el nombre de la lista para que sea válido como nombre de archivo
	    String nombreLimpio = nombreLista.replaceAll("[^a-zA-Z0-9\\-_\\.]", "_");

	    // Obtener la extensión del archivo original
	    String extension = "";
	    String originalName = archivo.getOriginalFilename();
	    if (originalName != null && originalName.contains(".")) {
	        extension = originalName.substring(originalName.lastIndexOf("."));
	    }

	    // Construir el nombre del archivo
	    String nombreArchivo = nombreLimpio + extension;

	    // Ruta completa del archivo
	    Path rutaArchivo = Paths.get(directorioBase + nombreArchivo);

	    // Guardar el archivo en el sistema de archivos
	    Files.copy(archivo.getInputStream(), rutaArchivo, StandardCopyOption.REPLACE_EXISTING);

	    // Devolver el nombre del archivo para guardar en la base de datos
	    return nombreArchivo;
	}
	
	@GetMapping("/consultar/{id}")
	public ResponseEntity<List<CancionesDTO>> consultarCancionesDeLista(@PathVariable Long id) {
	    Optional<Listas> listaOpt = listaService.encontrarCancionesById(id);
	    if (listaOpt.isPresent()) {
	        List<CancionesDTO> cancionesDTO = listaOpt.get().getCanciones().stream()
	            .map(c -> new CancionesDTO(
	                c.getIdCancion(),
	                c.getTitulo(),
	                c.getArtista().getNombre(), 
	                c.getDuracion(),
	                c.getAlbum().getTitulo()   
	            ))
	            .collect(Collectors.toList());

	        return ResponseEntity.ok(cancionesDTO);
	    } else {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
	    }
	}
	
    @DeleteMapping("/{idLista}")
	public ResponseEntity<?> borrarLista(@PathVariable Long idLista) {
	        boolean borrado = listaService.borrarLista(idLista);
	        if (borrado) {
	            return ResponseEntity.ok().build();
	        } else {
	            return ResponseEntity.notFound().build();
	        }
	}
    
    @GetMapping("/{id}")
    public ResponseEntity<Listas> obtenerListaPorId(@PathVariable Long id) {
    	
    	 return listaService.encontrarListasById(id);
        
    }

    @GetMapping("/cancionesE")
	public ResponseEntity<List<Canciones>>buscarCancionesEditar(
	            @RequestParam(required = false) String artista,
	            @RequestParam(required = false) String titulo) {

		log.info(String.valueOf("🔍 Buscando canciones con artista: " + artista + ", título: " + titulo));

	   	List<Canciones> canciones= cancionesService.buscarPorArtistaOTituloEditar(artista, titulo);
	   	return ResponseEntity.ok(canciones);
	 }
    
    @PutMapping(value = "/Editar/{id}")
    public ResponseEntity<?> actualizarLista(
        @PathVariable Long id,
        @RequestParam("nombre") String nombre,
        @RequestParam(value = "caratula", required = false) MultipartFile caratula,
        @RequestParam("canciones") String cancionesJson,
        Principal principal
    ) {
        try {
            List<Long> idsCanciones = new ObjectMapper().readValue(cancionesJson, new TypeReference<List<Long>>() {});
            listaService.actualizarLista(id, nombre, caratula, idsCanciones, principal.getName());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al actualizar la lista");
        }
    }
    
    @GetMapping("/detalle/{id}")
    public ResponseEntity<PlaylistDetailDTO> obtenerDetalleLista(@PathVariable Long id) {

        Listas lista = listaService.encontrarListaEntidadById(id);

        PlaylistDetailDTO dto = new PlaylistDetailDTO(
            lista.getIdLista(),
            lista.getNombre(),
            lista.getCaratula(),
            lista.getNumeroCanciones()
        );

        return ResponseEntity.ok(dto);
    }


}



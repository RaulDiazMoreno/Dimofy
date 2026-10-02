package es.rdm.Dimofy.service;


import org.springframework.beans.factory.annotation.Value;
import java.io.File;
import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import es.rdm.Dimofy.repository.Canciones;
import es.rdm.Dimofy.repository.CancionesRepository;
import es.rdm.Dimofy.repository.Listas;
import es.rdm.Dimofy.repository.ListasRepository;
import jakarta.persistence.EntityNotFoundException;

@Service
public class ListasService {
    @Value("${app.covers.path}")
    private String coversPath;

	
	private final ListasRepository listasRepository;
	private final CancionesRepository cancionesRepository;
	
	public ListasService(ListasRepository listasRepository,CancionesRepository cancionesRepository) {
		this.listasRepository = listasRepository;
		this.cancionesRepository = cancionesRepository;
	}

	public List<Listas> obtenerListasPorUsuario(Long userId) {
		
		List<Listas> lista = listasRepository.findByUsuarioId(userId);
		return lista;
	}

	public List<Listas> obtenerListasPorUserName(String userName) {
		
		return listasRepository.findByUserName(userName);
	}

	public void grabarLista(Listas lista) {
		
		listasRepository.save(lista);
		
	}

	public Optional<Listas> encontrarCancionesById(Long id) {
	
		return 	listasRepository.findById(id);
	}

	
    public boolean borrarLista(Long idLista) {
	    Optional<Listas> lista = listasRepository.findById(idLista);
	    if (lista.isPresent()) {
	        listasRepository.deleteById(idLista);
	         return true;
        }
	    return false;
    }

    public void actualizarLista(Long id, String nombre, MultipartFile caratula) throws IOException {
        Listas lista = listasRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Lista no encontrada"));

        lista.setNombre(nombre);

        if (caratula != null && !caratula.isEmpty()) {
            String nombreArchivo = UUID.randomUUID() + "_" + caratula.getOriginalFilename();
            Path rutaArchivo = Paths.get("uploads").resolve(nombreArchivo);
            Files.copy(caratula.getInputStream(), rutaArchivo, StandardCopyOption.REPLACE_EXISTING);
            lista.setCaratula(nombreArchivo);
        }

        listasRepository.save(lista);
    }

	public ResponseEntity<Listas> encontrarListasById(Long id) {
		Optional<Listas> lista = listasRepository.findById(id);
        return lista.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
		
	}
	
	public void actualizarLista(Long id, String nombre, MultipartFile caratula, List<Long> idsCanciones, String username) throws IOException {
		
	    Listas lista = listasRepository.findById(id).orElseThrow(() -> new RuntimeException("Lista no encontrada"));

	    if (!lista.getUserName().equals(username)) {
	        throw new AccessDeniedException("No autorizado");
	    }

	    lista.setNombre(nombre);

	    if (caratula != null && !caratula.isEmpty()) {
	        String nombreArchivo = guardarCaratula(caratula); // tu lógica para guardar imagen
	        lista.setCaratula(nombreArchivo);
	    }

	    List<Canciones> nuevasCanciones = cancionesRepository.findAllById(idsCanciones);
	    lista.setCanciones(nuevasCanciones);
	    lista.setNumeroCanciones(String.valueOf(nuevasCanciones.size()));

	    listasRepository.save(lista);
	}

		public String guardarCaratula(MultipartFile archivo) throws IOException {
		    if (archivo == null || archivo.isEmpty()) {
		        throw new IllegalArgumentException("El archivo de carátula está vacío");
		    }

		    String directorio = "C:/Users/Rauld/Downloads/React/dimofy/public/assets/Cover/";
		    File carpeta = new File(directorio);
		    if (!carpeta.exists()) {
		        carpeta.mkdirs();
		    }

		    String nombreArchivo = UUID.randomUUID().toString() + "_" + archivo.getOriginalFilename();
		    Path rutaArchivo = Paths.get(directorio, nombreArchivo);

		    // Guardar el archivo
		    Files.copy(archivo.getInputStream(), rutaArchivo, StandardCopyOption.REPLACE_EXISTING);

		    return nombreArchivo;
		}

		public int contarListas() {
			
			return (int) listasRepository.count();
		}
		
		public Listas encontrarListaEntidadById(Long id) {
		    return listasRepository.findById(id)
		        .orElseThrow(() -> new EntityNotFoundException("Lista no encontrada"));
		}

}

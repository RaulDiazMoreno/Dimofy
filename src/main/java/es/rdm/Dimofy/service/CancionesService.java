package es.rdm.Dimofy.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import es.rdm.Dimofy.dto.AlbumCancionesDTO;
import es.rdm.Dimofy.dto.CancionesDTO;
import es.rdm.Dimofy.repository.Album;
import es.rdm.Dimofy.repository.CancionSpecification;
import es.rdm.Dimofy.repository.Canciones;
import es.rdm.Dimofy.repository.CancionesRepository;
import es.rdm.Dimofy.repository.GeneroRepository;
import es.rdm.Dimofy.repository.Generos;

@Service
public class CancionesService {
	
	private final CancionesRepository cancionesRepository;
	private final GeneroRepository generoRepository;

	public CancionesService(CancionesRepository cancionesRepository,GeneroRepository generoRepository) {
		this.cancionesRepository = cancionesRepository;
		this.generoRepository=generoRepository;
	}
	
	public List<CancionesDTO> buscarPorArtistaOTitulo(String artista, String titulo) {
	    if (artista != null && titulo != null) {
	        List<Canciones> canciones = cancionesRepository.findByArtistaNombreAndTitulo(artista, titulo);
	        return conversion(canciones);
	    } else if (artista != null) {
	    	List<Canciones> canciones =  cancionesRepository.findByArtistaNombre(artista);
	        return conversion(canciones);
	    	
	    } else if (titulo != null) {
	    	List<Canciones> canciones = cancionesRepository.findByTituloLike(titulo);
	        return conversion(canciones);
	    } else {
	    	List<Canciones> canciones = cancionesRepository.findAll();
	        return conversion(canciones);
	    }
	}

	private List<CancionesDTO> conversion(List<Canciones> canciones) {
		
		List<CancionesDTO> cancionesDTO = canciones.stream()
	            .map(CancionesDTO::fromEntity)
	            .collect(Collectors.toList());
		return cancionesDTO;
	}

	public List<Canciones> encontrarCancionesById(List<Long> cancionesIds) {
		
		List<Canciones> canciones = cancionesRepository.findAllById(cancionesIds);

		return canciones;
		
	}

	public List<Canciones> buscarPorArtistaOTituloEditar(String artista, String titulo) {
		
		if (artista != null && titulo != null) {
	        List<Canciones> canciones = cancionesRepository.findByArtistaNombreAndTitulo(artista, titulo);
	        return canciones;
	    } else if (artista != null) {
	    	List<Canciones> canciones =  cancionesRepository.findByArtistaNombre(artista);
	        return canciones;
	    	
	    } else if (titulo != null) {
	    	List<Canciones> canciones = cancionesRepository.findByTituloLike(titulo);
	        return canciones;
	    } else {
	    	List<Canciones> canciones = cancionesRepository.findAll();
	        return canciones;
	    }
	}

	public int contarCanciones() {
		
		return (int) cancionesRepository.count();
	}

	public List<CancionesDTO> encontrarCancionesById(Long id) {

		List<Canciones> canciones = cancionesRepository.findByAlbum_IdAlbum(id);
		List<CancionesDTO> lista = new ArrayList<CancionesDTO>();
		for (Canciones c : canciones) {
			CancionesDTO cancion = new CancionesDTO();
			cancion.setTitulo(c.getTitulo());
			cancion.setArtista(c.getArtista().getNombre());
			cancion.setDuracion(c.getDuracion());
			cancion.setAlbum(c.getAlbum().getTitulo());
			lista.add(cancion);
		}

		return lista;
	}

	public List<AlbumCancionesDTO> buscarCanciones(String artista, String titulo, String album, String anyo, String genero) {
	    
	    Specification<Canciones> spec = Specification.where(null);
	    List<AlbumCancionesDTO> resultado = new ArrayList<>();

	    if (artista != null && !artista.isEmpty()) {
	        spec = spec.and(CancionSpecification.conArtista(artista));
	        List<Canciones> canciones = cancionesRepository.findAll(spec);
		    Map<Album, List<Canciones>> cancionesPorAlbum = canciones.stream()
		        .collect(Collectors.groupingBy(Canciones::getAlbum));
		    resultado=TransformarADto(cancionesPorAlbum);
		    resultado=ordenarPorTitulo(resultado);
	        
	    }
	    if (titulo != null && !titulo.isEmpty()) {
	        spec = spec.and(CancionSpecification.conTitulo(titulo));
	        List<Canciones> canciones = cancionesRepository.findAll(spec);
	        Map<Album, List<Canciones>> cancionesPorAlbum = canciones.stream()
			        .collect(Collectors.groupingBy(Canciones::getAlbum));
			    resultado=TransformarADto(cancionesPorAlbum);
			    resultado=ordenarPorTitulo(resultado);
	    }
	    if (album != null && !album.isEmpty()) {
	        spec = spec.and(CancionSpecification.conAlbum(album));
	        List<Canciones> canciones = cancionesRepository.findAll(spec);
	        Map<Album, List<Canciones>> cancionesPorAlbum = canciones.stream()
			        .collect(Collectors.groupingBy(Canciones::getAlbum));
			    resultado=TransformarADto(cancionesPorAlbum);
			    resultado=ordenarPorTitulo(resultado);
	    }
	    if (anyo != null && !anyo.isEmpty()) {
	        spec = spec.and(CancionSpecification.conAnyo(anyo));
	        List<Canciones> canciones = cancionesRepository.findAll(spec);
	        Map<Album, List<Canciones>> cancionesPorAlbum = canciones.stream()
			        .collect(Collectors.groupingBy(Canciones::getAlbum));
			    resultado=TransformarADto(cancionesPorAlbum);
			    resultado=ordenarPorTitulo(resultado);
	    }
	    if (genero != null && !genero.isEmpty()) {
	    	Generos genre = generoRepository.findGenerosByNombreGenero(genero);
	        spec = spec.and(CancionSpecification.conGenero(genre.getIdGenero()));
	        List<Canciones> canciones = cancionesRepository.findAll(spec);
	        Map<Album, List<Canciones>> cancionesPorAlbum = canciones.stream()
			        .collect(Collectors.groupingBy(Canciones::getAlbum));
			resultado=TransformarADto(cancionesPorAlbum);
			resultado=ordenarPorArtista(resultado);
	    }
	    
	    if ((artista == null || artista.isEmpty()) &&
	    	(titulo == null || titulo.isEmpty()) &&
	    	(album == null || album.isEmpty()) &&
	    	(anyo == null || anyo.isEmpty()) &&
	    	(genero == null || genero.isEmpty())) {
	    	    List<Canciones> canciones = cancionesRepository.findAll();
	    	    Map<Album, List<Canciones>> cancionesPorAlbum = canciones.stream()
	    	        .collect(Collectors.groupingBy(Canciones::getAlbum));
	    	    resultado = TransformarADto(cancionesPorAlbum);
	    	    resultado = ordenarPorArtista(resultado);
	    }


	    return resultado;
	}
	

	public List<AlbumCancionesDTO> ordenarPorTitulo(List<AlbumCancionesDTO> resultado) {
        resultado.sort(Comparator.comparing(AlbumCancionesDTO::getTitulo, String.CASE_INSENSITIVE_ORDER));
        return resultado;
    }


	private List<AlbumCancionesDTO> ordenarPorArtista(List<AlbumCancionesDTO> resultado) {
		resultado.sort(Comparator.comparing(AlbumCancionesDTO::getArtista, String.CASE_INSENSITIVE_ORDER));
		return resultado;
	}

	private List<AlbumCancionesDTO> TransformarADto(Map<Album, List<Canciones>> cancionesPorAlbum) {

		List<AlbumCancionesDTO> resultado = new ArrayList<>();
	    for (Map.Entry<Album, List<Canciones>> entry : cancionesPorAlbum.entrySet()) {
	        Album albumEntity = entry.getKey();
	        List<CancionesDTO> cancionesDTO = entry.getValue().stream()
	            .map(this::convertirACancionesDTO)
	            .collect(Collectors.toList());

	        AlbumCancionesDTO dto = new AlbumCancionesDTO(
	        	albumEntity.getIdAlbum(),
	            albumEntity.getTitulo(),
	            albumEntity.getAnyo(),
	            albumEntity.getCover(),
	            albumEntity.getArtista().getNombre(),
	            albumEntity.getGenero().getNombreGenero(),
	            cancionesDTO);

	        resultado.add(dto);
	    }
	    
	    return resultado;
	}

	public CancionesDTO convertirACancionesDTO(Canciones cancion) {
	    CancionesDTO dto = new CancionesDTO();
	    dto.setId(cancion.getIdCancion());
	    dto.setTitulo(cancion.getTitulo());
	    dto.setDuracion(cancion.getDuracion());
	    dto.setAlbum(cancion.getAlbum().getTitulo());
	    dto.setArtista(cancion.getArtista().getNombre());
	    
	    return dto;
	}

	public void grabarCanciones(Canciones cancion) {
		cancionesRepository.save(cancion);
	}


}

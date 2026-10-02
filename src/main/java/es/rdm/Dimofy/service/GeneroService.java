package es.rdm.Dimofy.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import es.rdm.Dimofy.repository.GeneroRepository;
import es.rdm.Dimofy.repository.Generos;
import jakarta.persistence.EntityNotFoundException;

@Service
public class GeneroService {

	@Autowired
	private GeneroRepository generoRepository;
	
	public List<Generos> obtenerGeneros(){
		return generoRepository.findAll();
	}

	public int contarGeneros() {
		
		return (int) generoRepository.count();
	}

	public  Optional<Generos> findById(Long idGenero) {
	
		return generoRepository.findById(idGenero);
	}

	public Generos crearGenero(Generos genero) {
		
		return generoRepository.save(genero);
	}


	public Generos actualizarGenero(Long id, Generos generoActualizado) {
        Generos generoExistente = generoRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Género no encontrado"));

        generoExistente.setNombreGenero(generoActualizado.getNombreGenero());
        return generoRepository.save(generoExistente);
    }


	public void eliminarGenero(Long idGenero) {
        if (!generoRepository.existsById(idGenero)) {
            throw new EntityNotFoundException("Género no encontrado con ID: " + idGenero);
        }
        generoRepository.deleteById(idGenero);
    }

	public  Generos findByNombre(String idGenero) {
		
		return generoRepository.findGenerosByNombreGenero(idGenero);
	}

	public Generos buscarPorNombre(String nombreGenero) {
	    return generoRepository
	        .findByNombreGeneroIgnoreCase(nombreGenero)
	        .orElseThrow(() -> new EntityNotFoundException("Género no encontrado: " + nombreGenero));
	}

	
}

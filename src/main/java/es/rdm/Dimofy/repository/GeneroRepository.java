package es.rdm.Dimofy.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GeneroRepository extends JpaRepository<Generos, Long>{
	
	Generos findGenerosByNombreGenero(String nombreGenero);
	
	Optional<Generos> findByNombreGeneroIgnoreCase(String nombreGenero);

}

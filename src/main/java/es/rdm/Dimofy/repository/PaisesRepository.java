package es.rdm.Dimofy.repository;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PaisesRepository extends JpaRepository<Paises, Long>{
	
	Paises findPaisesByNombre(String nombre);

}

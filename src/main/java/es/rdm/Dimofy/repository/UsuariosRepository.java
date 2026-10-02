package es.rdm.Dimofy.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuariosRepository extends JpaRepository<Usuarios, Long>{

	
	Optional<Usuarios> findByEmail(String email);

	Usuarios findByUserNameAndPassW(String userName, String passW);

	Optional<Usuarios> findByUserName(String userName);


	
}

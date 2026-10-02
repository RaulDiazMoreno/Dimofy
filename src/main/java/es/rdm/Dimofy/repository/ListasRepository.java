package es.rdm.Dimofy.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ListasRepository  extends JpaRepository<Listas, Long>{

	List<Listas> findByUsuarioId(Long usuarioId);

	List<Listas> findByUserName(String userName);

}

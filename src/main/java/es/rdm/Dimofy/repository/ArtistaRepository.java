package es.rdm.Dimofy.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import es.rdm.Dimofy.dto.IdNombreDTO;

public interface ArtistaRepository extends JpaRepository<Artista, Long>,ArtistaRepositoryCustom {
	
	Artista findArtistaByNombre(String nombreArtista);
	
	List<Artista> findByNombreIn(List<String> nombres);

	@Query("SELECT a FROM Artista a WHERE LOWER(a.nombre) IN :nombres")
	List<Artista> findByNombreLowerIn(@Param("nombres") List<String> nombres);
	
	@Query("SELECT new es.rdm.Dimofy.dto.IdNombreDTO(a.id, a.nombre) FROM Artista a")
	List<IdNombreDTO> obtenerIdYNombre();
	@Query("SELECT a.paises.nombre, COUNT(a) FROM Artista a "
			+ "WHERE a.paises IS NOT NULL GROUP BY a.paises.nombre "
			+ "ORDER BY COUNT(a) DESC")
	List<Object[]> contarArtistasPorPais();

	@Query("SELECT a.generos.nombreGenero, COUNT(a) FROM Artista a "
			+ "WHERE a.generos IS NOT NULL GROUP BY a.generos.nombreGenero "
			+ "ORDER BY COUNT(a) DESC")
	List<Object[]> contarArtistasPorGenero();

	@Query("SELECT a.nombre, COUNT(al) FROM Album al JOIN al.artista a "
			+ "GROUP BY a.id, a.nombre ORDER BY COUNT(al) DESC, a.nombre ASC")
	List<Object[]> contarAlbumsPorArtista();

}

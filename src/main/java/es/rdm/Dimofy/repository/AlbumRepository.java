package es.rdm.Dimofy.repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import es.rdm.Dimofy.dto.AlbumDTO;

public interface AlbumRepository extends JpaRepository<Album, Long>, AlbumRepositoryCustom {

	@Query("SELECT new es.rdm.Dimofy.dto.AlbumDTO("
			+ "a.idAlbum,a.genero.nombreGenero, a.artista.nombre, a.cover, a.anyo, a.titulo) "
			+ "FROM Album a WHERE a.genero.nombreGenero IN :nombresGeneros")
	List<AlbumDTO> findAlbumsByNombreGeneros(@Param("nombresGeneros") List<String> nombresGeneros);

	@Query("SELECT new es.rdm.Dimofy.dto.AlbumDTO("
			+ "a.idAlbum, a.genero.nombreGenero, a.artista.nombre, a.cover, a.artista.foto, a.anyo, a.titulo) " + "FROM Album a "
			+ "WHERE LOWER(a.artista.nombre) IN :nombresArtistas")
	List<AlbumDTO> findAlbumsByNombreArtistas(@Param("nombresArtistas") List<String> artistas);

	@Query("SELECT new es.rdm.Dimofy.dto.AlbumDTO("
		    + "a.idAlbum, a.genero.nombreGenero, a.artista.nombre, a.cover, a.anyo, a.titulo) "
		    + "FROM Album a WHERE a.anyo = :anyoActual")
	List<AlbumDTO> findAlbumsByAnyo(@Param("anyoActual") String anyoActual);

	@Query("SELECT a FROM Album a WHERE LOWER(a.titulo) = LOWER(:titulo) AND a.artista.idArtista = :idArtista")
	Optional<Album> findByTituloAndArtistaId(@Param("titulo") String titulo, @Param("idArtista") Long idArtista);

	List<Album> findByArtista_IdArtistaOrderByAnyoDescTituloAsc(Long idArtista);
	
	List<Album> findByGenero_IdGenero(Long idGenero);

	Optional<Album> findByTitulo(String titulo);

	Page<Album> findByGenero_IdGenero(Long idGenero, Pageable pageable);

	@Query("SELECT new es.rdm.Dimofy.dto.AlbumDTO("
			+ "a.idAlbum, a.genero.nombreGenero, a.artista.nombre, a.cover, a.anyo, a.titulo) "
			+ "FROM Album a WHERE a.artista.idArtista = :idArtista")
	Page<AlbumDTO> findAlbumDTOsByArtistaId(@Param("idArtista") Long idArtista, Pageable pageable);

	@Query("SELECT new es.rdm.Dimofy.dto.AlbumDTO("
			+ "a.idAlbum, a.genero.nombreGenero, a.artista.nombre, a.cover, a.anyo, a.titulo) "
			+ "FROM Album a WHERE a.genero.idGenero = :idGenero")
	Page<AlbumDTO> findAlbumDTOsByGeneroId(@Param("idGenero") Long idGenero, Pageable pageable);

	@Query("SELECT DISTINCT UPPER(SUBSTRING(TRIM(a.artista.nombre), 1, 1)) "
			+ "FROM Album a "
			+ "WHERE a.genero.idGenero = :idGenero "
			+ "AND a.artista IS NOT NULL "
			+ "AND a.artista.nombre IS NOT NULL "
			+ "AND TRIM(a.artista.nombre) <> '' "
			+ "ORDER BY UPPER(SUBSTRING(TRIM(a.artista.nombre), 1, 1))")
	List<String> findInicialesArtistasByGeneroId(@Param("idGenero") Long idGenero);

	@Query("SELECT new es.rdm.Dimofy.dto.AlbumDTO("
			+ "a.idAlbum, a.genero.nombreGenero, a.artista.nombre, a.cover, a.anyo, a.titulo) "
			+ "FROM Album a "
			+ "WHERE a.genero.idGenero = :idGenero "
			+ "AND UPPER(SUBSTRING(TRIM(a.artista.nombre), 1, 1)) = UPPER(:inicial)")
	Page<AlbumDTO> findAlbumDTOsByGeneroIdAndInicialArtista(
			@Param("idGenero") Long idGenero,
			@Param("inicial") String inicial,
			Pageable pageable);

	@Query("SELECT a.anyo, COUNT(a) FROM Album a "
			+ "WHERE a.anyo IS NOT NULL AND TRIM(a.anyo) <> '' "
			+ "GROUP BY a.anyo ORDER BY a.anyo DESC")
	List<Object[]> contarAlbumsPorAnyo();

}





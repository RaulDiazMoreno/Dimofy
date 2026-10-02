package es.rdm.Dimofy.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.transaction.Transactional;

public interface CancionesRepository extends JpaRepository<Canciones, Long>,JpaSpecificationExecutor<Canciones>  {

    List<Canciones> findByArtistaNombreAndTitulo(String nombreArtista, String titulo);

    @Query("SELECT c FROM Canciones c WHERE LOWER(c.titulo) LIKE LOWER(CONCAT('%', :titulo, '%'))")
    List<Canciones> findByTituloLike(@Param("titulo") String titulo);

    List<Canciones> findByArtistaNombre(String nombreArtista);
    
    @Transactional
    @Modifying
    @Query("DELETE FROM Canciones c WHERE c.album.idAlbum = :idAlbum")
    void deleteByAlbumId(@Param("idAlbum") Long idAlbum);

	List<Canciones> findByAlbum_IdAlbum(Long id);

	@Query("SELECT c FROM Canciones c WHERE c.album.titulo = :tituloAlbum")
	List<Canciones> findCancionesByTituloAlbum(@Param("tituloAlbum") String tituloAlbum);

	List<Canciones> findByArtistaNombreAndTituloAndAlbumTitulo(String artista, String titulo, String album);


}


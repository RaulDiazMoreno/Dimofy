package es.rdm.Dimofy.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import es.rdm.Dimofy.dto.AlbumDTO;

public interface AlbumRepositoryCustom {
    List<AlbumDTO> buscarAlbums(String genero, String artista, String anyo, String titulo);

    Page<AlbumDTO> buscarAlbumsPaginados(
        String genero,
        String artista,
        String anyoInicio,
        String anyoFin,
        String titulo,
        Pageable pageable
    );
}

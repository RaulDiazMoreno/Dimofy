package es.rdm.Dimofy.repository;

import java.util.List;

public interface ArtistaRepositoryCustom {
	List<Artista> findArtistaByNombreExact(String nombreArtista);
	List<Artista> buscarPorFiltros(String nombre, Integer anyoInicio, String pais, String genero);
}

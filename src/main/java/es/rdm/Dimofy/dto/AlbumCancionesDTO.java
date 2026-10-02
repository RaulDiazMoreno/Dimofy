package es.rdm.Dimofy.dto;

import java.util.List;

public class AlbumCancionesDTO {

	    private Long idAlbum;
	    private String titulo;
		private String anyo;
	    private String cover;
	    private String artista;
	    private String genero;
	    private List<CancionesDTO> canciones;
	    
	    
	    public AlbumCancionesDTO(Long idAlbum, String titulo, String anyo, String cover, String artista, String genero,
				List<CancionesDTO> canciones) {
			super();
			this.idAlbum = idAlbum;
			this.titulo = titulo;
			this.anyo = anyo;
			this.cover = cover;
			this.artista = artista;
			this.genero = genero;
			this.canciones = canciones;

		}
	    
		public AlbumCancionesDTO() {
			
		}

		public Long getIdAlbum() {
			return idAlbum;
		}

		public void setIdAlbum(Long idAlbum) {
			this.idAlbum = idAlbum;
		}

		public String getTitulo() {
			return titulo;
		}

		public void setTitulo(String titulo) {
			this.titulo = titulo;
		}

		public String getAnyo() {
			return anyo;
		}

		public void setAnyo(String anyo) {
			this.anyo = anyo;
		}

		public String getCover() {
			return cover;
		}

		public void setCover(String cover) {
			this.cover = cover;
		}

		public String getArtista() {
			return artista;
		}

		public void setArtista(String artista) {
			this.artista = artista;
		}

		public String getGenero() {
			return genero;
		}

		public void setGenero(String genero) {
			this.genero = genero;
		}

		public List<CancionesDTO> getCanciones() {
			return canciones;
		}

		public void setCanciones(List<CancionesDTO> canciones) {
			this.canciones = canciones;
		}
		
}

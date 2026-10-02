package es.rdm.Dimofy.dto;

import es.rdm.Dimofy.repository.Canciones;

public class CancionesDTO {

	private long id;
    private String titulo;
    private String artista;
    private String duracion;
    private String album;

    public CancionesDTO() {
    }

   
    public CancionesDTO(long id, String titulo, String artista, String duracion, String album) {
		super();
		this.id = id;
		this.titulo = titulo;
		this.artista = artista;
		this.duracion = duracion;
		this.album = album;
	}

	public static CancionesDTO fromEntity(Canciones cancion) {
        return new CancionesDTO(
        	cancion.getIdCancion(),	
            cancion.getTitulo(),
            cancion.getArtista() != null ? cancion.getArtista().getNombre() : null,
            cancion.getDuracion(),
            cancion.getAlbum() != null ? cancion.getAlbum().getTitulo() : null
        );
    }



	public long getId() {
		return id;
	}



	public void setId(long id) {
		this.id = id;
	}



	public String getTitulo() {
		return titulo;
	}



	public void setTitulo(String titulo) {
		this.titulo = titulo;
	}



	public String getArtista() {
		return artista;
	}



	public void setArtista(String artista) {
		this.artista = artista;
	}



	public String getDuracion() {
		return duracion;
	}



	public void setDuracion(String duracion) {
		this.duracion = duracion;
	}



	public String getAlbum() {
		return album;
	}



	public void setAlbum(String album) {
		this.album = album;
	}
}

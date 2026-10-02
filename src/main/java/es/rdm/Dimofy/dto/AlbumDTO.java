package es.rdm.Dimofy.dto;

public class AlbumDTO {

	private long idAlbum;
    private String genero;
    private String artista;
    private String cover;
    private String fotoArtista;
    private String anyo;
    private String titulo;
    
    public AlbumDTO() {}
    
    public AlbumDTO(long idAlbum,String cover, String anyo, String titulo) {
		super();
		this.idAlbum = idAlbum;
		this.cover = cover;
		this.anyo = anyo;
		this.titulo = titulo;
	}

	public AlbumDTO(long idAlbum, String genero, String artista, String cover, String anyo, String titulo) {
		super();
		this.idAlbum = idAlbum;
		this.genero = genero;
		this.artista = artista;
		this.cover = cover;
		this.anyo = anyo;
		this.titulo = titulo;
	}

	public AlbumDTO(long idAlbum, String genero, String artista, String cover, String fotoArtista, String anyo, String titulo) {
		this(idAlbum, genero, artista, cover, anyo, titulo);
		this.fotoArtista = fotoArtista;
	}

	public long getIdAlbum() {
		return idAlbum;
	}

	public void setIdAlbum(long idAlbum) {
		this.idAlbum = idAlbum;
	}

	public String getGenero() {
		return genero;
	}

	public void setGenero(String genero) {
		this.genero = genero;
	}

	public String getArtista() {
		return artista;
	}

	public void setArtista(String artista) {
		this.artista = artista;
	}

	public String getCover() {
		return cover;
	}

	public void setCover(String cover) {
		this.cover = cover;
	}

	public String getFotoArtista() {
		return fotoArtista;
	}

	public void setFotoArtista(String fotoArtista) {
		this.fotoArtista = fotoArtista;
	}

	public String getAnyo() {
		return anyo;
	}

	public void setAnyo(String anyo) {
		this.anyo = anyo;
	}

	public String getTitulo() {
		return titulo;
	}

	public void setTitulo(String titulo) {
		this.titulo = titulo;
	}

    
}


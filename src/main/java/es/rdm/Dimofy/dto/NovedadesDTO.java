package es.rdm.Dimofy.dto;

import es.rdm.Dimofy.repository.Artista;
import es.rdm.Dimofy.repository.Generos;


public class NovedadesDTO {
	
	private Generos genero;
	private Artista artista;
	private String cover;
	private String anyo;
	private String titulo;
    
    public NovedadesDTO() {}
    
    public NovedadesDTO(Generos genero, Artista artista, String cover, String anyo,
			String titulo) {
		super();
		this.genero = genero;
		this.artista = artista;
		this.cover = cover;
		this.anyo = anyo;
		this.titulo = titulo;
	}

	public Generos getGenero() {
		return genero;
	}

	public void setGenero(Generos genero) {
		this.genero = genero;
	}

	public Artista getArtista() {
		return artista;
	}

	public void setArtista(Artista artista) {
		this.artista = artista;
	}

	public String getCover() {
		return cover;
	}

	public void setCover(String cover) {
		this.cover = cover;
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

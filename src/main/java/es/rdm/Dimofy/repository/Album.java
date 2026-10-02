package es.rdm.Dimofy.repository;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

@Entity
public class Album {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long idAlbum;
	
	@ManyToOne
	@JoinColumn(name = "id_genero")
	private Generos genero;
	
	@ManyToOne
	@JoinColumn(name = "id_artista")
	private Artista artista;
	
	private String cover;
	private String anyo;
	private String titulo;
	
	@OneToMany(mappedBy = "album", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Canciones> canciones;

	
	public Long getIdAlbum() {
		return idAlbum;
	}
	public void setIdAlbum(Long idAlbum) {
		this.idAlbum = idAlbum;
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
	public List<Canciones> getCanciones() {
		return canciones;
	}
	public void setCanciones(List<Canciones> canciones) {
		this.canciones = canciones;
	}
}

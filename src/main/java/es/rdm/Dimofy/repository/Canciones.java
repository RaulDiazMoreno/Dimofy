package es.rdm.Dimofy.repository;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;

@Entity
public class Canciones {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long idCancion;
	
	private String titulo;
	
	@ManyToOne
	@JoinColumn(name = "idAlbum")
	private Album album;
	
	@ManyToOne
	@JoinColumn(name = "idArtista")
	private Artista artista;
	
	private String duracion;
	private String anyo;
	
	@JsonBackReference
	@ManyToMany(mappedBy = "canciones")
	private List<Listas> listas;

	
	public Long getIdCancion() {
		return idCancion;
	}
	public void setIdCancion(Long idCancion) {
		this.idCancion = idCancion;
	}
	public String getTitulo() {
		return titulo;
	}
	public void setTitulo(String titulo) {
		this.titulo = titulo;
	}
	public Album getAlbum() {
		return album;
	}
	public void setAlbum(Album album) {
		this.album = album;
	}
	public Artista getArtista() {
		return artista;
	}
	public void setArtista(Artista artista) {
		this.artista = artista;
	}
	public String getDuracion() {
		return duracion;
	}
	public void setDuracion(String duracion) {
		this.duracion = duracion;
	}
	public String getAnyo() {
		return anyo;
	}
	public void setAnyo(String anyo) {
		this.anyo = anyo;
	}
	public List<Listas> getListas() {
		return listas;
	}
	public void setListas(List<Listas> listas) {
		this.listas = listas;
	}
}

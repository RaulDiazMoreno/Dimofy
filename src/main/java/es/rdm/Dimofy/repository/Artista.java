package es.rdm.Dimofy.repository;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Artista {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long idArtista;
	private String nombre;
	private String anyoInicio;

	@ManyToOne
	@JoinColumn(name = "idpais")
	private Paises paises;
	
	private String foto;
	
	@ManyToOne
	@JoinColumn(name = "idGenero")
	private Generos generos;
	
	@Column(name = "resumen_wikipedia", length = 2500) 
	private String resumenWikipedia;
	
	public Artista() {}

	public Artista(Long idArtista, String nombre, String anyoInicio, Paises paises, String foto, Generos generos,String resumenWikipedia) {
		super();
		this.idArtista = idArtista;
		this.nombre = nombre;
		this.anyoInicio = anyoInicio;
		this.paises = paises;
		this.foto = foto;
		this.generos = generos;
		this.resumenWikipedia = resumenWikipedia;
	}

	public Long getIdArtista() {
		return idArtista;
	}

	public void setIdArtista(Long idArtista) {
		this.idArtista = idArtista;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public String getAnyoInicio() {
		return anyoInicio;
	}

	public void setAnyoInicio(String anyoInicio) {
		this.anyoInicio = anyoInicio;
	}

	public Paises getPaises() {
		return paises;
	}

	public void setPaises(Paises paises) {
		this.paises = paises;
	}

	public String getFoto() {
		return foto;
	}

	public void setFoto(String foto) {
		this.foto = foto;
	}

	public Generos getGeneros() {
		return generos;
	}

	public void setGeneros(Generos generos) {
		this.generos = generos;
	}

	public String getResumenWikipedia() {
		return resumenWikipedia;
	}

	public void setResumenWikipedia(String resumenWikipedia) {
		this.resumenWikipedia = resumenWikipedia;
	}
	
}

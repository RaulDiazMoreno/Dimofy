package es.rdm.Dimofy.repository;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;

@Entity
public class Listas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idLista;

    private String nombre;
    private String numeroCanciones;
    private String caratula;
    private String userName;

    @ManyToOne
    @JsonBackReference
    private Usuarios usuario;

    @JsonManagedReference
    @ManyToMany
    @JoinTable(
        name = "lista_cancion",
        joinColumns = @JoinColumn(name = "lista_id"),
        inverseJoinColumns = @JoinColumn(name = "cancion_id")
    )
    private List<Canciones> canciones;

	public Long getIdLista() {
		return idLista;
	}

	public void setIdLista(Long idLista) {
		this.idLista = idLista;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public String getNumeroCanciones() {
		return numeroCanciones;
	}

	public void setNumeroCanciones(String numeroCanciones) {
		this.numeroCanciones = numeroCanciones;
	}

	public String getCaratula() {
		return caratula;
	}

	public void setCaratula(String caratula) {
		this.caratula = caratula;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public Usuarios getUsuario() {
		return usuario;
	}

	public void setUsuario(Usuarios usuario) {
		this.usuario = usuario;
	}

	public List<Canciones> getCanciones() {
		return canciones;
	}

	public void setCanciones(List<Canciones> canciones) {
		this.canciones = canciones;
	}
}

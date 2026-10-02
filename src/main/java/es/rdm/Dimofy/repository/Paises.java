package es.rdm.Dimofy.repository;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Paises {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long idpais;
	
	private String nombre;
	private String bandera;
	
	
	public Long getIdpais() {
		return idpais;
	}
	public void setIdpais(Long idpais) {
		this.idpais = idpais;
	}
	public String getNombre() {
		return nombre;
	}
	public void setNombre(String nombre) {
		this.nombre = nombre;
	}
	public String getBandera() {
		return bandera;
	}
	public void setBandera(String bandera) {
		this.bandera = bandera;
	}
	
}

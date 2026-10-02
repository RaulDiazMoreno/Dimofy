package es.rdm.Dimofy.repository;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "usuarios")
public class Usuarios {
	
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userName;
    private String nombre;
    private String apellidos;
    private String dni;
    private String email;
    private String telefono;
    private Date fechaNacimiento;
    private String pais;
    private String imagenBase64;
    private Date fechaAlta;
    private boolean admin;
    
    @JsonIgnore
    private String passW;
    @JsonIgnore
    private String tokenRecuperacion;
    @JsonIgnore
    private LocalDateTime tokenExpiracion;


    @ElementCollection
    private List<String> artistas;

    @ElementCollection
    private List<String> generos;
    
    @OneToMany(mappedBy = "usuario")
    @JsonManagedReference
    private List<Listas> listas;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUsername() {
		return userName;
	}

	public void setUsername(String userName) {
		this.userName = userName;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public String getApellidos() {
		return apellidos;
	}

	public void setApellidos(String apellidos) {
		this.apellidos = apellidos;
	}

	public String getDni() {
		return dni;
	}

	public void setDni(String dni) {
		this.dni = dni;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getTelefono() {
		return telefono;
	}

	public void setTelefono(String telefono) {
		this.telefono = telefono;
	}

	public Date getFechaNacimiento() {
		return fechaNacimiento;
	}

	public void setFechaNacimiento(Date fechaNacimiento) {
		this.fechaNacimiento = fechaNacimiento;
	}

	public String getPais() {
		return pais;
	}

	public void setPais(String pais) {
		this.pais = pais;
	}

	public String getImagenBase64() {
		return imagenBase64;
	}

	public void setImagenBase64(String imagenBase64) {
		this.imagenBase64 = imagenBase64;
	}

	public List<String> getArtistas() {
		return artistas;
	}

	public void setArtistas(List<String> artistas) {
		this.artistas = artistas;
	}

	public List<String> getGeneros() {
		return generos;
	}

	public void setGeneros(List<String> generos) {
		this.generos = generos;
	}

	public Date getFechaAlta() {
		return fechaAlta;
	}

	public void setFechaAlta(Date fechaAlta) {
		this.fechaAlta = fechaAlta;
	}

	public boolean isAdmin() {
		return admin;
	}

	public void setAdmin(boolean admin) {
		this.admin = admin;
	}

	public String getPassW() {
		return passW;
	}

	public void setPassW(String passW) {
		this.passW = passW;
	}

	public String getTokenRecuperacion() {
		return tokenRecuperacion;
	}

	public void setTokenRecuperacion(String tokenRecuperacion) {
		this.tokenRecuperacion = tokenRecuperacion;
	}

	public LocalDateTime getTokenExpiracion() {
		return tokenExpiracion;
	}

	public void setTokenExpiracion(LocalDateTime tokenExpiracion) {
		this.tokenExpiracion = tokenExpiracion;
	}
	
	public List<Listas> getListas() {
		return listas;
	}

	public void setListas(List<Listas> listas) {
		this.listas = listas;
	}
	
	
}


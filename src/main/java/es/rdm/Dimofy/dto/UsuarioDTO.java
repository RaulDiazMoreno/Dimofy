package es.rdm.Dimofy.dto;

import java.util.Date;

import es.rdm.Dimofy.repository.Usuarios;

public class UsuarioDTO {
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
	  
	  public UsuarioDTO() {}
	  
	  
	public UsuarioDTO(Long id, String username, String nombre, String apellidos, String dni, String email,
			String telefono, Date fechaNacimiento, String pais, String imagenBase64, Date fechaAlta, boolean admin) {
		super();
		this.id = id;
		this.userName = username;
		this.nombre = nombre;
		this.apellidos = apellidos;
		this.dni = dni;
		this.email = email;
		this.telefono = telefono;
		this.fechaNacimiento = fechaNacimiento;
		this.pais = pais;
		this.imagenBase64 = imagenBase64;
		this.fechaAlta = fechaAlta;
		this.admin = admin;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUsername() {
		return userName;
	}

	public void setUsername(String username) {
		this.userName = username;
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
	
	public UsuarioDTO(Usuarios u) {
	    this.id = u.getId();
	    this.userName = u.getUsername();
	    this.nombre = u.getNombre();
	    this.apellidos = u.getApellidos();
	    this.dni = u.getDni();
	    this.email = u.getEmail();
	    this.telefono = u.getTelefono();
	    this.fechaNacimiento = u.getFechaNacimiento();
	    this.pais = u.getPais();
	    this.imagenBase64 = u.getImagenBase64();
	    this.fechaAlta = u.getFechaAlta();
	    this.admin = u.isAdmin();
	}
}

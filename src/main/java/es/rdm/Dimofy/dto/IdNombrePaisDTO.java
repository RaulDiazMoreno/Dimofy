package es.rdm.Dimofy.dto;

import java.util.Objects;

public class IdNombrePaisDTO {

	private Long id;
    private String nombre;
    private String bandera;
    
    public IdNombrePaisDTO() {}

	public IdNombrePaisDTO(Long id, String nombre, String bandera) {
		super();
		this.id = id;
		this.nombre = nombre;
		this.bandera = bandera;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
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

	@Override
	public int hashCode() {
		return Objects.hash(bandera, id, nombre);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		IdNombrePaisDTO other = (IdNombrePaisDTO) obj;
		return Objects.equals(bandera, other.bandera) && Objects.equals(id, other.id)
				&& Objects.equals(nombre, other.nombre);
	}

	@Override
	public String toString() {
		return "IdNombrePaisDTO [id=" + id + ", nombre=" + nombre + ", bandera=" + bandera + "]";
	}

    
}

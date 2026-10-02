package es.rdm.Dimofy.dto;

public class IdGeneroDTO {
	
    private Long id;
    private String nombreGenero;
    
    public IdGeneroDTO(Long id, String nombreGenero) {
        this.id = id;
        this.nombreGenero = nombreGenero;
    }
    
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getNombreGenero() {
		return nombreGenero;
	}
	public void setNombreGenero(String nombreGenero) {
		this.nombreGenero = nombreGenero;
	}
    
    
    

}

package es.rdm.Dimofy.dto;

public class ArtistaDashboardDTO {
    private Long idArtista;
    private String nombre;
    private String foto;

    public ArtistaDashboardDTO() {
    }

    public ArtistaDashboardDTO(Long idArtista, String nombre, String foto) {
        this.idArtista = idArtista;
        this.nombre = nombre;
        this.foto = foto;
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

    public String getFoto() {
        return foto;
    }

    public void setFoto(String foto) {
        this.foto = foto;
    }
}

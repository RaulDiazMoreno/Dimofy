package es.rdm.Dimofy.dto;

/** DTO ligero para listados. Evita serializar relaciones JPA completas. */
public class ArtistaCardDTO {
    private Long idArtista;
    private String nombre;
    private String anyoInicio;
    private String foto;
    private String pais;
    private String genero;

    public ArtistaCardDTO(Long idArtista, String nombre, String anyoInicio, String foto, String pais, String genero) {
        this.idArtista = idArtista;
        this.nombre = nombre;
        this.anyoInicio = anyoInicio;
        this.foto = foto;
        this.pais = pais;
        this.genero = genero;
    }

    public Long getIdArtista() { return idArtista; }
    public String getNombre() { return nombre; }
    public String getAnyoInicio() { return anyoInicio; }
    public String getFoto() { return foto; }
    public String getPais() { return pais; }
    public String getGenero() { return genero; }
}

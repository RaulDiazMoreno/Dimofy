package es.rdm.Dimofy.repository;

import org.springframework.data.jpa.domain.Specification;

public class CancionSpecification {

    public static Specification<Canciones> conArtista(String artista) {
        return (root, query, cb) -> {
            query.orderBy(cb.asc(root.get("album").get("idAlbum")));
            return cb.equal(root.get("artista").get("nombre"), artista);
        };
    }

    public static Specification<Canciones> conTitulo(String titulo) {
        return (root, query, cb) -> {
            query.orderBy(cb.asc(root.get("album").get("idAlbum")));
            return cb.like(cb.lower(root.get("titulo")), "%" + titulo.toLowerCase() + "%");
        };
    }

    public static Specification<Canciones> conAlbum(String album) {
        return (root, query, cb) -> {
            query.orderBy(cb.asc(root.get("album").get("idAlbum")));
            return cb.equal(root.get("album").get("titulo"), album);
        };
    }

    public static Specification<Canciones> conAnyo(String anyo) {
        return (root, query, cb) -> {
            query.orderBy(cb.asc(root.get("album").get("idAlbum")));
            return cb.equal(root.get("anyo"), anyo);
        };
    }

    public static Specification<Canciones> conGenero(Long idGenero) {
        return (root, query, cb) -> {
        	query.orderBy(cb.asc(root.get("artista").get("nombre")));
            return cb.equal(root.get("album").get("genero").get("idGenero"), idGenero);
        };
    }

}


package es.rdm.Dimofy.repository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import es.rdm.Dimofy.dto.AlbumDTO;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

@Repository
public class AlbumRepositoryImpl implements AlbumRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<AlbumDTO> buscarAlbums(String genero, String artista, String anyo, String titulo) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<AlbumDTO> cq = cb.createQuery(AlbumDTO.class);
        Root<Album> album = cq.from(Album.class);
        Join<Object, Object> artistaJoin = album.join("artista");
        Join<Object, Object> generoJoin = album.join("genero");

        List<Predicate> predicates = buildPredicates(
            cb, album, artistaJoin, generoJoin,
            genero, artista, anyo, anyo, titulo
        );

        cq.select(cb.construct(
                AlbumDTO.class,
                album.get("idAlbum"),
                generoJoin.get("nombreGenero"),
                artistaJoin.get("nombre"),
                album.get("cover"),
                album.get("anyo"),
                album.get("titulo")
        ))
        .where(cb.and(predicates.toArray(new Predicate[0])))
        .orderBy(cb.asc(album.get("titulo")));

        return entityManager.createQuery(cq).getResultList();
    }

    @Override
    public Page<AlbumDTO> buscarAlbumsPaginados(
            String genero,
            String artista,
            String anyoInicio,
            String anyoFin,
            String titulo,
            Pageable pageable) {

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        CriteriaQuery<AlbumDTO> dataQuery = cb.createQuery(AlbumDTO.class);
        Root<Album> album = dataQuery.from(Album.class);
        Join<Object, Object> artistaJoin = album.join("artista");
        Join<Object, Object> generoJoin = album.join("genero");

        List<Predicate> predicates = buildPredicates(
            cb, album, artistaJoin, generoJoin,
            genero, artista, anyoInicio, anyoFin, titulo
        );

        dataQuery.select(cb.construct(
                AlbumDTO.class,
                album.get("idAlbum"),
                generoJoin.get("nombreGenero"),
                artistaJoin.get("nombre"),
                album.get("cover"),
                album.get("anyo"),
                album.get("titulo")
        ))
        .where(cb.and(predicates.toArray(new Predicate[0])))
        .orderBy(cb.asc(album.get("titulo")));

        TypedQuery<AlbumDTO> typedQuery = entityManager.createQuery(dataQuery);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());
        List<AlbumDTO> content = typedQuery.getResultList();

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Album> countAlbum = countQuery.from(Album.class);
        Join<Object, Object> countArtistaJoin = countAlbum.join("artista");
        Join<Object, Object> countGeneroJoin = countAlbum.join("genero");

        List<Predicate> countPredicates = buildPredicates(
            cb, countAlbum, countArtistaJoin, countGeneroJoin,
            genero, artista, anyoInicio, anyoFin, titulo
        );

        countQuery.select(cb.count(countAlbum))
            .where(cb.and(countPredicates.toArray(new Predicate[0])));

        long total = entityManager.createQuery(countQuery).getSingleResult();

        return new PageImpl<>(content, pageable, total);
    }

    private List<Predicate> buildPredicates(
            CriteriaBuilder cb,
            Root<Album> album,
            Join<Object, Object> artistaJoin,
            Join<Object, Object> generoJoin,
            String genero,
            String artista,
            String anyoInicio,
            String anyoFin,
            String titulo) {

        List<Predicate> predicates = new ArrayList<>();

        if (genero != null && !genero.isBlank()) {
            predicates.add(cb.equal(generoJoin.get("nombreGenero"), genero));
        }
        if (artista != null && !artista.isBlank()) {
            predicates.add(
                cb.like(
                    cb.lower(artistaJoin.get("nombre")),
                    "%" + artista.trim().toLowerCase() + "%"
                )
            );
        }
        if (anyoInicio != null && !anyoInicio.isBlank()) {
            predicates.add(cb.greaterThanOrEqualTo(album.get("anyo"), anyoInicio));
        }
        if (anyoFin != null && !anyoFin.isBlank()) {
            predicates.add(cb.lessThanOrEqualTo(album.get("anyo"), anyoFin));
        }
        if (titulo != null && !titulo.isBlank()) {
            predicates.add(
                cb.like(
                    cb.lower(album.get("titulo")),
                    "%" + titulo.trim().toLowerCase() + "%"
                )
            );
        }

        return predicates;
    }
}

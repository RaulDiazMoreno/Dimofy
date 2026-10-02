package es.rdm.Dimofy.repository;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

public class ArtistaRepositoryCustomImpl implements ArtistaRepositoryCustom {

	@PersistenceContext
	private EntityManager entityManager;

	@Override
	public List<Artista> findArtistaByNombreExact(String nombreArtista) {
		List<Artista> lista  = new ArrayList<Artista>();
		Query query = entityManager.createNativeQuery("SELECT * FROM artista WHERE nombre = :nombre", Artista.class);
		query.setParameter("nombre", nombreArtista);
		return query.getResultList();
	}
	
	@Override
	public List<Artista> buscarPorFiltros(String nombre, Integer anyoInicio, String pais, String genero) {
	    CriteriaBuilder cb = entityManager.getCriteriaBuilder();
	    CriteriaQuery<Artista> query = cb.createQuery(Artista.class);
	    Root<Artista> artista = query.from(Artista.class);

	    List<Predicate> predicates = new ArrayList<>();

	    if (nombre != null && !nombre.isEmpty()) {
	        predicates.add(cb.like(cb.lower(artista.get("nombre")), "%" + nombre.toLowerCase() + "%"));
	    }

	    if (anyoInicio != null) {
	        predicates.add(cb.equal(artista.get("anyoInicio"), anyoInicio));
	    }

	    if (pais != null && !pais.isEmpty()) {
	        predicates.add(cb.equal(cb.lower(artista.get("paises").get("nombre")), pais.toLowerCase()));
	    }

	    if (genero != null && !genero.isEmpty()) {
	        predicates.add(cb.equal(cb.lower(artista.get("generos").get("nombreGenero")), genero.toLowerCase()));
	    }

	    query.select(artista).where(cb.and(predicates.toArray(new Predicate[0]))).distinct(true);

	    return entityManager.createQuery(query).getResultList();
	}


}

package es.rdm.Dimofy.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import es.rdm.Dimofy.repository.Paises;
import es.rdm.Dimofy.repository.PaisesRepository;

@Service
public class PaisService {
		
	@Autowired
	private PaisesRepository paisesRepository;

	public Optional<Paises> findById(Long idPais) {
		
		return paisesRepository.findById(idPais);
	}

}

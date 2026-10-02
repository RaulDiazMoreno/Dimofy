package es.rdm.Dimofy.service;




import es.rdm.Dimofy.config.AssetPathUtils;
import java.io.File;
import org.springframework.beans.factory.annotation.Value;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import es.rdm.Dimofy.dto.IdNombreDTO;
import es.rdm.Dimofy.repository.Artista;
import es.rdm.Dimofy.repository.ArtistaRepository;
import es.rdm.Dimofy.repository.GeneroRepository;
import es.rdm.Dimofy.repository.Generos;
import es.rdm.Dimofy.repository.Paises;
import es.rdm.Dimofy.repository.PaisesRepository;

@Service
public class ArtistaService {
    @Value("${app.artistas.path}")
    private String artistasPath;

	
	 @Autowired
	 private ArtistaRepository artistaRepository;
	 
	 @Autowired
	 private GeneroRepository generoRepository;
	 
	 @Autowired
	 private PaisesRepository paisesRepository;
	 
	 public List<Artista> obtenerArtistas() {
	     return artistaRepository.findAll();
	 }

	public int contarArtistas() {
		return (int) artistaRepository.count();
	}

	public Optional<Artista> findById(Long idArtista) {
		return artistaRepository.findById(idArtista);
	}

	public Artista buscarPorNombre(String artista) {
		return artistaRepository.findArtistaByNombre(artista);
	}

	public List<Artista> buscarPorNombres(List<String> nombres) {
		List<String> normalizados = nombres.stream()
			.filter(n -> n != null && !n.isBlank())
			.map(n -> n.trim().toLowerCase())
			.toList();
		return artistaRepository.findByNombreLowerIn(normalizados);
	}

	public List<Artista> buscarArtistas(String artista, Integer anyo, String pais, String genero) {
		
			return artistaRepository.buscarPorFiltros(artista, anyo, pais,genero);
	}

	public void grabar(Artista artista) {

		artistaRepository.save(artista);
		
	}

	public void editarArtista(Long idArtista, String nombre, String anyoInicio, String resumenWikipedia,
               Long idPais, Long idGenero, MultipartFile foto) throws IOException {

			Optional<Artista> optionalArtista = artistaRepository.findById(idArtista);
			if (optionalArtista.isPresent()) {
				Artista artista = optionalArtista.get();
				artista.setNombre(nombre);
				artista.setAnyoInicio(anyoInicio);
				artista.setResumenWikipedia(resumenWikipedia);
				Optional<Paises> paisesOptional = paisesRepository.findById(idPais);
				if(!paisesOptional.isPresent()) {
					 throw new RuntimeException("Pais no encontrado");
				}
				artista.setPaises(paisesOptional.get());
				Optional<Generos> generoOptional = generoRepository.findById(idGenero);
		         if (!generoOptional.isPresent()) {
		        	 throw new RuntimeException("Genero no encontrado");
		         }
				artista.setGeneros(generoOptional.get());
				
				if (foto != null && !foto.isEmpty()) {
		             String nombreArchivo = foto.getOriginalFilename();
		             String ruta = AssetPathUtils.asegurarDirectorio(artistasPath, "artistas").getAbsolutePath() + File.separator + nombreArchivo;
		             foto.transferTo(new java.io.File(ruta));
		             artista.setFoto("/assets/Artistas/" + nombreArchivo); 
		         }
				try {
					artistaRepository.save(artista);
				}catch(Exception e) {
					e.printStackTrace();
				}
			} else {
				throw new RuntimeException("Artista no encontrado");
			}
   }
	   

   public boolean eliminarArtistaPorId(Long id) {
        if (artistaRepository.existsById(id)) {
            artistaRepository.deleteById(id);
            return true;
        }
        return false;
    }

	public List<IdNombreDTO> obtenerIdYNombre() {
		
		return artistaRepository.obtenerIdYNombre();
	}

}


 


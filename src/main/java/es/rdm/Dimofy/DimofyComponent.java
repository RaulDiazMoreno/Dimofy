package es.rdm.Dimofy;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.exc.StreamWriteException;
import com.fasterxml.jackson.databind.DatabindException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import es.rdm.Dimofy.dto.IdGeneroDTO;
import es.rdm.Dimofy.dto.IdNombreDTO;
import es.rdm.Dimofy.dto.IdNombrePaisDTO;
import es.rdm.Dimofy.dto.NovedadesDTO;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Component
public class DimofyComponent implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DimofyComponent.class);


    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public void run(String... args) throws Exception {
        exportEntidad("Artista");
        exportEntidadG("Generos");
        exportEntidadP("Paises");
        exportEntidadA("Album");
//      renombrarArchivos();
    }

    private void renombrarArchivos() {
		
    	
    	     File carpeta = new File("C:\\Users\\Rauld\\Downloads\\React\\dimofy\\public\\assets\\Cover");

    	     if (carpeta.isDirectory()) {
    	            for (File archivo : carpeta.listFiles()) {
    	                String nombreOriginal = archivo.getName();

    	                String nuevoNombre = nombreOriginal.replace(" ", "");

    	                if (!nombreOriginal.equals(nuevoNombre)) {
    	                    File nuevoArchivo = new File(carpeta, nuevoNombre);
    	                    boolean exito = archivo.renameTo(nuevoArchivo);

    	                    if (exito) {
    	                        log.info(String.valueOf("Renombrado: " + nombreOriginal + " → " + nuevoNombre));
    	                    } else {
    	                        log.info(String.valueOf("Error al renombrar: " + nombreOriginal));
    	                    }
    	                }
    	            }
    	        } else {
    	            log.info(String.valueOf("La ruta no es una carpeta válida."));
    	        }	
	}

	private void exportEntidadA(String entidad)  throws StreamWriteException, DatabindException, IOException {

    	int anioActual = LocalDate.now().getYear();
    	
    	String jpql = "SELECT new es.rdm.Dimofy.dto.NovedadesDTO(e.genero,e.artista,e.cover,e.anyo,e.titulo) FROM " + entidad + " e WHERE e.anyo = '"+String.valueOf(anioActual) +"'";
        List<NovedadesDTO> resultados = entityManager.createQuery(jpql, NovedadesDTO.class).getResultList();
        for (NovedadesDTO novedadesDTO : resultados) {
        	String cover = novedadesDTO.getCover();
        	String carat = cover.substring(cover.lastIndexOf("/") + 1);
        	novedadesDTO.setCover("/assets/Cover/" + carat.replace(" ", ""));
		}
        ObjectMapper mapper = new ObjectMapper();
        mapper.enable(SerializationFeature.INDENT_OUTPUT);
        File file = new File("C:/Users/Rauld/Downloads/React/dimofy/src/" + "novedades".toLowerCase() + ".json");
        file.getParentFile().mkdirs();
        mapper.writeValue(file, resultados);
		
	}

	private void exportEntidadP(String entidad) throws StreamWriteException, DatabindException, IOException {
    	String jpql = "SELECT new es.rdm.Dimofy.dto.IdNombrePaisDTO(e.idpais, e.nombre,e.bandera) FROM " + entidad + " e";
        List<IdNombrePaisDTO> resultados = entityManager.createQuery(jpql, IdNombrePaisDTO.class).getResultList();
        for (IdNombrePaisDTO idNombrePaisDTO : resultados) {
        	String flag = idNombrePaisDTO.getBandera();
        	String pais = flag.substring(flag.lastIndexOf("\\") + 1);
        	idNombrePaisDTO.setBandera("/assets/Paises/" + pais);
		}
        ObjectMapper mapper = new ObjectMapper();
        mapper.enable(SerializationFeature.INDENT_OUTPUT);
        File file = new File("C:/Users/Rauld/Downloads/React/dimofy/src/" + entidad.toLowerCase() + ".json");
        file.getParentFile().mkdirs();
        mapper.writeValue(file, resultados);
		
	}

	private void exportEntidadG(String entidad) throws StreamWriteException, DatabindException, IOException {
    	 String jpql = "SELECT new es.rdm.Dimofy.dto.IdGeneroDTO(e.idGenero, e.nombreGenero) FROM " + entidad + " e";
         List<IdGeneroDTO> resultados = entityManager.createQuery(jpql, IdGeneroDTO.class).getResultList();

         ObjectMapper mapper = new ObjectMapper();
         mapper.enable(SerializationFeature.INDENT_OUTPUT);
         File file = new File("C:/Users/Rauld/Downloads/React/dimofy/src/" + entidad.toLowerCase() + ".json");
         file.getParentFile().mkdirs();
         mapper.writeValue(file, resultados);
		
	}

	private void exportEntidad(String entidad) throws IOException {
        String jpql = "SELECT new es.rdm.Dimofy.dto.IdNombreDTO(e.id, e.nombre) FROM " + entidad + " e";
        List<IdNombreDTO> resultados = entityManager.createQuery(jpql, IdNombreDTO.class).getResultList();

        ObjectMapper mapper = new ObjectMapper();
        mapper.enable(SerializationFeature.INDENT_OUTPUT);
        File file = new File("C:/Users/Rauld/Downloads/React/dimofy/src/" + entidad.toLowerCase() + ".json");
        file.getParentFile().mkdirs();
        mapper.writeValue(file, resultados);
    }
}

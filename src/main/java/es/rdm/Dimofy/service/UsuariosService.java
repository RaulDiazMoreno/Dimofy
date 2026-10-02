package es.rdm.Dimofy.service;

import java.io.IOException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import es.rdm.Dimofy.repository.Artista;
import es.rdm.Dimofy.repository.Usuarios;
import es.rdm.Dimofy.repository.UsuariosRepository;

@Service
public class UsuariosService {
	
	@Autowired
	private UsuariosRepository usuariosRepository;
	

	public Usuarios grabarUsuario(Usuarios usuario) {
		return usuariosRepository.save(usuario);
	}


    public Usuarios obtenerPorUserName(String userName) {
    	return usuariosRepository.findByUserName(userName)
    		    .orElseGet(() -> {
    		        return null;
         });
	}

	public List<String> obtenerGenerosPorUserName(String userName) {
	        return usuariosRepository.findByUserName(userName)
	                .map(Usuarios::getGeneros)
	                .orElse(Collections.emptyList());
	}

	public List<String> obtenerArtistasPorUserName(String userName) {
	        return usuariosRepository.findByUserName(userName)
	                .map(Usuarios::getArtistas)
	                .orElse(Collections.emptyList());
	}


	public Object encontrarById(Long userId) {

		Usuarios usuario = usuariosRepository.findById(userId)
				.orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
		
		return usuario;

	}

	public List<Usuarios> getAllUsuarios() {
		List<Usuarios> usuarios = new ArrayList<Usuarios>();
		try {
			usuarios = usuariosRepository.findAll();
		}catch(Exception e) {
			e.printStackTrace();
		}
		return usuarios;
	}


	public int contarUsuarios() {
		
		return (int) usuariosRepository.count();
	}


	public Optional<Usuarios> obtenerPorId(Long id) {
		
		return usuariosRepository.findById(id);
	}


	public void editarUsuario(Long id, String nombre, String apellidos, String dni, String email,
			String telefono, LocalDate fechaNacimiento, String pais, String imagen) throws IOException {
		
		Optional<Usuarios> usuarioOpt = obtenerPorId(id);

        Usuarios usuario = usuarioOpt.get();
        usuario.setNombre(nombre);
        usuario.setApellidos(apellidos);
        usuario.setDni(dni);
        usuario.setEmail(email);
        usuario.setTelefono(telefono);

        LocalDate localDate = fechaNacimiento;
        usuario.setFechaNacimiento(java.sql.Date.valueOf(fechaNacimiento));
        usuario.setImagenBase64(imagen); 
        
        
        usuariosRepository.save(usuario);
	}


	public boolean borrarUsuarioPorId(Long id) {
		
		if (usuariosRepository.existsById(id)) {
            usuariosRepository.deleteById(id);
            return true;
        }
        return false;
	}
	
	

}

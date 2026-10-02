package es.rdm.Dimofy.service;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import es.rdm.Dimofy.repository.Usuarios;
import es.rdm.Dimofy.repository.UsuariosRepository;
import es.rdm.Dimofy.security.CustomUserDetails;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private static final Logger log = LoggerFactory.getLogger(CustomUserDetailsService.class);


    @Autowired
    private UsuariosRepository usuariosRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        
        Usuarios usuario = usuariosRepository.findByUserName(username)
        		.orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        log.info(String.valueOf("Contraseña en BD: " + usuario.getPassW()));


        return new CustomUserDetails(usuario);
    }
}


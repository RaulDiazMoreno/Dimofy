package es.rdm.Dimofy.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import es.rdm.Dimofy.repository.Usuarios;
import es.rdm.Dimofy.repository.UsuariosRepository;

@Service
public class RecuperacionService {

    @Value("${frontend.url}")
    private String frontendUrl;

    @Autowired
    private UsuariosRepository usuarioRepository;

    @Autowired
    private JavaMailSender mailSender;

    public void enviarEnlaceRecuperacion(String email) {
        Usuarios usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String token = UUID.randomUUID().toString();
        usuario.setTokenRecuperacion(token);
        usuario.setTokenExpiracion(LocalDateTime.now().plusHours(1));
        usuarioRepository.save(usuario);

        String enlace = frontendUrl + "/resetear?token=" + token;

        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(email);
        mensaje.setSubject("Recuperación de contraseña");
        mensaje.setText("Haz clic en el siguiente enlace para restablecer tu contraseña:\n" + enlace);

        mailSender.send(mensaje);
    }
    
    public void restablecerContrasena(String token, String nuevaContrasena) {
        Usuarios usuario = usuarioRepository.findAll().stream()
            .filter(u -> token.equals(u.getTokenRecuperacion()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Token inválido"));

        if (usuario.getTokenExpiracion().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("El token ha expirado");
        }

        // Encriptar la nueva contraseña
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String contrasenaEncriptada = encoder.encode(nuevaContrasena);

        // Guardar nueva contraseña y limpiar token
        usuario.setTokenRecuperacion(null);
        usuario.setTokenExpiracion(null);
        // Aquí deberías tener un campo `contrasena` en Usuario
        usuario.setPassW(contrasenaEncriptada);

        usuarioRepository.save(usuario);
    }

}


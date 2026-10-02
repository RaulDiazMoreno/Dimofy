package es.rdm.Dimofy.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import es.rdm.Dimofy.dto.ResetPasswordRequest;
import es.rdm.Dimofy.service.RecuperacionService;

@RestController
@RequestMapping("/app")
public class RecuperacionController {

    @Autowired
    private RecuperacionService recuperacionService;

    @PostMapping("/recuperarPassword")
    public ResponseEntity<String> recuperar(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        recuperacionService.enviarEnlaceRecuperacion(email);
        return ResponseEntity.ok("Correo enviado");
    }
    
    @PostMapping("/resetear")
    public ResponseEntity<String> resetearContrasena(@RequestBody ResetPasswordRequest request) {
        recuperacionService.restablecerContrasena(request.getToken(), request.getNuevaContrasena());
        return ResponseEntity.ok("Contraseña actualizada correctamente");
    }
    
    @GetMapping("/resetear")
    public String mostrarFormularioReset(@RequestBody ResetPasswordRequest request) {
        // lógica para validar el token
        return "resetear"; // nombre de la vista (resetear.html o resetear.jsp)
    }

}


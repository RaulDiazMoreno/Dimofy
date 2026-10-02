package es.rdm.Dimofy.controller;



import es.rdm.Dimofy.config.AssetPathUtils;
import org.springframework.beans.factory.annotation.Value;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import es.rdm.Dimofy.dto.UsuarioDTO;
import es.rdm.Dimofy.repository.Usuarios;
import es.rdm.Dimofy.security.PasswordUtil;
import es.rdm.Dimofy.service.UsuariosService;



@RestController
@RequestMapping("/app")
public class UsuariosController {
    @Value("${app.usuarios.path}")
    private String usuariosPath;


	
	private static Logger log = LogManager.getLogger(UsuariosController.class);
	
    @Autowired
    private UsuariosService usuarioService;
    
    @PostMapping("/usuarios")
    public ResponseEntity<?> registrarUsuario(@RequestBody Usuarios usuario) {

        // Verificar si el usuario ya existe por nombre de usuario
        Usuarios existente = usuarioService.obtenerPorUserName(usuario.getUsername());
        if(existente!=null) {
        	 if (existente.getUsername()!=null && !existente.getUsername().isEmpty()) {
 	            return ResponseEntity.status(HttpStatus.CONFLICT)
 	                    .body("El usuario con nombre de usuario '" + usuario.getUsername() + "' ya existe.");
 	        }
        }
        // Formateo de fecha de nacimiento
        SimpleDateFormat formatoEntrada = new SimpleDateFormat("EEE MMM dd HH:mm:ss z yyyy", java.util.Locale.ENGLISH);
        SimpleDateFormat formatoSalida = new SimpleDateFormat("dd-MM-yyyy");

        try {
            if (usuario.getFechaNacimiento() != null) {
                Date fecha = formatoEntrada.parse(usuario.getFechaNacimiento().toString());
                Instant instant = fecha.toInstant();
                ZoneId zona = ZoneId.systemDefault();
                LocalDate localDate = instant.atZone(zona).toLocalDate();
                LocalDate localDateAjustada = localDate.plusDays(1);
                Date fechaConvertida = Date.from(localDateAjustada.atStartOfDay(zona).toInstant());
                usuario.setFechaNacimiento(fechaConvertida);
            } else {
                Date fecha = formatoEntrada.parse("01-01-0001");
                usuario.setFechaNacimiento(fecha);
            }
        } catch (ParseException e) {
            log.info("Error al formatear fecha -->" + usuario.getFechaNacimiento());
        }

        // Guardar imagen
        try {
        	String outputPath = AssetPathUtils.asegurarDirectorio(usuariosPath, "usuarios").getAbsolutePath() + File.separator + usuario.getUsername() + ".jpg";
            saveBase64Image(usuario.getImagenBase64(), outputPath);
            String guardarBbdd = "/assets/Usuarios/" + usuario.getUsername() + ".jpg";
            usuario.setImagenBase64(guardarBbdd);
        } catch (Exception e) {
            log.info("Error al decodificar imagen64");
        }

        // Fecha de alta
        LocalDateTime ahora = LocalDateTime.now();
        DateTimeFormatter formato = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");
        String fechaFormateada = ahora.format(formato);
        LocalDateTime fechaParseada = LocalDateTime.parse(fechaFormateada, formato);
        Date fecha = Date.from(fechaParseada.atZone(ZoneId.systemDefault()).toInstant());
        usuario.setFechaAlta(fecha);
        usuario.setAdmin(false);
        String hashedPassword = PasswordUtil.hashPassword(usuario.getPassW());
        usuario.setPassW(hashedPassword);
        Usuarios guardado = usuarioService.grabarUsuario(usuario);
        return ResponseEntity.ok(guardado);
    }

    
    public String saveBase64Image(String base64Image, String outputPath) throws Exception {
            // Eliminar encabezado si existe (por ejemplo: "data:image/png;base64,")
            if (base64Image.contains(",")) {
                base64Image = base64Image.split(",")[1];
            }

            byte[] imageBytes = Base64.getDecoder().decode(base64Image);
            File file = new File(outputPath);
            file.getParentFile().mkdirs(); // Crear directorios si no existen

            try (OutputStream stream = new FileOutputStream(file)) {
                stream.write(imageBytes);
            }

            return file.toURI().toString(); // Devuelve la URL local del archivo
      }
    

    @GetMapping("/usuarios/admin")
    public ResponseEntity<List<UsuarioDTO>> getUsuarios() {
        List<UsuarioDTO> dtos = usuarioService.getAllUsuarios().stream()
            .map(UsuarioDTO::new)
            .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    

    @GetMapping("/usuarios/admin/consultar/{id}")
    public ResponseEntity<?> consultarUsuario(@PathVariable Long id) {
      try {
        Optional<Usuarios> usuarioOpt = usuarioService.obtenerPorId(id);
        if (usuarioOpt.isEmpty()) {
          return ResponseEntity.notFound().build();
        }

        Usuarios u = usuarioOpt.get();

        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(u.getId());
        dto.setUsername(u.getUsername());      
        dto.setNombre(u.getNombre());
        dto.setApellidos(u.getApellidos());
        dto.setDni(u.getDni());
        dto.setEmail(u.getEmail());
        dto.setTelefono(u.getTelefono());
        dto.setFechaNacimiento(u.getFechaNacimiento());
        dto.setPais(u.getPais());
        dto.setImagenBase64(u.getImagenBase64());
        dto.setFechaAlta(u.getFechaAlta());
        dto.setAdmin(u.isAdmin());

        return ResponseEntity.ok(dto);

      } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(500).body("Error al consultar el usuario.");
      }
    }

    @PostMapping("/usuarios/admin/editar/{id}")
    public ResponseEntity<?> editarUsuario(
        @PathVariable("id") Long id,
        @RequestParam("username") String username,
        @RequestParam("nombre") String nombre,
        @RequestParam("apellidos") String apellidos,
        @RequestParam("dni") String dni,
        @RequestParam("email") String email,
        @RequestParam("telefono") String telefono,
        @RequestParam("pais") String pais,
        @RequestParam("fechaNacimiento")
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaNacimiento,
        @RequestParam(value = "imagen", required = false) String imagen
    ) {
        try {
        	String rutaImagenBbdd = null;

            if (imagen != null && !imagen.isBlank() && imagen.startsWith("data:image")) {
                String outputPath =
                    "C:/Users/Rauld/Downloads/React/dimofy/public/assets/Usuarios/"
                    + username + ".jpg";

                saveBase64Image(imagen, outputPath);

                rutaImagenBbdd = "/assets/Usuarios/" + username + ".jpg";
            } else if (imagen != null && !imagen.isBlank()) {
                rutaImagenBbdd = imagen;
            }

            usuarioService.editarUsuario(
                id,
                nombre,
                apellidos,
                dni,
                email,
                telefono,
                fechaNacimiento,
                pais,
                rutaImagenBbdd
            );

            return ResponseEntity.ok("Usuario modificado correctamente");

        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al actualizar el usuario");
        }
    }

    @DeleteMapping("/usuarios/admin/borrar/{id}")
    public ResponseEntity<Void> borrarUsuario(@PathVariable Long id) {
        boolean eliminado = usuarioService.borrarUsuarioPorId(id);

        if (eliminado) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/usuarios/consultar/{id}")
    public ResponseEntity<?> consultarUsuarioNormal(@PathVariable Long id) {
        return consultarUsuario(id);
    }
    
    @PostMapping("/usuarios/editar/{id}")
    public ResponseEntity<?> editarUsuarioNormal(
        @PathVariable("id") Long id,
        @RequestParam("username") String username,
        @RequestParam("nombre") String nombre,
        @RequestParam("apellidos") String apellidos,
        @RequestParam("dni") String dni,
        @RequestParam("email") String email,
        @RequestParam("telefono") String telefono,
        @RequestParam("pais") String pais,
        @RequestParam("fechaNacimiento")
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaNacimiento,
        @RequestParam(value = "imagen", required = false) String imagen
    ) {
        try {
            String rutaImagenBbdd = null;

            if (imagen != null && !imagen.isBlank() && imagen.startsWith("data:image")) {
                String outputPath =
                    "C:/Users/Rauld/Downloads/React/dimofy/public/assets/Usuarios/"
                    + username + ".jpg";

                saveBase64Image(imagen, outputPath);

                rutaImagenBbdd = "/assets/Usuarios/" + username + ".jpg";
            } else if (imagen != null && !imagen.isBlank()) {
                rutaImagenBbdd = imagen;
            }

            usuarioService.editarUsuario(
                id,
                nombre,
                apellidos,
                dni,
                email,
                telefono,
                fechaNacimiento,
                pais,
                rutaImagenBbdd
            );

            return ResponseEntity.ok("Usuario modificado correctamente");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al actualizar el usuario");
        }
    }
}
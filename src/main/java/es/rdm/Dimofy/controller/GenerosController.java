package es.rdm.Dimofy.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.rdm.Dimofy.repository.Generos;
import es.rdm.Dimofy.service.GeneroService;
import jakarta.persistence.EntityNotFoundException;

@RestController
@RequestMapping("/app/generos")
public class GenerosController {

    @Autowired
    private GeneroService generoService;
    
    @GetMapping("/nombre/{genero}")
    public ResponseEntity<Generos> obtenerPorNombre(@PathVariable("genero") String nombreGenero) {
        return ResponseEntity.ok(generoService.buscarPorNombre(nombreGenero));
    }


    @GetMapping
    public List<Generos> obtenerProductos() {
        return generoService.obtenerGeneros();
    }
    
    @GetMapping("/total")
    public ResponseEntity<List<Generos>> obtenerTodosLosGeneros() {
        List<Generos> generos = generoService.obtenerGeneros();
        return ResponseEntity.ok(generos);
    }
    

    @PostMapping("/crear")
    public ResponseEntity<Generos> crearGenero(@RequestBody Generos genero) {
        try {
            genero.setIdGenero(null); 
            Generos nuevoGenero = generoService.crearGenero(genero);
            return ResponseEntity.ok(nuevoGenero);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }


    @PutMapping("/editar/{id}")
    public ResponseEntity<Generos> editarGenero(@PathVariable Long id, @RequestBody Generos generoActualizado) {
        try {
            Generos genero = generoService.actualizarGenero(id, generoActualizado);
            return ResponseEntity.ok(genero);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    

	@DeleteMapping("/eliminar/{idGenero}")
	public ResponseEntity<?> eliminarGenero(@PathVariable Long idGenero) {
	        try {
	            generoService.eliminarGenero(idGenero);
	            return ResponseEntity.ok().build();
	        } catch (EntityNotFoundException e) {
	            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Género no encontrado");
	        } catch (Exception e) {
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al borrar el género");
	        }
	    }




}


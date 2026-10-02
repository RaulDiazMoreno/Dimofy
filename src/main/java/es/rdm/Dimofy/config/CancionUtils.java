package es.rdm.Dimofy.config;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.List;
import java.util.Map;

import com.mpatric.mp3agic.Mp3File;

import es.rdm.Dimofy.dto.AlbumCancionesDTO;
import es.rdm.Dimofy.dto.CancionesDTO;

public class CancionUtils {
    private static final Logger log = LoggerFactory.getLogger(CancionUtils.class);



    public static Map<String, String> obtenerDuracionesDesdeCarpeta(String tituloAlbum) {
    	
        Map<String, String> duraciones = new HashMap<>();
        String basePath = "C:/Users/Rauld/Music/Discos/";
        File baseDir = new File(basePath);
        File[] carpetas = baseDir.listFiles(File::isDirectory);

        if (carpetas != null) {
            for (File carpeta : carpetas) {
                if (carpeta.getName().toLowerCase().contains(tituloAlbum.toLowerCase())) {
                    File[] archivos = carpeta.listFiles((dir, name) -> name.toLowerCase().endsWith(".mp3"));
                    if (archivos != null) {
                        for (File archivo : archivos) {
                            try {
                                Mp3File mp3 = new Mp3File(archivo);
                                int duracionSegundos = (int) mp3.getLengthInSeconds();
                                String duracionFormato = String.format("%02d:%02d", duracionSegundos / 60, duracionSegundos % 60);
                                String tituloCancion=mp3.getId3v2Tag().getTitle();
                                duraciones.put(tituloCancion, duracionFormato);
                            } catch (Exception e) {
                                log.info(String.valueOf("Error leyendo duración de " + archivo.getName() + ": " + e.getMessage()));
                            }
                        }
                    }
                    break;
                }
            }
        }
        return duraciones;
    }
    
    public static Map<String, AlbumCancionesDTO> obtenerInformacionAlbum(boolean esRecopilatorio, String coversPath) {
        Map<String, AlbumCancionesDTO> albumCancionesMap = new LinkedHashMap<>();

        String basePath = esRecopilatorio
                ? "C:\\Users\\Rauld\\Music\\Recopilatorios"
                : "C:\\Users\\Rauld\\Music\\Discos";

        File baseDir = new File(basePath);
        File[] carpetas = baseDir.listFiles(File::isDirectory);

        // La carpeta de destino ya no se codifica en esta clase.
        // Se recibe desde application.properties a través de AlbumService.
        File carpetaCovers = new File(coversPath);
        if (!carpetaCovers.exists() && !carpetaCovers.mkdirs()) {
            throw new IllegalStateException(
                    "No se pudo crear la carpeta de covers: " + carpetaCovers.getAbsolutePath());
        }
        if (!carpetaCovers.isDirectory()) {
            throw new IllegalStateException(
                    "La ruta de covers no es un directorio: " + carpetaCovers.getAbsolutePath());
        }

        if (carpetas != null) {
            for (File carpeta : carpetas) {
                File[] archivos = carpeta.listFiles((dir, name) -> name.toLowerCase().endsWith(".mp3"));
                if (archivos != null && archivos.length > 0) {
                    boolean primero = true;
                    AlbumCancionesDTO albumCancionesDto = new AlbumCancionesDTO();
                    List<CancionesDTO> canciones = new ArrayList<>();

                    for (File archivo : archivos) {
                        try {
                            Mp3File mp3 = new Mp3File(archivo);
                            if (mp3.hasId3v2Tag()) {
                                if (primero) {
                                    primero = false;

                                    String artista = esRecopilatorio
                                            ? "Varios Artistas"
                                            : mp3.getId3v2Tag().getArtist();
                                    String album = mp3.getId3v2Tag().getAlbum();

                                    albumCancionesDto.setArtista(artista);
                                    albumCancionesDto.setGenero(esRecopilatorio
                                            ? "Recopilatorio"
                                            : mp3.getId3v2Tag().getGenreDescription());
                                    albumCancionesDto.setTitulo(album);
                                    albumCancionesDto.setAnyo(mp3.getId3v2Tag().getYear());

                                    String nombreBase = limpiarNombreArchivo(artista + " - " + album);
                                    String nombreArchivo = nombreBase + ".jpg";
                                    File imagenDestino = new File(carpetaCovers, nombreArchivo);

                                    byte[] imagenBytes = mp3.getId3v2Tag().getAlbumImage();
                                    if (imagenBytes != null && imagenBytes.length > 0) {
                                        try (FileOutputStream fos = new FileOutputStream(imagenDestino)) {
                                            fos.write(imagenBytes);
                                        }
                                        // En el DTO/BBDD se guarda una URL pública, nunca la ruta C:\\... física.
                                        albumCancionesDto.setCover("/assets/Cover/" + nombreArchivo);
                                    } else {
                                        albumCancionesDto.setCover(null);
                                    }
                                }

                                CancionesDTO cancion = new CancionesDTO();
                                cancion.setAlbum(mp3.getId3v2Tag().getAlbum());
                                cancion.setArtista(mp3.getId3v2Tag().getArtist());
                                cancion.setTitulo(mp3.getId3v2Tag().getTitle());
                                int duracionSegundos = (int) mp3.getLengthInSeconds();
                                String duracionFormato = String.format("%02d:%02d",
                                        duracionSegundos / 60, duracionSegundos % 60);
                                cancion.setDuracion(duracionFormato);
                                canciones.add(cancion);
                            }
                        } catch (Exception e) {
                            LogErrorUtils.error(log, "Leyendo MP3: " + archivo.getAbsolutePath(), e);
                        }
                    }

                    albumCancionesDto.setCanciones(canciones);
                    if (albumCancionesDto.getTitulo() != null && albumCancionesDto.getArtista() != null) {
                        // IMPORTANTE: el titulo del album NO es unico. Dos artistas pueden tener
                        // albums con el mismo titulo (p. ej. "Bryan Ferry - Essentials" y
                        // "Bryan Adams - Essentials"). Si usamos solo el titulo como clave,
                        // el segundo album sobrescribe al primero en el Map.
                        String claveAlbum = crearClaveAlbum(
                                albumCancionesDto.getArtista(),
                                albumCancionesDto.getTitulo());
                        albumCancionesMap.put(claveAlbum, albumCancionesDto);
                    }
                }
            }
        }

        return albumCancionesMap;
    }


    private static String crearClaveAlbum(String artista, String titulo) {
        String artistaNormalizado = artista == null ? "" : artista.trim().toLowerCase(Locale.ROOT);
        String tituloNormalizado = titulo == null ? "" : titulo.trim().toLowerCase(Locale.ROOT);
        return artistaNormalizado + "||" + tituloNormalizado;
    }

    private static String limpiarNombreArchivo(String nombre) {
        if (nombre == null || nombre.isBlank()) {
            return "sin_nombre";
        }
        // Caracteres no permitidos por Windows en nombres de fichero.
        return nombre.replaceAll("[\\\\/:*?\"<>|]", "-").trim();
    }

}

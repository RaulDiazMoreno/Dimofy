package es.rdm.Dimofy.config;

import java.io.File;
import java.io.IOException;

public final class AssetPathUtils {
    private AssetPathUtils() {}

    public static File asegurarDirectorio(String path, String descripcion) throws IOException {
        File dir = new File(path);
        if (!dir.exists() && !dir.mkdirs()) {
            throw new IOException("No se pudo crear la carpeta de " + descripcion + ": " + dir.getAbsolutePath());
        }
        if (!dir.isDirectory()) {
            throw new IOException("La ruta de " + descripcion + " no es un directorio: " + dir.getAbsolutePath());
        }
        return dir;
    }
}

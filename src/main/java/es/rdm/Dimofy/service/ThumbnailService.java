package es.rdm.Dimofy.service;

import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Iterator;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ThumbnailService {

    @Value("${app.covers.path}") private String coversPath;
    @Value("${app.artistas.path}") private String artistasPath;
    @Value("${app.thumbnails.max-dimension:300}") private int maxDimension;
    @Value("${app.thumbnails.target-kb:25}") private int targetKb;
    @Value("${app.thumbnails.min-quality:0.42}") private float minQuality;

    public Report generarTodos() throws IOException {
        Report r = new Report();
        procesarDirectorio(Path.of(coversPath), r);
        procesarDirectorio(Path.of(artistasPath), r);
        return r;
    }

    private void procesarDirectorio(Path sourceDir, Report r) throws IOException {
        if (!Files.isDirectory(sourceDir)) return;
        Path thumbs = sourceDir.resolve("thumbs");
        Files.createDirectories(thumbs);
        try (var stream = Files.list(sourceDir)) {
            stream.filter(Files::isRegularFile)
                  .filter(this::esImagen)
                  .forEach(src -> {
                      try {
                          Path dst = thumbs.resolve(nombreWebp(src.getFileName().toString()));
                          if (Files.exists(dst) && Files.getLastModifiedTime(dst).toMillis() >= Files.getLastModifiedTime(src).toMillis()) {
                              r.omitidas++;
                              return;
                          }
                          generar(src, dst);
                          r.generadas++;
                          r.bytesOriginales += Files.size(src);
                          r.bytesThumbs += Files.size(dst);
                          if (Files.size(dst) > targetKb * 1024L) r.sobreObjetivo++;
                      } catch (Exception ex) {
                          r.errores++;
                          System.err.println("No se pudo crear thumbnail de " + src + ": " + ex.getMessage());
                      }
                  });
        }
    }

    private void generar(Path src, Path dst) throws IOException {
        BufferedImage original = ImageIO.read(src.toFile());
        if (original == null) throw new IOException("Formato de imagen no legible");
        BufferedImage resized = redimensionar(original, maxDimension);
        float quality = 0.78f;
        do {
            escribirWebp(resized, dst.toFile(), quality);
            if (Files.size(dst) <= targetKb * 1024L || quality <= minQuality) break;
            quality = Math.max(minQuality, quality - 0.06f);
        } while (true);
    }

    private BufferedImage redimensionar(BufferedImage src, int max) {
        double scale = Math.min(1d, Math.min((double) max / src.getWidth(), (double) max / src.getHeight()));
        int w = Math.max(1, (int)Math.round(src.getWidth() * scale));
        int h = Math.max(1, (int)Math.round(src.getHeight() * scale));
        BufferedImage out = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = out.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.drawImage(src, 0, 0, w, h, null);
        g.dispose();
        return out;
    }

    private void escribirWebp(BufferedImage image, File dst, float quality) throws IOException {
        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("webp");
        if (!writers.hasNext()) throw new IOException("No hay escritor WebP ImageIO. Añade una librería WebP ImageIO al proyecto.");
        ImageWriter writer = writers.next();
        try (ImageOutputStream ios = ImageIO.createImageOutputStream(dst)) {
            writer.setOutput(ios);
            ImageWriteParam p = writer.getDefaultWriteParam();
            if (p.canWriteCompressed()) {
                p.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                p.setCompressionQuality(quality);
            }
            writer.write(null, new IIOImage(image, null, null), p);
        } finally { writer.dispose(); }
    }

    private boolean esImagen(Path p) {
        String n = p.getFileName().toString().toLowerCase();
        return n.endsWith(".jpg") || n.endsWith(".jpeg") || n.endsWith(".png") || n.endsWith(".webp");
    }
    private String nombreWebp(String n) { return n.replaceFirst("(?i)\\.(jpg|jpeg|png|webp)$", ".webp"); }

    public static class Report {
        public long generadas, omitidas, errores, sobreObjetivo, bytesOriginales, bytesThumbs;
        @Override public String toString() {
            double ahorro = bytesOriginales == 0 ? 0 : (1d - ((double)bytesThumbs / bytesOriginales)) * 100d;
            return String.format("Thumbnails generadas=%d, omitidas=%d, errores=%d, >objetivo=%d, original=%.2f MB, thumbs=%.2f MB, ahorro=%.1f%%",
                generadas, omitidas, errores, sobreObjetivo, bytesOriginales/1048576d, bytesThumbs/1048576d, ahorro);
        }
    }
}

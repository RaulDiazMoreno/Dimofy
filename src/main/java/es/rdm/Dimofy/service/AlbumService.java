package es.rdm.Dimofy.service;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.exc.StreamReadException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DatabindException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.Image;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.pdf.draw.LineSeparator;

import es.rdm.Dimofy.config.CancionUtils;
import es.rdm.Dimofy.dto.AlbumCancionesDTO;
import es.rdm.Dimofy.dto.AlbumDTO;
import es.rdm.Dimofy.dto.CancionesDTO;
import es.rdm.Dimofy.repository.Album;
import es.rdm.Dimofy.repository.AlbumRepository;
import es.rdm.Dimofy.repository.Artista;
import es.rdm.Dimofy.repository.ArtistaRepository;
import es.rdm.Dimofy.repository.Canciones;
import es.rdm.Dimofy.repository.CancionesRepository;
import es.rdm.Dimofy.repository.GeneroRepository;
import es.rdm.Dimofy.repository.Generos;
import es.rdm.Dimofy.repository.Paises;
import es.rdm.Dimofy.repository.PaisesRepository;
import jakarta.transaction.Transactional;


	

@Service
public class AlbumService {
    @Value("${app.artistas.path}")
    private String artistasPath;


	private static Logger log = LogManager.getLogger(AlbumService.class);
	
	private final AlbumRepository albumRepository;
    private final CancionesRepository cancionesRepository;
    private final ArtistaRepository artistaRepository;
    private final GeneroRepository generoRepository;
    private final PaisesRepository paisesRepository;
    private final long idDefecto = 1;

    @Value("${app.assets.path}")
	private String assetsPath;
    
    @Value("${app.covers.path}")
    private String coversPath;
    

    public AlbumService(AlbumRepository albumRepository,CancionesRepository cancionesRepository,ArtistaRepository artistaRepository,
    					GeneroRepository generoRepository,PaisesRepository paisesRepository) {
        this.albumRepository = albumRepository;
        this.cancionesRepository=cancionesRepository;
        this.artistaRepository=artistaRepository;
        this.generoRepository=generoRepository;
        this.paisesRepository=paisesRepository;
    }

    public List<AlbumDTO> findAlbumsByNombreGeneros(List<String> generos) {
        return albumRepository.findAlbumsByNombreGeneros(generos);
    }

	public List<AlbumDTO> findAlbumsByNombreArtista(List<String> artistas) {
		return albumRepository.findAlbumsByNombreArtistas(artistas);
	}
	

	public List<AlbumDTO> buscarAlbumsPorArtistas(List<String> nombresArtistas) {
        // Normalizar los nombres a minúsculas
        List<String> nombresNormalizados = nombresArtistas.stream()
            .map(String::toLowerCase)
            .collect(Collectors.toList());

        // Llamar al repositorio con los nombres normalizados
        return albumRepository.findAlbumsByNombreArtistas(nombresNormalizados);
    }


	public List<AlbumDTO> findAlbumsByAnyo(String anyo) {
		return albumRepository.findAlbumsByAnyo(anyo);
	}

	public List<AlbumDTO> buscarAlbums(String genero, String artista, String anyo, String titulo) {
		
		return albumRepository.buscarAlbums(genero, artista, anyo, titulo);
	}

	public Page<AlbumDTO> buscarAlbumsPaginados(String genero, String artista, String anyoInicio, String anyoFin, String titulo, Pageable pageable) {
		return albumRepository.buscarAlbumsPaginados(genero, artista, anyoInicio, anyoFin, titulo, pageable);
	}

	public int contarAlbums() {
		
		return (int) albumRepository.count();
	}

	public List<AlbumDTO> todosAlbums() {

	    List<Album> albums = albumRepository.findAll();

	    return albums.stream().map(album -> {

	        AlbumDTO dto = new AlbumDTO();

	        dto.setIdAlbum(album.getIdAlbum());
	        dto.setTitulo(album.getTitulo());
	        dto.setAnyo(album.getAnyo());
	        dto.setCover(album.getCover());

	        dto.setArtista(
	            album.getArtista() != null
	                ? album.getArtista().getNombre()
	                : "Sin artista"
	        );

	        dto.setGenero(
	            album.getGenero() != null
	                ? album.getGenero().getNombreGenero()
	                : "Sin género"
	        );

	        return dto;

	    }).collect(Collectors.toList());
	}


	public Album grabarAlbum(Album album) {
		
		return albumRepository.save(album);
	}


	public Optional<Album> buscarPorTituloYArtista(String titulo, Long idArtista) {

		return albumRepository.findByTituloAndArtistaId(titulo, idArtista);
	}

	public boolean eliminarAlbumPorId(Long id) {
		
		if (albumRepository.existsById(id)) {
			albumRepository.deleteById(id);
			return true;
		}
		return false;
	}

	public Optional<Album> findById(Long id) {
		
		return albumRepository.findById(id);
	}
	
	@Transactional
    public void eliminarAlbumYSusCanciones(Long idAlbum) {
        cancionesRepository.deleteByAlbumId(idAlbum);
        albumRepository.deleteById(idAlbum);
    }

	public ResponseEntity<List<AlbumCancionesDTO>> generarJsonCarga(boolean esRecopilatorio) throws IOException {
	    List<AlbumCancionesDTO> resultado = new ArrayList<>();
	    Map<String, AlbumCancionesDTO> albums = CancionUtils.obtenerInformacionAlbum(esRecopilatorio, coversPath);
	    List<String> artistasCreados = new ArrayList<>();

	    for (Iterator<Map.Entry<String, AlbumCancionesDTO>> it = albums.entrySet().iterator(); it.hasNext();) {
	        Map.Entry<String, AlbumCancionesDTO> entry = it.next();
	        AlbumCancionesDTO album = entry.getValue();

	        // Verificar si el álbum ya existe
	        List<AlbumDTO> albumLista = albumRepository.buscarAlbums(null, album.getArtista(), null, album.getTitulo());
	        if (albumLista != null && !albumLista.isEmpty()) {
	            artistasCreados.add("Álbum existente no se va a dar de alta: " + album.getArtista() + " - " + album.getTitulo());
	            it.remove(); 
	            continue;
	        }

	        // Verificar si el artista ya existe
	        String artista = album.getArtista();
	        boolean artistaExistente = existeArtista(artista);
	        if (!artistaExistente) {
	            artistasCreados.add("Artista No existente, por favor es necesario darlo de alta: " + artista);
	        }

	        // Crear artista si no existe
	        Artista artist = new Artista();
	        artist.setNombre(artista);
	        Optional<Generos> optionalGenero = generoRepository.findById(idDefecto);
	        optionalGenero.ifPresent(artist::setGeneros);
	        Optional<Paises> optionalPais = paisesRepository.findById(idDefecto);
	        optionalPais.ifPresent(artist::setPaises);
	        artist.setAnyoInicio("2025");
	        artist.setResumenWikipedia("ERROR");
	        artist.setFoto("C:/Users/Rauld/Downloads/React/dimofy/public/assets/Artistas/");
	        // artistaRepository.save(artist);
//	        artistasCreados.add("Artista creado: " + artista);
	    }

	    // Generar JSON
	    ObjectMapper mapper = new ObjectMapper();
	    File outputFile = new File("C:/Users/Rauld/Music/carga.json");
	    mapper.writerWithDefaultPrettyPrinter().writeValue(outputFile, albums);

	    // Generar PDF
	    if (!artistasCreados.isEmpty()) {
	        generarPdfAdvertencias(albums, artistasCreados);
	    } else {
	        generarPdfCarga(albums);
	    }

	    return ResponseEntity.ok(new ArrayList<>(albums.values()));
	}

	private void agregarCabeceraDimofy(Document document) throws DocumentException, IOException {
	    PdfPTable cabecera = new PdfPTable(1);
	    cabecera.setTotalWidth(72f);
	    cabecera.setLockedWidth(true);
	    cabecera.setHorizontalAlignment(Element.ALIGN_LEFT);
	    cabecera.setSpacingAfter(12f);

	    java.io.InputStream logoStream = getClass().getResourceAsStream("/dimofy-logo.png");
	    if (logoStream != null) {
	        byte[] logoBytes = logoStream.readAllBytes();
	        Image logo = Image.getInstance(logoBytes);
	        logo.scaleToFit(42f, 42f);
	        PdfPCell logoCell = new PdfPCell(logo, false);
	        logoCell.setBorder(PdfPCell.NO_BORDER);
	        logoCell.setHorizontalAlignment(Element.ALIGN_CENTER);
	        logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
	        logoCell.setPadding(0f);
	        logoCell.setPaddingBottom(2f);
	        cabecera.addCell(logoCell);
	    } else {
	        PdfPCell logoCell = new PdfPCell();
	        logoCell.setBorder(PdfPCell.NO_BORDER);
	        logoCell.setFixedHeight(42f);
	        cabecera.addCell(logoCell);
	    }

	    Font marcaFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD, new BaseColor(0, 119, 204));
	    PdfPCell marcaCell = new PdfPCell(new Phrase("DimoFy", marcaFont));
	    marcaCell.setBorder(PdfPCell.NO_BORDER);
	    marcaCell.setHorizontalAlignment(Element.ALIGN_CENTER);
	    marcaCell.setVerticalAlignment(Element.ALIGN_TOP);
	    marcaCell.setPadding(0f);
	    cabecera.addCell(marcaCell);

	    document.add(cabecera);
	}

	private void generarPdfCarga(Map<String, AlbumCancionesDTO> albums) throws IOException {
	    File carpetaAssets = new File(assetsPath);
	    if (!carpetaAssets.exists() && !carpetaAssets.mkdirs()) {
	        throw new IOException("No se pudo crear la carpeta de assets: " + carpetaAssets.getAbsolutePath());
	    }
	    if (!carpetaAssets.isDirectory()) {
	        throw new IOException("La ruta de assets no es un directorio: " + carpetaAssets.getAbsolutePath());
	    }
	    File fichero = new File(carpetaAssets, "CargaAlbums.pdf");
	    String rutaFichero = fichero.getAbsolutePath();

	    if (fichero.exists() && !fichero.delete()) {
	        throw new IOException("No se pudo eliminar el fichero existente: " + rutaFichero);
	    }

	    Document document = new Document();
	    try {
	        PdfWriter.getInstance(document, new FileOutputStream(fichero));
	        document.open();
	        agregarCabeceraDimofy(document);

	        // Estilos
	        Font tituloFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
	        Font subtituloFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD);
	        Font textoNormal = new Font(Font.FontFamily.HELVETICA, 12, Font.NORMAL);

	        // Título principal
	        Paragraph titulo = new Paragraph("Fichero de Carga de Álbumes", tituloFont);
	        titulo.setAlignment(Element.ALIGN_CENTER);
	        titulo.setSpacingAfter(20);
	        document.add(titulo);

	        // Subtítulo
	        document.add(new Paragraph("Álbumes a cargar:", subtituloFont));
	        document.add(new Paragraph(" ", textoNormal)); // Espacio

	        // Lista de claves de álbumes
	        for (String claveAlbum : albums.keySet()) {
	            document.add(new Paragraph("• " + claveAlbum, textoNormal));
	        }

	        document.add(new Paragraph(" ", textoNormal)); // Espacio
	        document.add(new LineSeparator());
	        document.add(new Paragraph(" ", textoNormal)); // Espacio

	        // Tabla con detalles de álbumes
	        document.add(new Paragraph("Detalles de los álbumes:", subtituloFont));
	        PdfPTable tabla = new PdfPTable(5); 
	        tabla.setWidthPercentage(100);
	        tabla.setSpacingBefore(10f);
	        tabla.setSpacingAfter(10f);

	        // Encabezados
	        PdfPCell celdaNumero = new PdfPCell(new Phrase("Número", subtituloFont));
	        PdfPCell celdaTitulo = new PdfPCell(new Phrase("Título", subtituloFont));
	        PdfPCell celdaArtista = new PdfPCell(new Phrase("Artista", subtituloFont));
	        PdfPCell celdaAnyo = new PdfPCell(new Phrase("Año", subtituloFont));
	        PdfPCell celdaGenero = new PdfPCell(new Phrase("Genero", subtituloFont));
	        celdaNumero.setHorizontalAlignment(Element.ALIGN_CENTER);
	        celdaTitulo.setHorizontalAlignment(Element.ALIGN_CENTER);
	        celdaArtista.setHorizontalAlignment(Element.ALIGN_CENTER);
	        celdaAnyo.setHorizontalAlignment(Element.ALIGN_CENTER);
	        celdaGenero.setHorizontalAlignment(Element.ALIGN_CENTER);
	        tabla.addCell(celdaNumero);
	        tabla.addCell(celdaTitulo);
	        tabla.addCell(celdaArtista);
	        tabla.addCell(celdaAnyo);
	        tabla.addCell(celdaGenero);

	        // Datos
	        int i = 1;
	        for (AlbumCancionesDTO album : albums.values()) {
	        	tabla.addCell(new Phrase(String.valueOf(i), textoNormal));
	            tabla.addCell(new Phrase(album.getTitulo(), textoNormal));
	            tabla.addCell(new Phrase(album.getArtista(), textoNormal));
	            tabla.addCell(new Phrase(album.getAnyo(), textoNormal));
	            tabla.addCell(new Phrase(album.getGenero(), textoNormal));
	            i++;
	            
	        }

	        document.add(tabla);

	    } catch (DocumentException | FileNotFoundException e) {
	        throw new IOException("Error al generar el PDF de advertencias", e);
	    } finally {
	        document.close();
	    }
	}

	public String cargarDesdeJson() throws StreamReadException, DatabindException, IOException {
	    String ruta = "C:/Users/Rauld/Music/carga.json"; 
	    ObjectMapper mapper = new ObjectMapper();
	    File file = new File(ruta);
	    Map<String, AlbumCancionesDTO> mapa = mapper.readValue(file, new TypeReference<Map<String, AlbumCancionesDTO>>() {});
	    List<AlbumCancionesDTO> lista = new ArrayList<>(mapa.values());
	    boolean errores = false;

	    if (lista != null && !lista.isEmpty()) {
	        for (AlbumCancionesDTO albumCancionesDTO : lista) {
	            Artista artista = artistaRepository.findArtistaByNombre(albumCancionesDTO.getArtista().trim());
	            if (artista == null) {
	                errores = true;
	                log.warn("Artista no encontrado: " + albumCancionesDTO.getArtista());
	                continue;
	            }else {
	            	Optional<Album> optionalAlbum = albumRepository.findByTituloAndArtistaId(albumCancionesDTO.getTitulo(), artista.getIdArtista());
	            	if (optionalAlbum.isPresent()) {
	            		errores = true;
	            		 log.warn("Album ya existente: " + albumCancionesDTO.getTitulo());
	            	}else {
	            		Album album = new Album();
				        album.setArtista(artista);
				        album.setAnyo(albumCancionesDTO.getAnyo());
				        album.setCover(albumCancionesDTO.getCover());
				        album.setTitulo(albumCancionesDTO.getTitulo());
				        album.setGenero(artista.getGeneros());
				        albumRepository.save(album);
				        for (CancionesDTO cancionDTO : albumCancionesDTO.getCanciones()) {
				            Canciones cancion = new Canciones();
				            cancion.setTitulo(cancionDTO.getTitulo());
				            cancion.setDuracion(cancionDTO.getDuracion());
				            cancion.setArtista(artista);
				            cancion.setAnyo(album.getAnyo());
				            cancion.setAlbum(album);
				            cancionesRepository.save(cancion);
				         }
	            	}   
		       }
	        }
	    }

	    if (errores) {
	        return "Carga completada con errores. Revisa el log para más detalles.";
	    } else {
	        return "Carga completada correctamente.";
	    }
	}
	
	public boolean existeArtista(String artista) {
		
		boolean existe=false;
		Artista artist = new Artista();
		try {
		artist = artistaRepository.findArtistaByNombre(artista);
		}catch(Exception e) {
			log.error("-----------------------------");	
			log.error("Error al consultar: "+artista);	
			log.error("-----------------------------");
		}
		if(artist!=null) {
			existe=true;
		}
		return existe;
	}

	public void borradoMasivoAlbumsYCanciones() {
		
		for (Canciones c : cancionesRepository.findAll()) {
		    c.getListas().clear();
		    cancionesRepository.save(c);
		}

		cancionesRepository.deleteAll();
		albumRepository.deleteAll();
	}
	

	public void generarPdfAdvertencias(Map<String, AlbumCancionesDTO> albums, List<String> artistasCreados) throws IOException {
	    File carpetaAssets = new File(assetsPath);
	    if (!carpetaAssets.exists() && !carpetaAssets.mkdirs()) {
	        throw new IOException("No se pudo crear la carpeta de assets: " + carpetaAssets.getAbsolutePath());
	    }
	    if (!carpetaAssets.isDirectory()) {
	        throw new IOException("La ruta de assets no es un directorio: " + carpetaAssets.getAbsolutePath());
	    }
	    File fichero = new File(carpetaAssets, "CargaAlbums.pdf");
	    String rutaFichero = fichero.getAbsolutePath();

	    if (fichero.exists()) {
	        if (!fichero.delete()) {
	            throw new IOException("No se pudo eliminar el fichero existente: " + rutaFichero);
	        }
	    }

	    Document document = new Document();
	    try {
	        PdfWriter.getInstance(document, new FileOutputStream(fichero));
	        document.open();
	        agregarCabeceraDimofy(document);
	        document.add(new Paragraph("Advertencias al generar fichero de carga"));
	        document.add(new Paragraph("--------------------------------------------------"));
	        for (String artista : artistasCreados) {
	            document.add(new Paragraph("- " + artista));
	        }
	        document.add(new Paragraph("\nÁlbumes procesados:\n"));
	        if(albums!=null) {
	        	for (AlbumCancionesDTO album : albums.values()) {
		            document.add(new Paragraph("Álbum: " + album.getTitulo() + " | Artista: " + album.getArtista()));
		        }
	        }else {
	        	document.add(new Paragraph("\nNo se va a cargar ningún album\n"));
	        }
	        
	    } catch (DocumentException | FileNotFoundException e) {
	        throw new IOException("Error al generar el PDF de advertencias", e);
	    } finally {
	        document.close();
	    }
	}

	public Album getAlbumConCanciones(Long id) {
		// TODO Auto-generated method stub
		return null;
	}

	public List<Album> findByArtistaId(Long idArtista) {
	    return albumRepository.findByArtista_IdArtistaOrderByAnyoDescTituloAsc(idArtista);
	}

	public Page<AlbumDTO> buscarAlbumsPorGenero(Long idGenero, Pageable pageable) {
	    return albumRepository.findAlbumDTOsByGeneroId(idGenero, pageable);
	}

	public List<String> buscarInicialesArtistasPorGenero(Long idGenero) {
		return albumRepository.findInicialesArtistasByGeneroId(idGenero);
	}

	public Page<AlbumDTO> buscarAlbumsPorGeneroEInicialArtista(Long idGenero, String inicial, Pageable pageable) {
		return albumRepository.findAlbumDTOsByGeneroIdAndInicialArtista(idGenero, inicial, pageable);
	}

	public Page<AlbumDTO> buscarAlbumsPorArtistaPaginados(Long idArtista, Pageable pageable) {
	    return albumRepository.findAlbumDTOsByArtistaId(idArtista, pageable);
	}

	public List<AlbumDTO> buscarAlbumsPorArtista(Long idAlbum) {
		Optional<Album> albums = albumRepository.findById(idAlbum);
		return albums.stream().map(album -> {
	        AlbumDTO dto = new AlbumDTO();
	        dto.setIdAlbum(album.getIdAlbum());
	        dto.setTitulo(album.getTitulo());
	        dto.setAnyo(album.getAnyo());
	        dto.setCover(album.getCover());
	        dto.setArtista(album.getArtista().getNombre());
	        dto.setGenero(album.getGenero().getNombreGenero());
	        return dto;
	    }).collect(Collectors.toList());
	}
	
	public List<AlbumDTO> buscarAlbumsPorTitulo(String titulo) {
		Optional<Album> albumsT = albumRepository.findByTitulo(titulo);
		Optional<Album> albums = albumRepository.findById(albumsT.get().getIdAlbum());
		return albums.stream().map(album -> {
	        AlbumDTO dto = new AlbumDTO();
	        dto.setIdAlbum(album.getIdAlbum());
	        dto.setTitulo(album.getTitulo());
	        dto.setAnyo(album.getAnyo());
	        dto.setCover(album.getCover());
	        dto.setArtista(album.getArtista().getNombre());
	        dto.setGenero(album.getGenero().getNombreGenero());
	        return dto;
	    }).collect(Collectors.toList());
	}


}







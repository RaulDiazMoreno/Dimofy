
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { UserProvider } from './UserContext';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import App from './App'; // Login
import Registro from './Registro';
import RecuperarContraseña from './RecuperarContrasena';
import Home from './Home';
import Usuarios from './Usuarios';
import UsuariosDetalle from './UsuarioDetalle';
import UsuariosEditar from './UsuarioEditar';
import Generos from './Generos';
import Listas from './Listas';
import CrearLista from './CrearLista';
import ConsultarLista from './ConsultarLista';
import EditarLista from './EditarLista';
import Albums from './Albums';
import Layout from './Layout';
import AlbumsA from './AlbumsA';
import CrearAlbum from './CrearAlbum';
import CargaMasiva from './CargaMasiva';
import EditarAlbum from './EditarAlbum';
import ConsultarAlbum from './ConsultarAlbum';
import CancionesA from './CancionesA';
import CrearCanciones from './CrearCanciones';
import ArtistasA from './ArtistasA';
import CrearArtista from './CrearArtista';
import ConsultarArtista from './ConsultarArtista';
import EditarArtista from './EditarArtista';
import AlbumDetail from './AlbumDetail';
import GenerosA from './GenerosA';
import Artistas from './Artistas';
import ArtistaDetalle from './ArtistaDetalle';
import AlbumsPorGenero from './AlbumsPorGenero';
import AlbumsPorArtista from './AlbumsPorArtista';
import AlbumPorCancion from './AlbumPorCancion';
import Canciones from './Canciones';
import PopularArtistsPage from "./dashboard/pages/PopularArtistsPage";
import PopularAlbumsPage from "./dashboard/pages/PopularAlbumsPage";
import PlaylistsPage from "./dashboard/pages/PlaylistsPage";
import GenerosPage from "./dashboard/pages/GenerosPage";
import PlaylistDetail from "./dashboard/pages/PlaylistDetail"

// 1) Crea el cliente
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Ajusta estos valores a tu gusto
      staleTime: 60_000,             // Datos "frescos" durante 1 min
      gcTime: 5 * 60_000,            // Se purgan tras 5 min sin uso
      refetchOnWindowFocus: false,   // Evita refetch al volver al foco
      retry: 1,                      // Reintenta una vez ante errores
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <UserProvider>
        {/* 2) Envolvemos todo con QueryClientProvider */}
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/recuperar" element={<RecuperarContraseña />} />
              {/* Rutas protegidas con Layout */}
              <Route element={<Layout />}>
                <Route path="/home" element={<Home />} />
                <Route path="/albums" element={<Albums />} />
                <Route path="/albums/:id" element={<AlbumDetail />} />
                <Route path="/artistas" element={<Artistas />} />
                <Route path="/artistas/:idArtista" element={<ArtistaDetalle />} />
                <Route path="/generos" element={<Generos />} />
                <Route path="/canciones" element={<Canciones />} />  
                <Route path="admin/usuarios" element={<Usuarios />} />
                <Route path="admin/usuarios/consultar/:id" element={<UsuariosDetalle />} />
                <Route path="admin/usuarios/editar/:id" element={<UsuariosEditar />} />
                <Route path="admin/albumsA" element={<AlbumsA />} />
                <Route path="admin/albumsA/Crear" element={<CrearAlbum />} />
                <Route path="admin/albumsA/Carga" element={<CargaMasiva />} />
                <Route path="/admin/albumsA/editar/:id" element={<EditarAlbum />} />
                <Route path="/admin/albumsA/consultar/:id" element={<ConsultarAlbum />} />
                <Route path="/admin/artistasA" element={<ArtistasA />} />
                <Route path="/admin/artistasA/crear" element={<CrearArtista />} />
                <Route path="/admin/ArtistasA/consultar/:id" element={<ConsultarArtista />} />
                <Route path="/admin/ArtistasA/editar/:id" element={<EditarArtista />} />
                <Route path="/listas" element={<Listas />} />
                <Route path="/listas/crear" element={<CrearLista />} />
                <Route path="/listas/consultar/:id" element={<ConsultarLista />} />
                <Route path="/listas/editar/:id" element={<EditarLista />} />
                <Route path="admin/cancionesA" element={<CancionesA />} />
                <Route path="admin/cancionesA/Crear" element={<CrearCanciones />} />
                <Route path="admin/generosA" element={<GenerosA />} />
                <Route path="/genero/:idGenero" element={<AlbumsPorGenero />} />
                <Route path="/album/:idAlbum" element={<AlbumsPorArtista />} />
                <Route path="/album/titulo/:titulo" element={<AlbumPorCancion />} />
                <Route path="/artistas-populares" element={<PopularArtistsPage />} />
                <Route path="/albums-populares" element={<PopularAlbumsPage />} />
                <Route path="/dashboard/generos" element={<GenerosPage />} />
                <Route path="/playlists" element={<PlaylistsPage />} />
                <Route path="/albums/genero/:idGenero" element={<AlbumsPorGenero />} />
                <Route path="/albums/:id" element={<AlbumDetail />} />
                <Route path="/playlists/:id" element={<PlaylistDetail />} />
              </Route>
            </Routes>
          </BrowserRouter>

          {/* 3) Devtools (opcional, muy útil durante desarrollo) */}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </UserProvider>
    </SnackbarProvider>
  </React.StrictMode>
);




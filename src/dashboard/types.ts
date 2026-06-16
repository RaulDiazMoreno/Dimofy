
// src/dashboard/types.ts

/* ---------------------------------------------------
   Backend: item parecido a álbum que usan tus endpoints
----------------------------------------------------*/
export interface BackendAlbumLike {
  idAlbum: number;
  genero: string;
  artista: string;
  cover?: string;
  anyo?: string;
  titulo?: string;
}

/** En muchos casos el backend envía { json: {...} } */
export interface WrappedBackendItem {
  json: BackendAlbumLike;
}

/* ---------------------------------------------------
   Tipos UI
----------------------------------------------------*/
export interface Genero {
  genero: string;
}

export interface Lista {
  nombre: string;
  numeroCanciones: string;
  cover?: string;
  caratula?: string;
}

export interface Novedad {
  idAlbum?: number | null;
  titulo: string;
  artista: string;
  anyo?: string;
  genero?: string;
  cover?: string;
}

export interface AlbumItem {
  titulo: string;
  artista: string;
  cover?: string;
}

export interface ArtistaUI {
  artista: string;
  imagen?: string | null;
}

/* ---------------------------------------------------
   Props de dashboard
----------------------------------------------------*/
export interface DashboardProps {
  userName: string;
}


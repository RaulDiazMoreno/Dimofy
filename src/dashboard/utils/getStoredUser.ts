export interface StoredUser {
  id?: number;
  idUsuario?: number;
  username?: string;
  nombre?: string;
  token?: string;
  imagenBase64?: string;
  isAdmin?:boolean;
}

export function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getStoredUserId(): number | null {
  const user = getStoredUser();
  return user?.idUsuario ?? user?.id ?? null;
}
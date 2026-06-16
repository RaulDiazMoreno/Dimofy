// src/dashboard/utils/getStoredUserName.ts

// Intenta recuperar el username desde localStorage, soportando varias claves
// porque el shape del objeto "user" puede variar según el login.
export function getStoredUserName(): string {
  try {
    const raw = JSON.parse(localStorage.getItem("user") || "{}") as any;

    const candidates = [
      raw?.userName,
      raw?.username,
      raw?.nombre,
      raw?.name,
      raw?.user?.userName,
      raw?.user?.username,
      raw?.user?.nombre,
      raw?.user?.name,
      raw?.login,
      raw?.user?.login,
      // como último recurso (por si el backend usa email como userName)
      raw?.email,
      raw?.user?.email,
    ];

    const hit = candidates.find((v) => typeof v === "string" && v.trim().length);
    return (hit || "").trim();
  } catch {
    return "";
  }
}

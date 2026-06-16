// src/dashboard/utils/isAdmin.ts
export function isAdminFromStorage(): boolean {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    const role = (u?.rol || u?.role || "").toString().toUpperCase();
    return role === "ADMIN" || role === "ADMINISTRADOR" || role === "ROLE_ADMIN" || u?.isAdmin === true || u?.admin === true;
  } catch {
    return false;
  }
}

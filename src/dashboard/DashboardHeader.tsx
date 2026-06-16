import { isAdminFromStorage } from "./utils/isAdmin";

export default function DashboardHeader({ userName }: { userName: string }) {
  const isAdmin = isAdminFromStorage();

  return (
    <header className="dash-header">
      {isAdmin ? (
        <h2 className="dash-title">Hola, {userName}!</h2>
      ) : (
        <h2 className="dash-title">
          Hola, {userName}!.{" "}
        </h2>
      )}
    </header>
  );
}

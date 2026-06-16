type Genero = {
  idGenero: number;
  genero: string;
};

export async function resolveGeneroIdByName(
  generoName: string,
  token?: string
): Promise<number | null> {
  const wanted = (generoName ?? "").toString().trim().toUpperCase();
  if (!wanted) return null;

  const res = await fetch(
    `http://localhost:8080/app/generos/nombre/${encodeURIComponent(wanted)}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  if (!res.ok) return null;

  const genero = (await res.json()) as Genero;
  return genero?.idGenero ?? null;
}


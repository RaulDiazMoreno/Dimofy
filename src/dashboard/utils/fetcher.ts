
// utils/fetcher.ts
//
// Función fetch tipada + headers con token + manejo de errores consistente.

export async function fetchJson<T>(
  url: string,
  token?: string,
  signal?: AbortSignal
): Promise<T> {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }

  return (await res.json()) as T;
}

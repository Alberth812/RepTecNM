import { ApiRequestError } from "./http-error";

interface ErrorPayload {
  error?: {
    code?: string;
    message?: string;
    issues?: unknown;
  };
}

async function throwApiRequestError(res: Response): Promise<never> {
  let payload: ErrorPayload | null = null;
  try {
    payload = (await res.json()) as ErrorPayload;
  } catch {
    // Respuesta sin body JSON (por ejemplo, un 500 genérico sin detalles).
  }

  const retryAfterHeader = res.headers.get("Retry-After");

  throw new ApiRequestError(
    res.status,
    payload?.error?.code ?? "UNKNOWN_ERROR",
    payload?.error?.message ?? "Ocurrió un error inesperado.",
    {
      issues: payload?.error?.issues,
      retryAfterSeconds: retryAfterHeader ? Number(retryAfterHeader) : undefined,
    },
  );
}

/**
 * `credentials: "include"` es lo que permite que el navegador reciba y
 * reenvíe la cookie de sesión de better-auth aunque estos helpers vivan en
 * un archivo separado del handler de la ruta (misma origin, así que basta
 * con esto; no hace falta configurar CORS).
 */
export async function postJson<TResponse>(
  url: string,
  body: unknown,
): Promise<TResponse> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!res.ok) await throwApiRequestError(res);
  return (await res.json()) as TResponse;
}

export async function getJson<TResponse>(url: string): Promise<TResponse> {
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) await throwApiRequestError(res);
  return (await res.json()) as TResponse;
}

import { ApiRequestError } from "@/lib/api/errors-otro";

//

/**
 * Política de reintentos para queries sobre la API de publicaciones: los
 * errores 4xx (datos inválidos, sin sesión, sin permisos, no encontrado,
 * etc.) son errores del cliente y no deben reintentarse automáticamente. El
 * resto de errores (red, 5xx) se reintenta hasta 2 veces.
 */
export function shouldRetryApiQuery(
  failureCount: number,
  error: unknown,
): boolean {
  if (
    error instanceof ApiRequestError &&
    error.status >= 400 &&
    error.status < 500
  ) {
    return false;
  }
  return failureCount < 2;
}

// lib/publicaciones/api/publicaciones-client.ts
import type {
  PublicacionDetalleResponse,
  PublicacionDocumentoResponse,
  UpdatePublicacionInput,
} from "@/lib/validation/publicaciones";

export interface ApiErrorDetail {
  path: string;
  message: string;
}

/**
 * Espeja el contrato de error de la API:
 * { error: { code, message, details? } }
 *
 * `status` es el código HTTP (400/401/403/409/413/415/422/502/500, etc.)
 * y se conserva por si algún llamador necesita reaccionar a un status
 * puntual (por ejemplo, redirigir en un 401). El mensaje mostrado al
 * usuario siempre es el que vino del servidor, nunca uno inventado aquí.
 */
export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: ApiErrorDetail[];

  constructor(params: {
    status: number;
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  }) {
    super(params.message);
    this.name = "ApiRequestError";
    this.status = params.status;
    this.code = params.code;
    this.details = params.details;
  }
}

interface ApiErrorPayload {
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  if (typeof value !== "object" || value === null) return false;
  const maybeEnvelope = value as { error?: unknown };
  if (typeof maybeEnvelope.error !== "object" || maybeEnvelope.error === null) {
    return false;
  }
  const error = maybeEnvelope.error as { code?: unknown; message?: unknown };
  return typeof error.code === "string" && typeof error.message === "string";
}

const FALLBACK_ERROR_MESSAGE =
  "Ocurrió un error inesperado. Inténtalo nuevamente.";

/**
 * Interpreta una `Response` no exitosa según el contrato de error de la API
 * y lanza `ApiRequestError`. Si el cuerpo no es JSON o no respeta el
 * contrato (por ejemplo, un 502 genérico de infraestructura sin pasar por
 * `handleRouteError`), se usa un mensaje de reserva genérico: nunca se
 * inventan mensajes específicos por status.
 */
async function throwApiRequestError(response: Response): Promise<never> {
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // El servidor no devolvió un cuerpo JSON válido.
  }

  if (isApiErrorPayload(payload)) {
    throw new ApiRequestError({
      status: response.status,
      code: payload.error.code,
      message: payload.error.message,
      details: payload.error.details,
    });
  }

  throw new ApiRequestError({
    status: response.status,
    code: "UNKNOWN_ERROR",
    message: FALLBACK_ERROR_MESSAGE,
  });
}

/**
 * POST /api/publicaciones
 *
 * Recibe el FormData ya armado (campos `metadata` y `documento`) y devuelve
 * la publicación creada en 201, o lanza `ApiRequestError` en cualquier otro
 * status.
 */
export async function crearPublicacionRequest(
  formData: FormData,
  signal?: AbortSignal,
): Promise<PublicacionDetalleResponse> {
  const response = await fetch("/api/publicaciones", {
    method: "POST",
    body: formData,
    signal,
  });

  if (!response.ok) {
    await throwApiRequestError(response);
  }

  return (await response.json()) as PublicacionDetalleResponse;
}

/**
 * GET /api/publicaciones/:id
 *
 * Solo publicaciones ACTIVO; requiere sesión (afiliado o administrador).
 */
export async function obtenerPublicacionRequest(
  id: string,
  signal?: AbortSignal,
): Promise<PublicacionDetalleResponse> {
  const response = await fetch(`/api/publicaciones/${id}`, {
    method: "GET",
    signal,
  });

  if (!response.ok) {
    await throwApiRequestError(response);
  }

  return (await response.json()) as PublicacionDetalleResponse;
}

/**
 * PATCH /api/publicaciones/:id
 *
 * Reemplaza los metadatos completos (autores y palabras clave incluidos).
 * Nunca incluyas `documento`/`documentoArchivoId` en `metadata`: el
 * servidor rechaza explícitamente cualquier intento de tocar el PDF por
 * esta vía con un 400.
 */
export async function actualizarPublicacionRequest(
  id: string,
  metadata: UpdatePublicacionInput,
  signal?: AbortSignal,
): Promise<PublicacionDetalleResponse> {
  const response = await fetch(`/api/publicaciones/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metadata),
    signal,
  });

  if (!response.ok) {
    await throwApiRequestError(response);
  }

  return (await response.json()) as PublicacionDetalleResponse;
}

/**
 * GET /api/publicaciones/:id/documento
 *
 * Genera una URL firmada de descarga/vista del PDF. Se pide bajo demanda
 * (por ejemplo, al hacer clic en "Abrir PDF"), nunca se precarga, ya que
 * expira a los `expiresInSeconds` segundos.
 */
export async function obtenerDocumentoUrlRequest(
  id: string,
  signal?: AbortSignal,
): Promise<PublicacionDocumentoResponse> {
  const response = await fetch(`/api/publicaciones/${id}/documento`, {
    method: "GET",
    signal,
  });

  if (!response.ok) {
    await throwApiRequestError(response);
  }

  return (await response.json()) as PublicacionDocumentoResponse;
}

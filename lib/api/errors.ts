// lib/api/errors.ts

/** Un elemento de `details` cuando el error proviene de la validación de Zod. */
export interface ApiErrorDetail {
 path: string;
 message: string;
}

/** Forma del campo `error` documentada en el contrato de la API. */
export interface ApiErrorPayload {
 code: string;
 message: string;
 details?: ApiErrorDetail[];
}

/**
 * Error tipado para respuestas HTTP no exitosas del backend.
 *
 * `code` es el identificador estable (`UNAUTHORIZED`, `VALIDATION_ERROR`,
 * `CONFLICT`, etc.) documentado en el contrato de errores. La UI debe
 * decidir su comportamiento en función de `status`/`code`, nunca de
 * `message`, que es solo texto para mostrar.
 */
export class ApiRequestError extends Error {
 readonly status: number;
 readonly code: string;
 readonly details?: ApiErrorDetail[];

 constructor(status: number, payload: ApiErrorPayload) {
 super(payload.message);
 this.name = "ApiRequestError";
 this.status = status;
 this.code = payload.code;
 this.details = payload.details;
 }
}

/**
 * Construye un `ApiRequestError` a partir de una `Response` no exitosa.
 * Si el cuerpo no es JSON o no respeta el contrato, cae a un error genérico
 * en vez de lanzar durante el parseo.
 */
export async function parseApiError(
 response: Response,
): Promise<ApiRequestError> {
 let payload: ApiErrorPayload = {
 code: "UNKNOWN_ERROR",
 message: "Ocurrió un error inesperado. Inténtalo de nuevo.",
 };

 try {
 const body = (await response.json()) as { error?: ApiErrorPayload };
 if (body?.error?.code && body.error?.message) {
 payload = body.error;
 }
 } catch {
 // El cuerpo no era JSON válido; se conserva el payload por defecto.
 }

 return new ApiRequestError(response.status, payload);
}

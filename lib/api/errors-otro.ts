/**
 * Contrato de error HTTP consistente en toda la API:
 *
 * {
 * "error": {
 * "code": string,
 * "message": string,
 * "details"?: [{ "path": string, "message": string }]
 * }
 * }
 *
 * El frontend nunca debe mostrar errores técnicos crudos del servidor que no
 * formen parte de este contrato, ni inventar mensajes distintos según el
 * status code HTTP.
 */

export interface ApiErrorDetail {
 path: string;
 message: string;
}

export interface ApiErrorPayload {
 code: string;
 message: string;
 details?: ApiErrorDetail[];
}

/** Error lanzado por el cliente HTTP cuando la API responde con un status no exitoso. */
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

function isApiErrorDetail(value: unknown): value is ApiErrorDetail {
 return (
 typeof value === "object" &&
 value !== null &&
 typeof (value as Record<string, unknown>).path === "string" &&
 typeof (value as Record<string, unknown>).message === "string"
 );
}

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
 if (typeof value !== "object" || value === null) return false;

 const candidato = value as Record<string, unknown>;
 if (
 typeof candidato.code !== "string" ||
 typeof candidato.message !== "string"
 ) {
 return false;
 }

 if (candidato.details !== undefined) {
 if (!Array.isArray(candidato.details)) return false;
 if (!candidato.details.every(isApiErrorDetail)) return false;
 }

 return true;
}

function isApiErrorBody(value: unknown): value is { error: ApiErrorPayload } {
 if (typeof value !== "object" || value === null) return false;
 return isApiErrorPayload((value as Record<string, unknown>).error);
}

/**
 * Mensaje genérico y estable para respuestas que no siguen el contrato (por
 * ejemplo, un proxy intermedio que devuelve HTML en vez de JSON). No se
 * inventan mensajes distintos según el status code.
 */
const MENSAJE_ERROR_GENERICO =
 "Ocurrió un error inesperado al comunicarse con el servidor. Inténtalo nuevamente.";

/** Construye un `ApiRequestError` a partir de una `Response` HTTP no exitosa. */
export async function toApiRequestError(
 response: Response,
): Promise<ApiRequestError> {
 let body: unknown = null;

 try {
 body = await response.json();
 } catch {
 // La respuesta no tiene cuerpo JSON: se usa el mensaje genérico.
 }

 if (isApiErrorBody(body)) {
 return new ApiRequestError(response.status, body.error);
 }

 return new ApiRequestError(response.status, {
 code: "UNKNOWN_ERROR",
 message: MENSAJE_ERROR_GENERICO,
 });
}

/** Extrae un mensaje seguro para mostrar al usuario a partir de un error desconocido. */
export function getApiErrorMessage(error: unknown): string {
 if (error instanceof ApiRequestError) return error.message;
 return MENSAJE_ERROR_GENERICO;
}

/**
 * Extrae los detalles de validación (si existen) para mostrarlos de forma
 * genérica, por ejemplo como una simple lista. No se mapean a campos
 * individuales de ningún formulario.
 */
export function getApiErrorDetails(error: unknown): string[] {
 if (error instanceof ApiRequestError && error.details) {
 return error.details.map((detail) => detail.message);
 }
 return [];
}

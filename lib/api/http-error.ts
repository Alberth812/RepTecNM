export interface ApiRequestErrorOptions {
  issues?: unknown;
  retryAfterSeconds?: number;
}

/**
 * Espejo, del lado del cliente, del shape que produce `toErrorResponse` en
 * `@/lib/http/responses`: `{ error: { code, message, issues? } }`, más el
 * header `Retry-After` que se añade en las respuestas 429 (RF-AUTH-027).
 *
 * Todos los helpers de `auth-api.ts` y `me.ts` lanzan esta clase, así que
 * los componentes solo necesitan un `catch` con `instanceof ApiRequestError`
 * para manejar cualquier error de la REST API de forma consistente.
 */
export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly issues?: unknown;
  readonly retryAfterSeconds?: number;

  constructor(
    status: number,
    code: string,
    message: string,
    options?: ApiRequestErrorOptions,
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.issues = options?.issues;
    this.retryAfterSeconds = options?.retryAfterSeconds;
  }
}

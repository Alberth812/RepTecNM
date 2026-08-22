/**
 * Error de aplicación con código HTTP explícito. Todas las rutas custom lo
 * usan para poder centralizar el mapeo a JSON + headers (ver
 * lib/http/responses.ts), incluyendo el header `Retry-After` que pide
 * RF-AUTH-027 cuando se supera un rate limit.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly retryAfterSeconds?: number;

  constructor(status: number, code: string, message: string, retryAfterSeconds?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }

  static rateLimited(message: string, retryAfterSeconds: number, code = "RATE_LIMITED") {
    // RF-AUTH-027: 429 + Retry-After.
    return new ApiError(429, code, message, retryAfterSeconds);
  }

  static badRequest(message: string, code = "BAD_REQUEST") {
    return new ApiError(400, code, message);
  }

  static unauthorized(message = "No autenticado", code = "UNAUTHORIZED") {
    return new ApiError(401, code, message);
  }

  static forbidden(message = "No autorizado", code = "FORBIDDEN") {
    return new ApiError(403, code, message);
  }

  static notFound(message = "No encontrado", code = "NOT_FOUND") {
    return new ApiError(404, code, message);
  }

  static conflict(message: string, code = "CONFLICT") {
    return new ApiError(409, code, message);
  }
}

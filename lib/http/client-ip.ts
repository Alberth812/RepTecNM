import type { NextRequest } from "next/server";

/**
 * Extrae la IP del cliente para nuestras propias reglas de rate limiting
 * (RF-AUTH-016 y siguientes) en rutas que NO pasan por el manejador de
 * better-auth. Usa el mismo encabezado configurado para better-auth
 * (ver advanced.ipAddress.ipAddressHeaders en lib/auth/auth.ts) para que
 * ambos sistemas de límites "vean" la misma IP detrás de tu proxy/balanceador.
 *
 * IMPORTANTE (mismo principio que la doc de seguridad de better-auth):
 * configura TRUSTED_IP_HEADER a un encabezado que tu proxy establezca de
 * forma confiable y que el cliente no pueda falsificar directamente. En
 * desarrollo, sin proxy, se cae a "127.0.0.1".
 */
export function getClientIp(request: NextRequest): string {
  const headerName = process.env.TRUSTED_IP_HEADER ?? "x-forwarded-for";
  const raw = request.headers.get(headerName);

  if (!raw && process.env.NODE_ENV === "production") {
    throw new Error(`Missing trusted client IP header: ${headerName}`);
  }

  if (!raw) return "127.0.0.1";

  // x-forwarded-for puede traer una cadena "clientIp, proxy1, proxy2"; sin
  // una lista de proxies confiables no es seguro tomar el primero a ciegas,
  // pero para desarrollo/proyectos de un solo proxy conocido es razonable.
  // Si usas varios proxies, apunta TRUSTED_IP_HEADER a un header de un solo
  // valor (p. ej. x-real-ip o cf-connecting-ip) en su lugar.
  const first = raw.split(",")[0]?.trim();
  return first || "127.0.0.1";
}

import { eq, and } from "drizzle-orm";
import { verifyPassword } from "better-auth/crypto";
import { db } from "@/db";
import { account as accountTable } from "@/db/schema";

/**
 * Verifica la contraseña actual de un usuario reutilizando el hash y el
 * comparador que Better Auth ya usa internamente (scrypt), en vez de
 * reimplementar la verificación de contraseñas nosotros mismos.
 *
 * Se usa en RF-AUTH-012 (cambio de correo autogestionado, que exige
 * reintroducir la contraseña actual antes de mandar el OTP al correo nuevo).
 *
 * `hashPassword`/`verifyPassword` de "better-auth/crypto" no forman parte
 * de la documentación pública principal de Better Auth, pero son el export
 * recomendado por los propios mantenedores para este caso de uso (ver
 * https://github.com/better-auth/better-auth/discussions/5074). Si una
 * futura versión de la librería los renombra o los retira, este es el
 * único lugar del proyecto que habría que actualizar.
 */
export async function verifyCurrentPassword(userId: string, password: string): Promise<boolean> {
  const credentialAccount = await db
    .select({ password: accountTable.password })
    .from(accountTable)
    .where(and(eq(accountTable.userId, userId), eq(accountTable.providerId, "credential")))
    .limit(1);

  const hash = credentialAccount[0]?.password;
  if (!hash) return false;

  return verifyPassword({ hash, password });
}

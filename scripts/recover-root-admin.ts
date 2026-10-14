/**
 * RF-AUTH-014: "En caso de pérdida de acceso al administrador raíz, su
 * recuperación se realizará exclusivamente mediante un procedimiento de
 * administración del sistema fuera de la aplicación (por ejemplo, un script
 * o comandos SQL de recuperación ejecutado por un operador con acceso a la
 * infraestructura)."
 *
 * Este script es ese procedimiento: reemplaza la contraseña del
 * administrador raíz directamente en la base de datos y cierra sus sesiones
 * activas. No hay ningún endpoint HTTP equivalente.
 *
 * Uso:
 * npm run recover:root-admin -- "NuevaClaveSegura123!"
 */

import "dotenv/config";
import { and, eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { db } from "@/lib/db/client";
import { users, accounts, sessions } from "@/lib/db/schema/auth-schema";
import { administradores } from "@/lib/db/schema/administradores";
import { validatePassword } from "@/lib/validation/password";

async function main() {
 const newPassword = process.argv[2];
 if (!newPassword) {
 throw new Error(
 'Uso: npm run recover:root-admin -- "NuevaClaveSegura123!"',
 );
 }

 const passwordCheck = validatePassword(newPassword);
 if (!passwordCheck.ok) {
 throw new Error(`Contraseña inválida: ${passwordCheck.message}`);
 }

 const [root] = await db
 .select({ userId: administradores.userId })
 .from(administradores)
 .where(eq(administradores.isRoot, true))
 .limit(1);

 if (!root) {
 throw new Error(
 "No se encontró ningún administrador raíz en la base de datos.",
 );
 }

 const [user] = await db
 .select({ email: users.email })
 .from(users)
 .where(eq(users.id, root.userId))
 .limit(1);

 const hashed = await hashPassword(newPassword);

 const updated = await db
 .update(accounts)
 .set({ password: hashed })
 .where(
 and(
 eq(accounts.userId, root.userId),
 eq(accounts.providerId, "credential"),
 ),
 )
 .returning({ id: accounts.id });

 if (updated.length === 0) {
 throw new Error(
 "No se encontró la cuenta de credenciales (email/password) del administrador raíz.",
 );
 }

 // Cierra cualquier sesión activa por seguridad, ya que se asume que hubo
 // pérdida/compromiso de acceso.
 await db.delete(sessions).where(eq(sessions.userId, root.userId));

 console.log(
 `Contraseña del administrador raíz (${user?.email ?? root.userId}) restablecida correctamente.`,
 );
 console.log("Se cerraron todas sus sesiones activas.");
 process.exit(0);
}

main().catch((error) => {
 console.error("Error al recuperar el acceso del administrador raíz:", error);
 process.exit(1);
});

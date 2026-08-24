/**
 * RF-AUTH-013: "Durante el despliegue inicial del sistema se crea mediante
 * un procedimiento seguro (seed) una cuenta ADMINISTRADOR con subtipo
 * GENERAL y atributo is_root = true, denominada administrador raíz."
 *
 * Este script es ese procedimiento. Se ejecuta UNA sola vez, fuera de la API
 * HTTP (nunca hay una ruta que permita crear is_root=true), leyendo las
 * credenciales desde variables de entorno.
 *
 * Uso:
 *   ROOT_ADMIN_EMAIL=... ROOT_ADMIN_PASSWORD=... ROOT_ADMIN_NAME=... \
 *     npm run seed:root-admin
 */
import "dotenv/config";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema/auth-schema";
import { administradores } from "@/lib/db/schema/administradores";
import { validatePassword } from "@/lib/validation/password";

async function main() {
  const email = process.env.ROOT_ADMIN_EMAIL;
  const password = process.env.ROOT_ADMIN_PASSWORD;
  const name = process.env.ROOT_ADMIN_NAME ?? "Administrador Raíz";

  if (!email || !password) {
    throw new Error(
      "Define ROOT_ADMIN_EMAIL y ROOT_ADMIN_PASSWORD antes de correr este script.",
    );
  }

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.ok) {
    throw new Error(`ROOT_ADMIN_PASSWORD inválida: ${passwordCheck.message}`);
  }

  const [existingRoot] = await db
    .select({ userId: administradores.userId })
    .from(administradores)
    .where(eq(administradores.isRoot, true))
    .limit(1);

  if (existingRoot) {
    throw new Error(
      `Ya existe un administrador raíz (userId=${existingRoot.userId}). Este script es solo para el despliegue inicial; usa scripts/recover-root-admin.ts para recuperar el acceso.`,
    );
  }

  const [existingEmail] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existingEmail) {
    throw new Error(`Ya existe una cuenta con el correo ${email}.`);
  }

  await auth.api.signUpEmail({ body: { name, email, password } });

  const [createdUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (!createdUser) {
    throw new Error("signUpEmail no creó la cuenta esperada.");
  }
  const userId = createdUser.id;

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ role: "ADMINISTRADOR", emailVerified: true })
      .where(eq(users.id, userId));

    await tx.insert(administradores).values({
      userId,
      nombreCompleto: name,
      subtype: "GENERAL",
      isRoot: true,
    });
  });

  console.log(
    `Administrador raíz creado correctamente: ${email} (userId=${userId})`,
  );
  process.exit(0);
}

main().catch((error) => {
  console.error("Error al crear el administrador raíz:", error);
  process.exit(1);
});

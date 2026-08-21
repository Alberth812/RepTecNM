/**
 * Procedimiento seguro de siembra del administrador raíz (RF-AUTH-013).
 *
 * Uso:
 *   npm run seed:root-admin
 *
 * Lee ROOT_ADMIN_EMAIL / ROOT_ADMIN_PASSWORD / ROOT_ADMIN_NAME de las
 * variables de entorno (ver .env.example). Es idempotente: si ya existe un
 * administrador con is_root = true, se aborta sin hacer nada.
 *
 * Este script es, deliberadamente, el ÚNICO lugar de todo el proyecto que
 * puede asignar is_root = true. Ninguna ruta HTTP lo permite (RF-AUTH-013).
 */
import { hashPassword } from "better-auth/crypto";
import { randomUUID } from "crypto";
import "dotenv/config";
import { db } from "../src/db";
import {
  account as accountTable,
  administradores,
  user as userTable,
} from "../src/db/schema";
import { validatePassword } from "../src/lib/password-policy";

async function main() {
  const email = process.env.ROOT_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ROOT_ADMIN_PASSWORD;
  const name = process.env.ROOT_ADMIN_NAME?.trim() || "Administrador Raíz";

  if (!email || !email.includes("@")) {
    throw new Error(
      "ROOT_ADMIN_EMAIL no está definida o no es un correo válido.",
    );
  }
  if (!password) {
    throw new Error("ROOT_ADMIN_PASSWORD no está definida.");
  }
  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    throw new Error(
      `ROOT_ADMIN_PASSWORD no cumple la política de contraseñas: ${passwordCheck.message}`,
    );
  }

  const existingRoot = await db.query.administradores.findFirst({
    where: { isRoot: true },
  });
  if (existingRoot) {
    console.log("Ya existe un administrador raíz. No se hace nada.");
    process.exit(0);
  }

  const existingEmail = await db.query.user.findFirst({ where: { email } });
  if (existingEmail) {
    throw new Error(
      `Ya existe una cuenta con el correo ${email}. Elige otro correo para la raíz.`,
    );
  }

  const now = new Date();
  const userId = randomUUID();
  const passwordHash = await hashPassword(password);

  await db.transaction(async (tx) => {
    await tx.insert(userTable).values({
      id: userId,
      name,
      email,
      emailVerified: true,
      emailVerifiedAt: now,
      role: "ADMINISTRADOR",
      createdAt: now,
      updatedAt: now,
    });

    await tx.insert(accountTable).values({
      id: randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: passwordHash,
      createdAt: now,
      updatedAt: now,
    });

    await tx.insert(administradores).values({
      accountId: userId,
      nombreCompleto: name,
      subtype: "GENERAL",
      isRoot: true,
      createdAt: now,
      updatedAt: now,
    });
  });

  console.log(`Administrador raíz creado: ${email}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

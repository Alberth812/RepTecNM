import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { hashPassword } from "better-auth/crypto";
import { db } from "@/db";
import {
  user as userTable,
  account as accountTable,
  administradores,
} from "@/db/schema";
import {
  requireAdministrador,
  requireAdministradorGeneral,
  errorToResponse,
} from "@/lib/permissions";
import { validatePassword, PASSWORD_POLICY_HINT } from "@/lib/password-policy";

/** GET /api/admins — lista de administradores (visible para cualquier administrador). */
export async function GET() {
  try {
    await requireAdministrador();

    const admins = await db.query.administradores.findMany({
      with: { user: true },
    });

    return NextResponse.json({
      admins: admins.map((a) => ({
        id: a.accountId,
        nombreCompleto: a.nombreCompleto,
        subtype: a.subtype,
        isRoot: a.isRoot,
        email: a.user?.email,
      })),
    });
  } catch (err) {
    return errorToResponse(err);
  }
}

/**
 * POST /api/admins — RF-AUTH-013.
 * Body: { nombreCompleto: string, email: string, password: string, subtype: "GENERAL" | "CONTENIDO" }
 *
 * Restringido a administradores GENERAL. Se inserta directamente en la base
 * de datos (no vía `auth.api.signUpEmail`) a propósito: las cuentas
 * ADMINISTRADOR nacen con `email_verified = TRUE` porque "no necesita
 * verificarse" (RF-AUTH-013), y pasar por el flujo público de registro
 * dispararía el envío automático del código de verificación y dejaría la
 * cuenta bloqueada hasta que alguien lo confirme -- justo lo contrario de
 * lo que pide el requisito.
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdministradorGeneral();

    const body = await req.json().catch(() => null);
    const nombreCompleto =
      typeof body?.nombreCompleto === "string"
        ? body.nombreCompleto.trim()
        : "";
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const subtype = body?.subtype;

    if (!nombreCompleto) {
      return NextResponse.json(
        { error: "Proporciona el nombre completo." },
        { status: 400 },
      );
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Proporciona un correo electrónico válido." },
        { status: 400 },
      );
    }
    if (subtype !== "GENERAL" && subtype !== "CONTENIDO") {
      return NextResponse.json(
        { error: 'El subtipo debe ser "GENERAL" o "CONTENIDO".' },
        { status: 400 },
      );
    }
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: passwordCheck.message, hint: PASSWORD_POLICY_HINT },
        { status: 400 },
      );
    }

    // Correo único en todo el sistema (afiliados + administradores):
    // `user.email` ya tiene un UNIQUE constraint a nivel de columna, pero se
    // comprueba antes también para poder devolver un mensaje claro.
    const existing = await db.query.user.findFirst({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese correo." },
        { status: 409 },
      );
    }

    const now = new Date();
    const userId = randomUUID();
    const passwordHash = await hashPassword(password);

    await db.transaction(async (tx) => {
      await tx.insert(userTable).values({
        id: userId,
        name: nombreCompleto,
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
        nombreCompleto,
        subtype,
        isRoot: false,
        createdAt: now,
        updatedAt: now,
      });
    });

    return NextResponse.json(
      { message: "Cuenta de administrador creada.", id: userId },
      { status: 201 },
    );
  } catch (err) {
    return errorToResponse(err);
  }
}

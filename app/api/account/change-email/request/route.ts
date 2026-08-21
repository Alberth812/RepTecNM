import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { requireAfiliado, errorToResponse } from "@/lib/permissions";
import { verifyCurrentPassword } from "@/lib/auth-helpers";
import { APIError } from "better-auth/api";

/**
 * POST /api/account/change-email/request
 * Body: { newEmail: string, currentPassword: string }
 *
 * RF-AUTH-012, paso 1 de 2. El proceso es autogestionado y exclusivo de
 * afiliados: exige la contraseña actual antes de disparar el OTP al correo
 * nuevo (a diferencia del comportamiento por defecto del plugin, que no
 * pide contraseña).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAfiliado();

    const body = await req.json().catch(() => null);
    const newEmail = typeof body?.newEmail === "string" ? body.newEmail.trim().toLowerCase() : null;
    const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : null;

    if (!newEmail || !newEmail.includes("@")) {
      return NextResponse.json({ error: "Proporciona un correo electrónico válido." }, { status: 400 });
    }
    if (!currentPassword) {
      return NextResponse.json({ error: "Proporciona tu contraseña actual." }, { status: 400 });
    }

    const passwordOk = await verifyCurrentPassword(session.user.id, currentPassword);
    if (!passwordOk) {
      return NextResponse.json({ error: "La contraseña actual no es correcta." }, { status: 401 });
    }

    await auth.api.requestEmailChangeEmailOTP({
      body: { newEmail },
      headers: await headers(),
    });

    return NextResponse.json({
      message: "Te enviamos un código al nuevo correo. Ingrésalo para confirmar el cambio.",
    });
  } catch (err) {
    if (err instanceof APIError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode ?? 400 });
    }
    return errorToResponse(err);
  }
}

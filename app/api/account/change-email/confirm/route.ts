import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { requireAfiliado, errorToResponse } from "@/lib/permissions";
import { APIError } from "better-auth/api";

/**
 * POST /api/account/change-email/confirm
 * Body: { newEmail: string, otp: string }
 *
 * RF-AUTH-012, paso 2 de 2. Confirma el código de 6 dígitos enviado al
 * correo nuevo y, si es válido, Better Auth sustituye el correo de la cuenta.
 */
export async function POST(req: NextRequest) {
  try {
    await requireAfiliado();

    const body = await req.json().catch(() => null);
    const newEmail = typeof body?.newEmail === "string" ? body.newEmail.trim().toLowerCase() : null;
    const otp = typeof body?.otp === "string" ? body.otp : null;

    if (!newEmail || !otp) {
      return NextResponse.json({ error: "Faltan datos para confirmar el cambio." }, { status: 400 });
    }

    await auth.api.changeEmailEmailOTP({
      body: { newEmail, otp },
      headers: await headers(),
    });

    return NextResponse.json({ message: "Tu correo de inicio de sesión se actualizó correctamente." });
  } catch (err) {
    if (err instanceof APIError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode ?? 400 });
    }
    return errorToResponse(err);
  }
}

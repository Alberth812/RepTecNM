import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const UNIFORM_MESSAGE =
  "Si existe una cuenta asociada a este correo, se enviará un correo electrónico para recuperar la contraseña.";

/**
 * POST /api/password/forgot
 *
 * RF-AUTH-011. Toda la lógica de elegibilidad (¿existe la cuenta?, ¿está
 * verificada?, ¿está RECHAZADO/SUSPENDIDO?) y de límite de 5 solicitudes
 * cada 7 días vive centralizada en el hook `before` sobre
 * "/email-otp/request-password-reset" en src/lib/auth.ts, para que se
 * cumpla sin importar quién invoque el endpoint interno.
 *
 * Esta ruta solo hace una cosa más: sin importar el resultado (éxito,
 * cuenta inexistente, cuenta no elegible, límite excedido), siempre
 * responde exactamente el mismo mensaje con el mismo código 200, tal como
 * exige la RF, para no filtrar la existencia o el estado de la cuenta a
 * través de este flujo.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : null;

  if (email) {
    await auth.api.requestPasswordResetEmailOTP({ body: { email } }).catch(() => {
      // Se ignora deliberadamente: el hook `before` ya decidió si debía
      // enviarse o no, y la respuesta al cliente es siempre la misma.
    });
  }

  return NextResponse.json({ message: UNIFORM_MESSAGE }, { status: 200 });
}

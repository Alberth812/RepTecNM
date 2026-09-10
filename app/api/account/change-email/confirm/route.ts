import { type NextRequest } from "next/server";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { requireAfiliado } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { afiliados } from "@/lib/db/schema/afiliados";
import { changeEmailConfirmSchema } from "@/lib/validation/schemas";
import { ok, toErrorResponse } from "@/lib/http/responses";

/** RF-AUTH-012, paso 2: confirma el código de 6 dígitos enviado al nuevo correo. */
//
export async function POST(request: NextRequest) {
  try {
    const session = await requireAfiliado();
    const body = changeEmailConfirmSchema.parse(await request.json());

    await auth.api.changeEmailEmailOTP({
      headers: await headers(),
      body: { newEmail: body.newEmail, otp: body.otp },
    });

    await db
      .update(afiliados)
      .set({ lastEmailChangeAt: new Date() })
      .where(eq(afiliados.userId, session.afiliado.userId));

    return ok({
      message: "Tu correo se actualizó correctamente.",
      email: body.newEmail,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

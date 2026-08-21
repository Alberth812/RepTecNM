import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { validatePassword, PASSWORD_POLICY_HINT } from "@/lib/password-policy";
import { peekCooldown } from "@/lib/rate-limit";
import { APIError } from "better-auth/api";

const RESEND_COOLDOWN_SECONDS = 120;

/**
 * POST /api/register
 *
 * Envoltorio sobre `auth.api.signUpEmail` que implementa RF-AUTH-001 y
 * RF-AUTH-005. Se usa este endpoint propio (en vez de que el formulario de
 * registro llame directo a /api/auth/sign-up/email) porque Better Auth, con
 * `requireEmailVerification: true`, activa su propia protección anti
 * enumeración en el sign-up (responde 200 igual exista o no la cuenta) --
 * comportamiento correcto en general, pero opuesto a lo que pide RF-AUTH-005,
 * que sí quiere distinguir explícitamente "correo pendiente de verificación"
 * de "correo ya registrado y verificado".
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : null;
  const password = typeof body?.password === "string" ? body.password : null;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Proporciona un correo electrónico válido." }, { status: 400 });
  }
  if (!password) {
    return NextResponse.json({ error: "Proporciona una contraseña." }, { status: 400 });
  }

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    return NextResponse.json({ error: passwordCheck.message, hint: PASSWORD_POLICY_HINT }, { status: 400 });
  }

  const existing = await db.query.user.findFirst({ where: { email } });

  if (existing) {
    // --- RF-AUTH-005.b: correo ya verificado ---
    if (existing.emailVerified) {
      return NextResponse.json({ error: "Este correo ya está registrado" }, { status: 409 });
    }

    // --- RF-AUTH-005.a: verificación pendiente ---
    const cooldown = await peekCooldown(
      `otp-resend:email-verification:${email}`,
      RESEND_COOLDOWN_SECONDS,
    );

    return NextResponse.json(
      {
        status: "PENDING_VERIFICATION",
        message: "Ya existe un registro pendiente de verificación para este correo.",
        canResend: cooldown.ready,
        retryAfterSeconds: cooldown.ready ? 0 : cooldown.retryAfterSeconds,
      },
      { status: 200 },
    );
  }

  // --- RF-AUTH-001: alta nueva ---
  try {
    // `name` es obligatorio en el esquema núcleo de Better Auth, pero el
    // modelo de negocio no captura nombres en este punto (llegan más
    // adelante, con la solicitud de membresía). Se usa el correo como
    // marcador de posición; RF-MEMB puede actualizarlo después.
    await auth.api.signUpEmail({
      body: { email, password, name: email },
    });
  } catch (err) {
    if (err instanceof APIError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode ?? 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "No se pudo completar el registro." }, { status: 500 });
  }

  return NextResponse.json(
    {
      status: "CREATED",
      message: "Cuenta creada. Revisa tu correo para verificar tu cuenta.",
    },
    { status: 201 },
  );
}

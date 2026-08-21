import { NextResponse } from "next/server";
import { APIError } from "better-auth/api";

import { auth } from "@/lib/auth";
import { getUserByEmail } from "@/lib/users";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_REQUEST",
          message: "El correo electrónico es obligatorio.",
        },
        { status: 400 },
      );
    }

    const existingUser = await getUserByEmail(email);

    // Mantener comportamiento anti-enumeración.
    if (!existingUser || existingUser.emailVerified) {
      return NextResponse.json({
        success: true,
        message:
          "Si la solicitud es válida, recibirás un nuevo código de verificación.",
      });
    }

    await auth.api.sendVerificationOTP({
      body: {
        email,
        type: "email-verification",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Se envió un nuevo código de verificación.",
      cooldownSeconds: 120,
    });
  } catch (error) {
    console.log(error);

    if (error instanceof APIError) {
      if (
        error.status === "TOO_MANY_REQUESTS" &&
        error.body?.code === "RETRY_AFTER_SECONDS"
      ) {
        return NextResponse.json(
          {
            success: false,
            code: "TOO_MANY_REQUESTS",
            message: error.message,
            retryAfterSeconds: error.body.retryAfterSeconds,
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(error.body.retryAfterSeconds),
            },
          },
        );
      }

      return NextResponse.json(
        {
          success: false,
          code: "AUTH_ERROR",
          message: error.message,
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_ERROR",
        message: "No se pudo reenviar el código.",
      },
      { status: 500 },
    );
  }
}

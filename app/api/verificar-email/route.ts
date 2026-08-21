import { NextResponse } from "next/server";
import { APIError } from "better-auth/api";

import { auth } from "@/lib/auth";
import { getUserByEmail } from "@/lib/users";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const otp = typeof body.otp === "string" ? body.otp.trim() : "";

    if (!email || !otp) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_REQUEST",
          message: "El correo electrónico y el código OTP son obligatorios.",
        },
        { status: 400 },
      );
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_OTP_FORMAT",
          message: "El código debe contener 6 dígitos.",
        },
        { status: 400 },
      );
    }

    const existingUser = await getUserByEmail(email);

    // Respuesta genérica para evitar enumeración.
    if (!existingUser || existingUser.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          code: "VERIFICATION_UNAVAILABLE",
          message: "No se pudo verificar el correo electrónico.",
        },
        { status: 400 },
      );
    }

    await auth.api.verifyEmailOTP({
      body: {
        email,
        otp,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Correo verificado exitosamente.",
    });
  } catch (error) {
    //console.log("El error de verificar email es ", error);

    if (error instanceof APIError) {
      return NextResponse.json(
        {
          success: false,
          code: error.body?.code ?? "",
          message: error.message,
        },
        {
          status: 500,
        },
      );
    }

    console.error("Error verificando email:", error);

    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_ERROR",
        message: "Ocurrió un error al procesar la verificación.",
      },
      { status: 500 },
    );
  }
}

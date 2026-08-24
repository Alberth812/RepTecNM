import { type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { requireAdminGeneral } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema/auth-schema";
import { administradores } from "@/lib/db/schema/administradores";
import { createAdminSchema } from "@/lib/validation/schemas";
import { ok, toErrorResponse } from "@/lib/http/responses";
import { ApiError } from "@/lib/errors";
import { MESSAGES } from "@/lib/constants";
import { sendEmail } from "@/lib/email/mailer";
import { adminWelcomeEmail } from "@/lib/email/templates";

/**
 * RF-AUTH-013: solo un ADMINISTRADOR de subtipo GENERAL puede crear nuevas
 * cuentas ADMINISTRADOR (GENERAL o CONTENIDO). No hay registro público para
 * este rol (RF-AUTH-001). La cuenta se crea ya con correo verificado, sin
 * pasar por el flujo de OTP.
 *
 * `is_root` nunca se acepta aquí: solo puede quedar en true para la cuenta
 * sembrada por scripts/seed-root-admin.ts (ver también su default en el
 * esquema de administradores-schema.ts).
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdminGeneral();
    const body = createAdminSchema.parse(await request.json());

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1);
    if (existing) {
      throw ApiError.conflict(
        MESSAGES.EMAIL_NOT_AVAILABLE,
        "EMAIL_NOT_AVAILABLE",
      );
    }

    // Igual que en /api/register: con requireEmailVerification=true y
    // autoSignIn=false, signUpEmail no lanza error ante un correo duplicado
    // (devuelve una respuesta sintética anti-enumeración), así que releemos
    // por correo en vez de confiar en la respuesta. Ver esa ruta para más
    // detalle.
    await auth.api.signUpEmail({
      body: { name: body.name, email: body.email, password: body.password },
    });

    const [createdUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1);
    if (!createdUser) {
      throw new Error("signUpEmail no creó la cuenta esperada.");
    }
    const createdUserId = createdUser.id;

    // A partir de aquí, ambos pasos (marcar el correo como verificado +
    // pasar el rol a ADMINISTRADOR, y crear el perfil de administradores)
    // ocurren en una única transacción para que sean atómicos entre sí. La
    // llamada a signUpEmail de arriba queda fuera de esta transacción por
    // ser una operación de otra librería; si algo falla después de creada la
    // cuenta base, quedaría un usuario AFILIADO sin verificar huérfano, que
    // de todas formas nunca podría iniciar sesión (ver RF-AUTH-001) y that
    // se puede limpiar manualmente si llegara a ocurrir.
    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ role: "ADMINISTRADOR", emailVerified: true })
        .where(eq(users.id, createdUserId));

      await tx.insert(administradores).values({
        userId: createdUserId,
        nombreCompleto: body.name,
        subtype: body.subtype,
        isRoot: false,
      });
    });

    await sendEmail({
      to: body.email,
      ...adminWelcomeEmail(body.email, body.subtype),
    }).catch((err) => {
      // El envío del correo de bienvenida es una cortesía, no un requisito
      // de RF-AUTH; si falla no se revierte la creación de la cuenta.
      console.error(
        "No se pudo enviar el correo de bienvenida al nuevo administrador:",
        err,
      );
    });

    return ok(
      {
        message: "Cuenta de administrador creada correctamente.",
        admin: {
          id: createdUserId,
          email: body.email,
          name: body.name,
          subtype: body.subtype,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}

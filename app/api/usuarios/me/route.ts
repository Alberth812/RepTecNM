import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema/auth-schema";
import { afiliados } from "@/lib/db/schema/afiliados";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    // Obtener la sesión actual usando Better Auth
    const session = await auth.api.getSession({
      headers: new Headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Buscar el usuario en la base de datos
    const usuario = await db
      .select({
        id: users.id,
        nombre: users.name,
        correo: users.email,
        telefono: users.phone,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (usuario.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: usuario[0].id,
      nombre: usuario[0].nombre,
      correo: usuario[0].correo,
      telefono: usuario[0].telefono || "",
    });
  } catch (error) {
    console.error("Error en /api/usuarios/me:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// payload/auth/betterAuthStrategy.ts
import type { AuthStrategy } from "payload";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/client";
import { administradores } from "@/lib/db/schema/administradores";

export const betterAuthStrategy: AuthStrategy = {
  name: "better-auth",
  authenticate: async ({ payload, headers }) => {
    // 1. Better Auth es la única autoridad de sesión.
    const session = await auth.api.getSession({ headers });
    if (!session) return { user: null };

    // 2. Gate por rol: solo ADMINISTRADOR entra al CMS.
    if (session.user.role !== "ADMINISTRADOR") return { user: null };

    // 3. Perfil de admin real. Si no existe (se borró el registro),
    //    se pierde el acceso aunque `role` todavía diga ADMINISTRADOR.
    const [perfil] = await db
      .select()
      .from(administradores)
      .where(eq(administradores.userId, session.user.id))
      .limit(1);

    if (!perfil) return { user: null };

    // 4. Reflejo mínimo (shadow doc) en la collection interna de Payload.
    //    No es una segunda fuente de identidad: se recalcula y sobrescribe
    //    en cada request a partir de Better Auth + `administradores`.
    const existing = await payload.find({
      collection: "cms-admins",
      where: { betterAuthUserId: { equals: session.user.id } },
      limit: 1,
    });

    const shadowData = {
      betterAuthUserId: session.user.id,
      email: session.user.email,
      name: session.user.name,
      subtype: perfil.subtype,
      isRoot: perfil.isRoot,
    };

    const shadowDoc = existing.docs[0]
      ? await payload.update({
          collection: "cms-admins",
          id: existing.docs[0].id,
          data: shadowData,
        })
      : await payload.create({ collection: "cms-admins", data: shadowData });

    return { user: { collection: "cms-admins", ...shadowDoc } };
  },
};

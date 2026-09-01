// payload/auth/betterAuthStrategy.ts
import type { AuthStrategy } from "payload";

import { auth } from "@/lib/auth/auth";

export const betterAuthStrategy: AuthStrategy = {
  name: "better-auth",
  authenticate: async ({ payload, headers }) => {
    // 1. Better Auth es la única autoridad de sesión.
    const session = await auth.api.getSession({ headers });
    if (!session) return { user: null };

    // 2. Gate por rol: solo ADMINISTRADOR entra al CMS.
    if (session.user.role !== "ADMINISTRADOR") return { user: null };

    // 3. Reflejo mínimo (shadow doc) en la collection interna de Payload.
    //    No es una segunda fuente de identidad: se recalcula y sobrescribe
    //    en cada request a partir de Better Auth + `administradores`.
    const existing = await payload.find({
      collection: "cms-admins",
      where: { user_id: { equals: session.user.id } },
      limit: 1,
    });

    const shadowData = {
      user_id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    };

    /**
     * cms-admin is a collection containing
     * - user_id (unique)
     * - name
     * - email
     */

    const shadowDoc = existing.docs[0]
      ? await payload.update({
          collection: "cms-admins",
          id: existing.docs[0].id,
          data: shadowData,
        })
      : await payload.create({ collection: "cms-admins", data: shadowData });

    return { user: { ...shadowDoc, collection: "cms-admins" } };
  },
};

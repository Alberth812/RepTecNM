import { defineRelations } from "drizzle-orm";
import { user, session, account, verification } from "./auth-schema";
import { afiliados } from "./afiliados";
import { administradores } from "./administradores";

/**
 * Relaciones con la API v1 (RQBv2) de Drizzle ORM.
 *
 * Esto habilita `db.query.user.findFirst({ with: { afiliado: true } })`
 * en el resto de la app. NO se le pasa este objeto al adaptador de Better
 * Auth (`drizzleAdapter`) -- a ese se le pasan las tablas planas (ver
 * `src/lib/auth.ts`), tal como indica su documentación.
 */
export const relations = defineRelations(
  { user, session, account, verification, afiliados, administradores },
  (r) => ({
    user: {
      sessions: r.many.session({
        from: r.user.id,
        to: r.session.userId,
      }),
      accounts: r.many.account({
        from: r.user.id,
        to: r.account.userId,
      }),
      afiliado: r.one.afiliados({
        from: r.user.id,
        to: r.afiliados.accountId,
      }),
      administrador: r.one.administradores({
        from: r.user.id,
        to: r.administradores.accountId,
      }),
    },
    session: {
      user: r.one.user({
        from: r.session.userId,
        to: r.user.id,
      }),
    },
    account: {
      user: r.one.user({
        from: r.account.userId,
        to: r.user.id,
      }),
    },
    afiliados: {
      user: r.one.user({
        from: r.afiliados.accountId,
        to: r.user.id,
      }),
    },
    administradores: {
      user: r.one.user({
        from: r.administradores.accountId,
        to: r.user.id,
      }),
    },
  }),
);

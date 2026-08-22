import { defineRelations } from "drizzle-orm";
import { users, sessions, accounts, verifications } from "./auth-schema";
import { administradores } from "./administradores";
import { afiliados } from "./afiliados";

export const relations = defineRelations(
  { users, sessions, accounts, verifications, administradores, afiliados },
  (r) => ({
    users: {
      sessions: r.many.sessions({
        from: r.users.id,
        to: r.sessions.userId,
      }),
      accounts: r.many.accounts({
        from: r.users.id,
        to: r.accounts.userId,
      }),
      administrador: r.one.administradores({
        from: r.users.id,
        to: r.administradores.userId,
      }),
      afiliado: r.one.afiliados({
        from: r.users.id,
        to: r.afiliados.userId,
      }),
    },
    sessions: {
      user: r.one.users({
        from: r.sessions.userId,
        to: r.users.id,
      }),
    },
    accounts: {
      user: r.one.users({
        from: r.accounts.userId,
        to: r.users.id,
      }),
    },
    administradores: {
      user: r.one.users({
        from: r.administradores.userId,
        to: r.users.id,
      }),
    },
    afiliados: {
      user: r.one.users({
        from: r.afiliados.userId,
        to: r.users.id,
      }),
    },
  }),
);

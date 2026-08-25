import { defineRelations } from "drizzle-orm";
import { users, sessions, accounts, verifications } from "./auth-schema";
import { administradores } from "./administradores";
import { afiliados, proyectosRelevantes, datosEmergencia } from "./afiliados";
import { archivos } from "./archivo";

export const relations = defineRelations(
  {
    users,
    sessions,
    accounts,
    verifications,
    administradores,
    afiliados,
    proyectosRelevantes,
    datosEmergencia,
    archivos,
  },
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

      proyectosRelevantes: r.many.proyectosRelevantes({
        from: r.afiliados.userId,
        to: r.proyectosRelevantes.afiliadoId,
      }),

      datosEmergencia: r.one.datosEmergencia({
        from: r.afiliados.userId,
        to: r.datosEmergencia.afiliadoId,
      }),

      fotografia: r.one.archivos({
        from: r.afiliados.fotografiaArchivoId,
        to: r.archivos.id,
      }),

      comprobanteMembresia: r.one.archivos({
        from: r.afiliados.comprobanteMembresiaArchivoId,
        to: r.archivos.id,
      }),
    },

    proyectosRelevantes: {
      afiliado: r.one.afiliados({
        from: r.proyectosRelevantes.afiliadoId,
        to: r.afiliados.userId,
      }),
    },

    datosEmergencia: {
      afiliado: r.one.afiliados({
        from: r.datosEmergencia.afiliadoId,
        to: r.afiliados.userId,
      }),
    },

    archivos: {
      fotografiaAfiliados: r.many.afiliados({
        from: r.archivos.id,
        to: r.afiliados.fotografiaArchivoId,
      }),

      comprobantesMembresiaAfiliados: r.many.afiliados({
        from: r.archivos.id,
        to: r.afiliados.comprobanteMembresiaArchivoId,
      }),
    },
  }),
);

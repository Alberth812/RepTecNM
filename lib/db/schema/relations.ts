import { defineRelations } from "drizzle-orm";
import { users, sessions, accounts, verifications } from "./auth-schema";
import { administradores } from "./administradores";
import { afiliados, proyectosRelevantes, datosEmergencia } from "./afiliados";
import { archivos } from "./archivo";
import { solicitudes } from "./solicitudes";

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
    solicitudes,
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
      solicitudesRevisadas: r.many.solicitudes({
        from: r.administradores.userId,
        to: r.solicitudes.revisadoPorAdminId,
      }),
    },

    administradores: {
      user: r.one.users({
        from: r.administradores.userId,
        to: r.users.id,
      }),
    },

    afiliados: {
      user: r.one.users({ from: r.afiliados.userId, to: r.users.id }),
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
      solicitudes: r.many.solicitudes({
        // <-- nuevo
        from: r.afiliados.userId,
        to: r.solicitudes.afiliadoId,
      }),
    },

    solicitudes: {
      afiliado: r.one.afiliados({
        from: r.solicitudes.afiliadoId,
        to: r.afiliados.userId,
      }),
      fotografia: r.one.archivos({
        from: r.solicitudes.fotografiaArchivoId,
        to: r.archivos.id,
      }),
      comprobanteMembresia: r.one.archivos({
        from: r.solicitudes.comprobanteMembresiaArchivoId,
        to: r.archivos.id,
      }),
      revisadoPor: r.one.administradores({
        from: r.solicitudes.revisadoPorAdminId,
        to: r.administradores.userId,
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

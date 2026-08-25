import { defineRelations } from "drizzle-orm";
import { users, sessions, accounts, verifications } from "./auth-schema";
import { administradores } from "./administradores";
import {
  afiliados,
  proyectosRelevantes,
  datosEmergencia,
  solicitudesAfiliado,
  revisiones,
} from "./afiliados";
import { archivos } from "./archivo";

export const relations = defineRelations(
  {
    users,
    sessions,
    accounts,
    verifications,
    administradores,
    afiliados,
    solicitudesAfiliado,
    proyectosRelevantes,
    datosEmergencia,
    revisiones,
    archivos,
  },
  (r) => ({
    users: {
      sessions: r.many.sessions({ from: r.users.id, to: r.sessions.userId }),
      accounts: r.many.accounts({ from: r.users.id, to: r.accounts.userId }),
      administrador: r.one.administradores({
        from: r.users.id,
        to: r.administradores.userId,
      }),
      afiliado: r.one.afiliados({ from: r.users.id, to: r.afiliados.userId }),
    },

    sessions: {
      user: r.one.users({ from: r.sessions.userId, to: r.users.id }),
    },
    accounts: {
      user: r.one.users({ from: r.accounts.userId, to: r.users.id }),
    },
    administradores: {
      user: r.one.users({ from: r.administradores.userId, to: r.users.id }),
      revisiones: r.many.revisiones({
        from: r.administradores.userId,
        to: r.revisiones.adminId,
      }),
    },

    afiliados: {
      user: r.one.users({ from: r.afiliados.userId, to: r.users.id }),
      solicitudes: r.many.solicitudesAfiliado({
        from: r.afiliados.userId,
        to: r.solicitudesAfiliado.afiliadoId,
      }),
    },

    solicitudesAfiliado: {
      afiliado: r.one.afiliados({
        from: r.solicitudesAfiliado.afiliadoId,
        to: r.afiliados.userId,
      }),
      proyectosRelevantes: r.many.proyectosRelevantes({
        from: r.solicitudesAfiliado.id,
        to: r.proyectosRelevantes.solicitudId,
      }),
      datosEmergencia: r.one.datosEmergencia({
        from: r.solicitudesAfiliado.id,
        to: r.datosEmergencia.solicitudId,
      }),
      revision: r.one.revisiones({
        from: r.solicitudesAfiliado.id,
        to: r.revisiones.solicitudId,
      }),
      fotografia: r.one.archivos({
        from: r.solicitudesAfiliado.fotografiaArchivoId,
        to: r.archivos.id,
      }),
      comprobanteMembresia: r.one.archivos({
        from: r.solicitudesAfiliado.comprobanteMembresiaArchivoId,
        to: r.archivos.id,
      }),
    },

    proyectosRelevantes: {
      solicitud: r.one.solicitudesAfiliado({
        from: r.proyectosRelevantes.solicitudId,
        to: r.solicitudesAfiliado.id,
      }),
    },

    datosEmergencia: {
      solicitud: r.one.solicitudesAfiliado({
        from: r.datosEmergencia.solicitudId,
        to: r.solicitudesAfiliado.id,
      }),
    },

    revisiones: {
      solicitud: r.one.solicitudesAfiliado({
        from: r.revisiones.solicitudId,
        to: r.solicitudesAfiliado.id,
      }),
      admin: r.one.administradores({
        from: r.revisiones.adminId,
        to: r.administradores.userId,
      }),
    },

    archivos: {
      fotografiaSolicitudes: r.many.solicitudesAfiliado({
        from: r.archivos.id,
        to: r.solicitudesAfiliado.fotografiaArchivoId,
      }),
      comprobantesMembresiaSolicitudes: r.many.solicitudesAfiliado({
        from: r.archivos.id,
        to: r.solicitudesAfiliado.comprobanteMembresiaArchivoId,
      }),
    },
  }),
);

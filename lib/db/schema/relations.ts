import { defineRelations } from "drizzle-orm";

import { users, sessions, accounts, verifications } from "./auth-schema";
import { administradores } from "./administradores";
import { afiliados, proyectosRelevantes, datosEmergencia } from "./afiliados";
import { archivos } from "./archivo";
import { solicitudes } from "./solicitudes";
import {
  licenciaturas,
  posgrados,
  resumenPosgrado,
  estanciasPosdoctorales,
} from "./formacion-academica";
import { instituciones } from "./instituciones";

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

    licenciaturas,
    posgrados,
    resumenPosgrado,
    estanciasPosdoctorales,
    instituciones,
  },
  (r) => ({
    // -------------------------------------------------------------------------
    // AUTH
    // -------------------------------------------------------------------------

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
        optional: false,
      }),
    },

    accounts: {
      user: r.one.users({
        from: r.accounts.userId,
        to: r.users.id,
        optional: false,
      }),
    },

    verifications: {},

    // -------------------------------------------------------------------------
    // ADMINISTRADORES
    // -------------------------------------------------------------------------

    administradores: {
      user: r.one.users({
        from: r.administradores.userId,
        to: r.users.id,
        optional: false,
      }),

      solicitudesRevisadas: r.many.solicitudes({
        from: r.administradores.userId,
        to: r.solicitudes.revisadoPorAdminId,
      }),
    },

    // -------------------------------------------------------------------------
    // AFILIADOS
    // -------------------------------------------------------------------------

    afiliados: {
      user: r.one.users({
        from: r.afiliados.userId,
        to: r.users.id,
        optional: false,
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

      solicitudes: r.many.solicitudes({
        from: r.afiliados.userId,
        to: r.solicitudes.afiliadoId,
      }),

      // Formación académica
      licenciaturas: r.many.licenciaturas({
        from: r.afiliados.userId,
        to: r.licenciaturas.afiliadoId,
      }),

      posgrados: r.many.posgrados({
        from: r.afiliados.userId,
        to: r.posgrados.afiliadoId,
      }),

      resumenPosgrado: r.one.resumenPosgrado({
        from: r.afiliados.userId,
        to: r.resumenPosgrado.afiliadoId,
      }),

      estanciasPosdoctorales: r.many.estanciasPosdoctorales({
        from: r.afiliados.userId,
        to: r.estanciasPosdoctorales.afiliadoId,
      }),
    },

    // -------------------------------------------------------------------------
    // SOLICITUDES
    // -------------------------------------------------------------------------

    solicitudes: {
      afiliado: r.one.afiliados({
        from: r.solicitudes.afiliadoId,
        to: r.afiliados.userId,
        optional: false,
      }),

      fotografia: r.one.archivos({
        from: r.solicitudes.fotografiaArchivoId,
        to: r.archivos.id,
        optional: false,
      }),

      comprobanteMembresia: r.one.archivos({
        from: r.solicitudes.comprobanteMembresiaArchivoId,
        to: r.archivos.id,
        optional: false,
      }),

      revisadoPor: r.one.administradores({
        from: r.solicitudes.revisadoPorAdminId,
        to: r.administradores.userId,
      }),
    },

    // -------------------------------------------------------------------------
    // PROYECTOS RELEVANTES
    // -------------------------------------------------------------------------

    proyectosRelevantes: {
      afiliado: r.one.afiliados({
        from: r.proyectosRelevantes.afiliadoId,
        to: r.afiliados.userId,
        optional: false,
      }),
    },

    // -------------------------------------------------------------------------
    // DATOS DE EMERGENCIA
    // -------------------------------------------------------------------------

    datosEmergencia: {
      afiliado: r.one.afiliados({
        from: r.datosEmergencia.afiliadoId,
        to: r.afiliados.userId,
        optional: false,
      }),
    },

    // -------------------------------------------------------------------------
    // ARCHIVOS
    // -------------------------------------------------------------------------

    archivos: {
      fotografiaAfiliados: r.many.afiliados({
        from: r.archivos.id,
        to: r.afiliados.fotografiaArchivoId,
      }),

      comprobantesMembresiaAfiliados: r.many.afiliados({
        from: r.archivos.id,
        to: r.afiliados.comprobanteMembresiaArchivoId,
      }),

      fotografiaSolicitudes: r.many.solicitudes({
        from: r.archivos.id,
        to: r.solicitudes.fotografiaArchivoId,
      }),

      comprobantesMembresiaSolicitudes: r.many.solicitudes({
        from: r.archivos.id,
        to: r.solicitudes.comprobanteMembresiaArchivoId,
      }),
    },

    // -------------------------------------------------------------------------
    // FORMACIÓN ACADÉMICA
    // -------------------------------------------------------------------------

    licenciaturas: {
      afiliado: r.one.afiliados({
        from: r.licenciaturas.afiliadoId,
        to: r.afiliados.userId,
        optional: false,
      }),

      institucion: r.one.instituciones({
        from: r.licenciaturas.institucionId,
        to: r.instituciones.id,
        optional: false,
      }),
    },

    posgrados: {
      afiliado: r.one.afiliados({
        from: r.posgrados.afiliadoId,
        to: r.afiliados.userId,
        optional: false,
      }),

      institucion: r.one.instituciones({
        from: r.posgrados.institucionId,
        to: r.instituciones.id,
        optional: false,
      }),
    },

    resumenPosgrado: {
      afiliado: r.one.afiliados({
        from: r.resumenPosgrado.afiliadoId,
        to: r.afiliados.userId,
        optional: false,
      }),
    },

    estanciasPosdoctorales: {
      afiliado: r.one.afiliados({
        from: r.estanciasPosdoctorales.afiliadoId,
        to: r.afiliados.userId,
        optional: false,
      }),

      institucion: r.one.instituciones({
        from: r.estanciasPosdoctorales.institucionId,
        to: r.instituciones.id,
      }),
    },

    // -------------------------------------------------------------------------
    // INSTITUCIONES
    // -------------------------------------------------------------------------

    instituciones: {
      licenciaturas: r.many.licenciaturas({
        from: r.instituciones.id,
        to: r.licenciaturas.institucionId,
      }),

      posgrados: r.many.posgrados({
        from: r.instituciones.id,
        to: r.posgrados.institucionId,
      }),

      estanciasPosdoctorales: r.many.estanciasPosdoctorales({
        from: r.instituciones.id,
        to: r.estanciasPosdoctorales.institucionId,
      }),
    },
  }),
);

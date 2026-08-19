import { defineRelations } from "drizzle-orm";
import {
  afiliados,
  datosEmergencia,
  proyectosRelevantes,
} from "./afiliados/schema";
import { accounts } from "./accounts/schema";
import { administradores } from "./admins/schema";

export const relations = defineRelations(
  {
    afiliados,
    proyectosRelevantes,
    datosEmergencia,
    accounts,
    administradores,
  },
  (r) => ({
    afiliados: {
      proyectos: r.many.proyectosRelevantes(),
      datosEmergencia: r.one.datosEmergencia({
        from: r.afiliados.accountId,
        to: r.datosEmergencia.afiliadoId,
      }),
      account: r.one.accounts({
        from: r.afiliados.accountId,
        to: r.accounts.id,
      }),
    },

    proyectosRelevantes: {
      afiliado: r.one.afiliados({
        from: r.proyectosRelevantes.afiliadoId,
        to: r.afiliados.accountId,
      }),
    },

    datosEmergencia: {
      afiliado: r.one.afiliados({
        from: r.datosEmergencia.afiliadoId,
        to: r.afiliados.accountId,
      }),
    },

    // Relaciones de cuentas
    accounts: {
      administrator: r.one.administradores({
        from: r.accounts.id,
        to: r.administradores.accountId,
      }),

      affiliate: r.one.afiliados({
        from: r.accounts.id,
        to: r.afiliados.accountId,
      }),
    },

    administradores: {
      account: r.one.accounts({
        from: r.administradores.accountId,
        to: r.accounts.id,
      }),
    },
  }),
);

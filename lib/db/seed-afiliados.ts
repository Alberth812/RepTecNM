// @/lib/db/seed/seed-afiliados.ts
//
// Seeder de afiliados. Genera TOTAL_AFILIADOS registros completos:
//   - users (better-auth, insertado directamente, sin pasar por el flujo
//     de registro/login real)
//   - afiliados
//   - proyectos_relevantes (1 a 3 por afiliado)
//   - datos_emergencia
//
// Para cada afiliado se suben también sus dos archivos de ejemplo
// (fotografía y comprobante de membresía) vía `subirArchivoEjemplo`.
//
// Uso: ver @/scripts/seed-afiliados.ts

import { randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema/auth-schema";
import {
  afiliados,
  proyectosRelevantes,
  datosEmergencia,
} from "@/lib/db/schema/afiliados";
import { subirArchivoEjemplo } from "@/lib/storage/subirArchivo";
import {
  GENERO_OPTIONS,
  DISPONIBILIDAD_OPTIONS,
  AREA_CONOCIMIENTO_OPTIONS,
  TIPO_SERVICIOS_OPTIONS,
  SECTORES_OPTIONS,
  MODALIDAD_SERVICIOS_OPTIONS,
  INTERESADO_EN_OPTIONS,
  TIPO_SANGUINEO_OPTIONS,
  DATOS_PUBLICOS_OPTIONS,
  ESTADOS_MEXICO,
} from "@/lib/registro/types";
import { nombres, apellidos } from "./seed-data";
import { foliosAnuales } from "./schema/foliosAnuales";

const TOTAL_AFILIADOS = 40;

export async function obtenerSiguienteFolio(): Promise<string> {
  const anio = new Date().getFullYear();

  const [contador] = await db
    .insert(foliosAnuales)
    .values({
      anio,
      ultimoNumero: 1,
    })
    .onConflictDoUpdate({
      target: foliosAnuales.anio,
      set: {
        ultimoNumero: sql`${foliosAnuales.ultimoNumero} + 1`,
      },
    })
    .returning({
      numero: foliosAnuales.ultimoNumero,
    });

  const numero = String(contador.numero).padStart(6, "0");

  return `REP-${anio}-${numero}`;
}

// ---------------------------------------------------------------------------
// Helpers de selección aleatoria
// ---------------------------------------------------------------------------

function pickOne<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Escoge entre `min` y la totalidad de los elementos del arreglo, en orden aleatorio. */
function pickMany<T>(arr: readonly T[], min = 1): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  const count = Math.min(
    arr.length,
    min + Math.floor(Math.random() * (arr.length - min + 1)),
  );
  return shuffled.slice(0, count);
}

/** Quita cualquier opción "Otro" / "Otro (especifique)" antes de elegir. */
function sinOtro<T extends string>(arr: readonly T[]): T[] {
  return arr.filter((valor) => !valor.toLowerCase().startsWith("otro")) as T[];
}

// ---------------------------------------------------------------------------
// Seeder
// ---------------------------------------------------------------------------

export async function seedAfiliados() {
  for (let n = 1; n <= TOTAL_AFILIADOS; n++) {
    await seedUnAfiliado(n);
    console.log(` Afiliado ${n}/${TOTAL_AFILIADOS} creado`);
  }
}

async function seedUnAfiliado(n: number) {
  const now = new Date();

  const nombre = pickOne(nombres);
  const apellidoPaterno = pickOne(apellidos);
  const apellidoMaterno = pickOne(apellidos);
  const nombreCompleto = `${nombre} ${apellidoPaterno} ${apellidoMaterno}`;

  const userId = randomUUID();

  // --- 1. Usuario (better-auth) ---------------------------------------
  await db.insert(users).values({
    id: userId,
    name: nombreCompleto,
    email: `afiliado_${n}@ejemplo.com`,
    emailVerified: true,
    image: null,
    role: "AFILIADO",
    emailVerifiedAt: now,
  });

  // --- 2. Afiliado ------------------------------------------------------
  const folio = await obtenerSiguienteFolio();
  const estadoResidencia = pickOne(ESTADOS_MEXICO);

  await db.insert(afiliados).values({
    userId,
    apellidoPaterno,
    apellidoMaterno,
    nombres: nombre,
    genero: pickOne(sinOtro(GENERO_OPTIONS)),

    membershipStatus: "ACTIVO",
    fechaInicioMembresia: now,
    lastEmailChangeAt: null,
    motivoSuspension: null,

    folio,
    mostrarEnQr: true,

    telefonoCelular: "1111111111",
    telefonoCasa: "1111111111",
    correoElectronico: `afiliado_${n}@ejemplo.com`,
    linkedin: null,
    orcid: null,
    sitioWeb: null,

    estadoResidencia,
    ciudadResidencia: `Ciudad en ${estadoResidencia}`,
    disponibilidadGeografica: pickMany(DISPONIBILIDAD_OPTIONS),

    areaConocimiento: pickMany(sinOtro(AREA_CONOCIMIENTO_OPTIONS)),
    areaConocimientoOtro: null,
    perfilProfesional: "Descripción del perfil larga",
    palabrasClave: [
      "palabra1",
      "palabra2",
      "palabra3",
      "palabra4",
      "palabra5",
      "palabra6",
    ],
    habilidadesTecnologicas: "Algunas habilidades",

    tipoServicios: pickMany(sinOtro(TIPO_SERVICIOS_OPTIONS)),
    tipoServiciosOtro: null,
    descripcionServicios: "Descripción de servicios",
    sectores: pickMany(sinOtro(SECTORES_OPTIONS)),
    sectoresOtro: null,
    modalidadServicios: pickMany(MODALIDAD_SERVICIOS_OPTIONS),
    interesadoEn: pickMany(sinOtro(INTERESADO_EN_OPTIONS)),
    interesadoEnOtro: null,

    autorizaPublicacion: true,
    // En types.ts este arreglo está marcado como "Escoge TODAS", así que no
    // se elige un subconjunto aleatorio como con los demás campos.
    datosPublicos: [...DATOS_PUBLICOS_OPTIONS],
  });

  // --- 3. Proyectos relevantes (1 a 3) -----------------------------------
  const numProyectos = 1 + Math.floor(Math.random() * 3);
  for (let p = 1; p <= numProyectos; p++) {
    await db.insert(proyectosRelevantes).values({
      afiliadoId: userId,
      nombre: `Proyecto ${p}`,
      descripcion: `Descripción del proyecto${p}`,
      rol: "Un rol inventado",
      anio: 2025,
    });
  }

  // --- 4. Datos de emergencia --------------------------------------------
  await db.insert(datosEmergencia).values({
    afiliadoId: userId,
    nombreContacto: `${pickOne(nombres)} ${pickOne(apellidos)} ${pickOne(apellidos)}`,
    parentesco: "Tutor(a)",
    parentescoOtro: null,
    telefono: "1111111111",
    tipoSanguineo: pickOne(TIPO_SANGUINEO_OPTIONS),
    alergiasCondicionesMedicas: null,
    mostrarEnQr: true,
  });

  // --- 5. Archivos de ejemplo (fotografía + comprobante de membresía) ----
  const [, fotografiaArchivo] = await subirArchivoEjemplo({
    ownerId: userId,
    folder: "fotografia",
  });
  const [, comprobanteArchivo] = await subirArchivoEjemplo({
    ownerId: userId,
    folder: "membresia",
  });

  await db
    .update(afiliados)
    .set({
      fotografiaArchivoId: fotografiaArchivo.id,
      comprobanteMembresiaArchivoId: comprobanteArchivo.id,
    })
    .where(eq(afiliados.userId, userId));
}

//

import { db } from "@/lib/db/client";
import { foliosAnuales } from "@/lib/db/schema/foliosAnuales";
import { sql } from "drizzle-orm";

const TOTAL_AFILIADOS = 40;

// Contraseña compartida para las cuentas de prueba.
// Puedes sobrescribirla mediante SEED_AFILIADOS_PASSWORD.
const PASSWORD = process.env.SEED_AFILIADOS_PASSWORD ?? "Afiliado123456!";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error("No hay elementos disponibles para seleccionar.");
  }

  return items[randomInt(0, items.length - 1)];
}

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

async function obtenerSiguienteFolio(): Promise<string> {
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

/**
 * Selecciona aleatoriamente entre 1 y N elementos.
 */
function randomMultiple<T>(items: readonly T[]): T[] {
  const shuffled = shuffle(items);
  const quantity = randomInt(1, shuffled.length);

  return shuffled.slice(0, quantity);
}

/**
 * Elimina la opción "Otro (especifique)" de los catálogos.
 */
function excludeOther<T extends string>(items: readonly T[]): T[] {
  return items.filter((item) => item !== "Otro (especifique)");
}

async function main() {
  if (PASSWORD.length < 8 || PASSWORD.length > 128) {
    throw new Error("La contraseña debe tener entre 8 y 128 caracteres.");
  }

  const [
    { db },
    { auth },
    { users },
    { afiliados, proyectosRelevantes, datosEmergencia },
    { subirArchivoEjemplo },
    {
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
    },
    { nombres, apellidos },
    { eq, inArray },
  ] = await Promise.all([
    import("@/lib/db/client"),
    import("@/lib/auth/auth"),
    import("@/lib/db/schema/auth-schema"),
    import("@/lib/db/schema/afiliados"),
    import("@/lib/storage/subirArchivo"),
    import("@/lib/registro/types"),
    import("@/lib/registro/seed-data"),
    import("drizzle-orm"),
  ]);

  const areasConocimiento = excludeOther(AREA_CONOCIMIENTO_OPTIONS);

  const tiposServicios = excludeOther(TIPO_SERVICIOS_OPTIONS);

  const sectoresDisponibles = excludeOther(SECTORES_OPTIONS);

  const interesadosDisponibles = excludeOther(INTERESADO_EN_OPTIONS);

  const correos = Array.from(
    { length: TOTAL_AFILIADOS },
    (_, index) => `afiliado_${index + 1}@ejemplo.com`,
  );

  // Evita duplicar cuentas si el seeder ya fue ejecutado.
  const existentes = await db
    .select({
      email: users.email,
    })
    .from(users)
    .where(inArray(users.email, correos));

  if (existentes.length > 0) {
    throw new Error(
      `Ya existen ${existentes.length} cuentas de este seeder. ` +
        "Elimina los registros anteriores antes de ejecutarlo nuevamente.",
    );
  }

  console.log(`Iniciando generación de ${TOTAL_AFILIADOS} afiliados...`);

  const resultados: {
    folio: string;
    nombre: string;
    email: string;
    password: string;
  }[] = [];

  for (let i = 1; i <= TOTAL_AFILIADOS; i++) {
    console.log(`Generando afiliado ${i}/${TOTAL_AFILIADOS}`);

    const nombresAleatorios = randomItem(nombres);
    const apellidoPaterno = randomItem(apellidos);
    const apellidoMaterno = randomItem(apellidos);

    const nombreCompleto = `${nombresAleatorios} ${apellidoPaterno} ${apellidoMaterno}`;

    const email = `afiliado_${i}@ejemplo.com`;

    /*
     * 1. Crear usuario y cuenta de autenticación.
     *
     * Better Auth genera el hash de la contraseña y registra
     * la cuenta con el proveedor de credenciales.
     */
    const registro = await auth.api.signUpEmail({
      body: {
        name: nombreCompleto,
        email,
        password: PASSWORD,
      },
    });

    const afiliadoId = registro.user.id;

    const fechaActual = new Date();

    /*
     * 2. Verificar el correo y establecer el rol.
     */
    await db
      .update(users)
      .set({
        emailVerified: true,
        emailVerifiedAt: fechaActual,
        role: "AFILIADO",
      })
      .where(eq(users.id, afiliadoId));

    /*
     * 3. Subir fotografía y comprobante de membresía.
     *
     * La función devuelve:
     * [archivoSubido, archivoObjeto]
     *
     * Se utiliza el ID del archivo registrado en la BD.
     */
    const [, fotografiaArchivo] = await subirArchivoEjemplo({
      ownerId: afiliadoId,
      folder: "fotografia",
    });

    const [, comprobanteArchivo] = await subirArchivoEjemplo({
      ownerId: afiliadoId,
      folder: "membresia",
    });

    /*
     * 4. Generar folio.
     */
    const folio = await obtenerSiguienteFolio();

    /*
     * 5. Seleccionar estado y generar ciudad.
     */
    const estadoResidencia = randomItem(ESTADOS_MEXICO);

    /*
     * 6. Generar proyectos relevantes (1 a 3).
     */
    const cantidadProyectos = randomInt(1, 3);

    const proyectos = Array.from({ length: cantidadProyectos }, (_, index) => ({
      nombre: `Proyecto ${index + 1}`,
      descripcion: `Descripción del proyecto ${index + 1}`,
      rol: "Un rol inventado",
      anio: 2025,
    }));

    /*
     * 7. Generar nombre del contacto de emergencia.
     */
    const nombreContacto = [
      randomItem(nombres),
      randomItem(apellidos),
      randomItem(apellidos),
    ].join(" ");

    /*
     * 8. Generar afiliado, proyectos y datos de emergencia.
     */
    await db.transaction(async (tx) => {
      await tx.insert(afiliados).values({
        userId: afiliadoId,

        // Datos generales
        apellidoPaterno,
        apellidoMaterno,
        nombres: nombresAleatorios,
        fotografiaArchivoId: fotografiaArchivo.id,
        comprobanteMembresiaArchivoId: comprobanteArchivo.id,
        genero: randomItem(GENERO_OPTIONS),

        // Estado de membresía
        membershipStatus: "ACTIVO",
        fechaInicioMembresia: fechaActual,
        lastEmailChangeAt: null,
        motivoSuspension: null,

        // Folio
        folio,
        mostrarEnQr: true,

        // Contacto
        telefonoCelular: "1111111111",
        telefonoCasa: "1111111111",
        correoElectronico: email,
        linkedin: null,
        orcid: null,
        sitioWeb: null,

        // Ubicación
        estadoResidencia,
        ciudadResidencia: `Cuidad en ${estadoResidencia}`,
        disponibilidadGeografica: randomMultiple(DISPONIBILIDAD_OPTIONS),

        // Perfil profesional
        areaConocimiento: randomMultiple(areasConocimiento),
        areaConocimientoOtro: null,
        perfilProfesional: "Descripción del perfil profesional larga",
        palabrasClave: [
          "palabra1",
          "palabra2",
          "palabra3",
          "palabra4",
          "palabra5",
          "palabra6",
        ],
        habilidadesTecnologicas: "Algunas habilidades",

        // Servicios profesionales
        tipoServicios: randomMultiple(tiposServicios),
        tipoServiciosOtro: null,
        descripcionServicios: "Descripción de servicios",
        sectores: randomMultiple(sectoresDisponibles),
        sectoresOtro: null,
        modalidadServicios: randomMultiple(MODALIDAD_SERVICIOS_OPTIONS),
        interesadoEn: randomMultiple(interesadosDisponibles),
        interesadoEnOtro: null,

        // Visibilidad
        autorizaPublicacion: true,
        datosPublicos: randomMultiple(DATOS_PUBLICOS_OPTIONS),
      });

      await tx.insert(proyectosRelevantes).values(
        proyectos.map((proyecto) => ({
          afiliadoId,
          ...proyecto,
        })),
      );

      await tx.insert(datosEmergencia).values({
        afiliadoId,

        nombreContacto,
        parentesco: "Tutor(a)",
        parentescoOtro: null,
        telefono: "1111111111",
        tipoSanguineo: randomItem(TIPO_SANGUINEO_OPTIONS),
        alergiasCondicionesMedicas: null,
        mostrarEnQr: true,
      });
    });

    resultados.push({
      folio,
      nombre: nombreCompleto,
      email,
      password: PASSWORD,
    });

    console.log(`Afiliado creado: ${nombreCompleto} | ${folio}`);
  }

  console.log("\n========================================");
  console.log("SEEDER FINALIZADO CORRECTAMENTE");
  console.log("========================================");
  console.log(`Afiliados generados: ${resultados.length}`);
  console.log(`Contraseña compartida: ${PASSWORD}`);
  console.log("========================================");

  console.table(resultados);
}

main().catch((error) => {
  console.error("\nError ejecutando el seeder:");
  console.error(error);
  process.exitCode = 1;
});

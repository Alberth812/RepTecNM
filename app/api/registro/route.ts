import { createAfiliado } from "@/lib/db/afiliados/queries";
import { parseRegistroFormData } from "@/lib/registro/formData";
import { registroServerSchema } from "@/lib/registro/schema";
import { uploadFile } from "@/lib/storage";
import { NextResponse } from "next/server";
import { z } from "zod";

// El driver de Neon usado en `lib/db/index.ts` necesita WebSockets (`ws`),
// que no están disponibles en el runtime Edge de Next.js. Se fija
// explícitamente el runtime Node.js por si el proyecto cambia el default.
export const runtime = "nodejs";

// Este endpoint recibe `multipart/form-data` (no JSON) porque el formulario
// incluye archivos (fotografía y, opcionalmente, comprobante de membresía).

export async function POST(request: Request) {
  let raw: Record<string, unknown>;

  try {
    const formData = await request.formData();
    raw = parseRegistroFormData(formData);
  } catch {
    return NextResponse.json(
      { message: "No se pudo leer la solicitud. Verifica el formato enviado." },
      { status: 400 },
    );
  }

  const result = await registroServerSchema.safeParseAsync(raw);

  if (!result.success) {
    // Usamos la nueva función recomendada por Zod
    const flattened = z.flattenError(result.error);

    return NextResponse.json(
      {
        message: "Hay errores de validación en el registro.",
        errors: flattened.fieldErrors,
      },
      { status: 400 },
    );
  }

  const data = result.data;

  try {
    // 1. Subir los archivos antes de tocar la base de datos: si algo falla
    //    aquí, no queda ningún registro a medias.
    const fotografiaUrl = await uploadFile(data.fotografia, "fotografias");
    const comprobanteUrl = data.comprobante_membresia
      ? await uploadFile(data.comprobante_membresia, "comprobantes")
      : null;

    // 2. Insertar afiliado + proyectos + datos de emergencia en una sola
    //    transacción (ver `lib/db/queries.ts`).
    const afiliado = await createAfiliado({
      afiliado: {
        apellidoPaterno: data.apellido_paterno,
        apellidoMaterno: data.apellido_materno,
        nombres: data.nombres,
        fotografiaUrl,
        comprobanteMembresiaUrl: comprobanteUrl,
        genero: data.genero,

        telefonoCelular: data.telefono_celular,
        telefonoCasa: emptyToNull(data.telefono_casa),
        correoElectronico: data.correo_electronico,
        linkedin: emptyToNull(data.linkedin),
        orcid: emptyToNull(data.orcid),
        sitioWeb: emptyToNull(data.sitio_web),

        estadoResidencia: data.estado_residencia,
        ciudadResidencia: data.ciudad_residencia,
        disponibilidadGeografica: data.disponibilidad_geografica,

        areaConocimiento: data.area_conocimiento,
        areaConocimientoOtro: emptyToNull(data.area_conocimiento_otro),
        perfilProfesional: data.perfil_profesional,
        palabrasClave: data.palabras_clave,
        habilidadesTecnologicas: data.habilidades_tecnologicas,

        tipoServicios: data.tipo_servicios,
        tipoServiciosOtro: emptyToNull(data.tipo_servicios_otro),
        descripcionServicios: data.descripcion_servicios,
        sectores: data.sectores,
        sectoresOtro: emptyToNull(data.sectores_otro),
        modalidadServicios: data.modalidad_servicios,
        interesadoEn: data.interesado_en,
        interesadoEnOtro: emptyToNull(data.interesado_en_otro),

        autorizaPublicacion: data.autoriza_publicacion,
        datosPublicos: data.datos_publicos,
      },
      proyectos: data.proyectos_relevantes.map((proyecto) => ({
        nombre: proyecto.nombre,
        descripcion: proyecto.descripcion,
        rol: proyecto.rol,
        anio: proyecto.anio,
      })),
      datosEmergencia: {
        nombreContacto: data.nombre_contacto_emergencia,
        parentesco: data.parentesco_contacto_emergencia,
        parentescoOtro: emptyToNull(data.parentesco_contacto_emergencia_otro),
        telefono: data.telefono_contacto_emergencia,
        tipoSanguineo: data.tipo_sanguineo,
        alergiasCondicionesMedicas: emptyToNull(
          data.alergias_condiciones_medicas,
        ),
        mostrarEnQr: data.privacidad_datos_emergencia,
      },
    });

    return NextResponse.json(
      { message: "Registro creado correctamente.", id: afiliado.id },
      { status: 201 },
    );
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { message: "Ya existe un registro con ese correo electrónico." },
        { status: 409 },
      );
    }
    console.error("Error al guardar el registro de afiliado:", error);
    return NextResponse.json(
      {
        message:
          "Ocurrió un error al guardar el registro. Intenta de nuevo más tarde.",
      },
      { status: 500 },
    );
  }
}

/** Convierte cadenas vacías (campos opcionales sin llenar) a `null` para la base de datos. */
function emptyToNull(value: string | undefined): string | null {
  return value && value.trim() !== "" ? value : null;
}

/** Postgres error code 23505 = unique_violation (p. ej. correo_electronico duplicado). */
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

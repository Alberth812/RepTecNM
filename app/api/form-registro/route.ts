import { requireAfiliado } from "@/lib/auth/session";
import { updateAfiliado } from "@/lib/db/afiliados/queries";
import { toErrorResponse } from "@/lib/http/responses";
import { parseRegistroFormData } from "@/lib/registro/formData";
import { registroServerSchema } from "@/lib/registro/schema";
import { deleteFile, uploadFile } from "@/lib/storage";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  const { afiliado } = await requireAfiliado();

  if (afiliado.membershipStatus === "PENDIENTE_APROBACION") {
    /**
     * membershipStatus: "NO_INICIADA" | "PENDIENTE_APROBACION" | "REQUIERE_CORRECCION" | "RECHAZADO" | "ACTIVO" | "INACTIVO" | "SUSPENDIDO" | "BAJA"
     *
     * NO_INICIADA -> signiifca que es la primera vez que envía
     * REQUIERE_CORRECCION -> signiifca que ya envío una respuesta anterior
     * RECHAZADO, INACTIVO, SUSPENDIDO o BAJA -> No puede enviar nada
     * ACTIVO -> signfica que ya fue aprobado así que no tiene sentido que envíe esto
     * */
  }

  // (afiliado.membershipStatus === "PENDIENTE_APROBACION")

  let raw: Record<string, unknown>;

  try {
    const formData = await request.formData();
    raw = parseRegistroFormData(formData);
  } catch {
    return NextResponse.json(
      {
        message: "No se pudo leer la solicitud. Verifica el formato enviado.",
      },
      { status: 400 },
    );
  }

  const result = await registroServerSchema.safeParseAsync(raw);

  if (!result.success) {
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

  let fotografia: Awaited<ReturnType<typeof uploadFile>> | null = null;
  let membresia: Awaited<ReturnType<typeof uploadFile>> | null = null;

  try {
    /*
     * 1. Subimos ambos objetos a Garage.
     */
    fotografia = await uploadFile({
      file: data.fotografia,
      ownerId: afiliado.userId,
      folder: "fotografia",
    });

    membresia = await uploadFile({
      file: data.comprobante_membresia,
      ownerId: afiliado.userId,
      folder: "membresia",
    });

    /**
     * 2. Guardamos las referencias en Postgres.
     *
     * updateAfiliado debe ejecutar todas sus operaciones en una
     * única transacción.
     */
    const updatedAfiliado = await updateAfiliado({
      userId: afiliado.userId,

      archivos: {
        fotografia: {
          bucket: fotografia.bucket,
          objectKey: fotografia.objectKey,
          originalName: fotografia.originalName,
          contentType: fotografia.contentType,
          size: fotografia.size,
        },

        comprobanteMembresia: {
          bucket: membresia.bucket,
          objectKey: membresia.objectKey,
          originalName: membresia.originalName,
          contentType: membresia.contentType,
          size: membresia.size,
        },
      },

      afiliado: {
        apellidoPaterno: data.apellido_paterno,
        apellidoMaterno: data.apellido_materno,
        nombres: data.nombres,

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

    /**
     * 3. Si la transacción de BD tuvo éxito, podemos eliminar
     *    posteriormente los archivos anteriores si existían.
     *
     *    Esto es especialmente importante cuando el afiliado
     *    vuelve a editar su registro.
     */

    return NextResponse.json(
      {
        message: "Registro actualizado correctamente.",
        userId: updatedAfiliado.userId,
      },
      { status: 200 },
    );
  } catch (error) {
    /**
     * Si Postgres falla, limpiamos los objetos recién subidos.
     */
    await cleanupUploadedFiles(fotografia, membresia);

    if (isUniqueViolation(error)) {
      return NextResponse.json(
        {
          message: "Ya existe un registro con ese correo electrónico.",
        },
        { status: 409 },
      );
    }

    console.error("Error al guardar el registro de afiliado:", error);

    return toErrorResponse(error);
  }
}

async function cleanupUploadedFiles(
  fotografia: Awaited<ReturnType<typeof uploadFile>> | null,
  membresia: Awaited<ReturnType<typeof uploadFile>> | null,
) {
  const files = [fotografia, membresia].filter(
    (file): file is NonNullable<typeof file> => file !== null,
  );

  await Promise.allSettled(files.map((file) => deleteFile(file.objectKey)));
}

function emptyToNull(value: string | undefined): string | null {
  return value && value.trim() !== "" ? value : null;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

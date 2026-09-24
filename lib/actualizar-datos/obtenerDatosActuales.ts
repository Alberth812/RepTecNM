// lib/actualizar-datos/obtenerDatosActuales.ts

import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  afiliados,
  datosEmergencia,
  proyectosRelevantes,
} from "@/lib/db/schema/afiliados";
import { registroClientSchema, RegistroFormInput } from "./schema";

export async function obtenerDatosActuales(
  userId: string,
): Promise<RegistroFormInput> {
  const [afiliado] = await db
    .select()
    .from(afiliados)
    .where(eq(afiliados.userId, userId))
    .limit(1);

  if (!afiliado) {
    throw new Error("No se encontraron los datos del afiliado.");
  }

  const [emergencia] = await db
    .select()
    .from(datosEmergencia)
    .where(eq(datosEmergencia.afiliadoId, userId))
    .limit(1);

  const proyectos = await db
    .select()
    .from(proyectosRelevantes)
    .where(eq(proyectosRelevantes.afiliadoId, userId));

  const data = {
    apellido_paterno: afiliado.apellidoPaterno ?? "",
    apellido_materno: afiliado.apellidoMaterno ?? "",
    nombres: afiliado.nombres ?? "",
    genero: afiliado.genero ?? "",

    telefono_celular: afiliado.telefonoCelular ?? "",
    telefono_casa: afiliado.telefonoCasa ?? "",
    correo_electronico: afiliado.correoElectronico ?? "",
    linkedin: afiliado.linkedin ?? "",
    orcid: afiliado.orcid ?? "",
    sitio_web: afiliado.sitioWeb ?? "",

    estado_residencia: afiliado.estadoResidencia ?? "",
    ciudad_residencia: afiliado.ciudadResidencia ?? "",
    disponibilidad_geografica: afiliado.disponibilidadGeografica ?? [],

    area_conocimiento: afiliado.areaConocimiento ?? [],
    area_conocimiento_otro: afiliado.areaConocimientoOtro ?? "",
    perfil_profesional: afiliado.perfilProfesional ?? "",
    palabras_clave: afiliado.palabrasClave ?? [],
    habilidades_tecnologicas: afiliado.habilidadesTecnologicas ?? "",

    proyectos_relevantes: proyectos.map((proyecto) => ({
      id: proyecto.id,
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion,
      rol: proyecto.rol,
      anio: proyecto.anio,
    })),

    tipo_servicios: afiliado.tipoServicios ?? [],
    tipo_servicios_otro: afiliado.tipoServiciosOtro ?? "",
    descripcion_servicios: afiliado.descripcionServicios ?? "",
    sectores: afiliado.sectores ?? [],
    sectores_otro: afiliado.sectoresOtro ?? "",
    modalidad_servicios: afiliado.modalidadServicios ?? [],
    interesado_en: afiliado.interesadoEn ?? [],
    interesado_en_otro: afiliado.interesadoEnOtro ?? "",

    nombre_contacto_emergencia: emergencia?.nombreContacto ?? "",
    parentesco_contacto_emergencia: emergencia?.parentesco ?? "",
    parentesco_contacto_emergencia_otro: emergencia?.parentescoOtro ?? "",
    telefono_contacto_emergencia: emergencia?.telefono ?? "",
    tipo_sanguineo: emergencia?.tipoSanguineo ?? "",
    alergias_condiciones_medicas: emergencia?.alergiasCondicionesMedicas ?? "",
    privacidad_datos_emergencia: emergencia?.mostrarEnQr ?? false,

    autoriza_publicacion: afiliado.autorizaPublicacion ?? false,
    datos_publicos: afiliado.datosPublicos ?? [],
  };

  const result = registroClientSchema.safeParse(data);

  if (!result.success) {
    console.error("Datos inválidos del afiliado:", result.error.flatten());

    throw new Error(
      "Los datos actuales del afiliado no tienen un formato válido.",
    );
  }

  return result.data;
}

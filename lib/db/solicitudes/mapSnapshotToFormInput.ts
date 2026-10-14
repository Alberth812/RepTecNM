// lib/registro/mapSnapshotToFormInput.ts
import { RegistroFormInput } from "@/lib/registro/schema";
import { SolicitudDatosSnapshot } from "@/lib/registro/solicitud-snapshot";

/**
 * Convierte `solicitudes.datos` (el snapshot guardado, sin archivos) en
 * valores iniciales para el formulario. Los campos de archivo
 * (fotografia, comprobante_membresia) se excluyen a propósito: el afiliado
 * siempre debe volver a adjuntarlos, así que quedan vacíos aunque el resto
 * de las respuestas se precargue.
 */
export function mapSnapshotToFormInput(
 datos: SolicitudDatosSnapshot,
): Omit<RegistroFormInput, "fotografia" | "comprobante_membresia"> {
 return {
 apellido_paterno: datos.apellido_paterno,
 apellido_materno: datos.apellido_materno,
 nombres: datos.nombres,
 genero: datos.genero,

 telefono_celular: datos.telefono_celular,
 telefono_casa: datos.telefono_casa ?? "",
 correo_electronico: datos.correo_electronico,
 linkedin: datos.linkedin ?? "",
 orcid: datos.orcid ?? "",
 sitio_web: datos.sitio_web ?? "",

 estado_residencia: datos.estado_residencia,
 ciudad_residencia: datos.ciudad_residencia,
 disponibilidad_geografica: datos.disponibilidad_geografica,

 area_conocimiento: datos.area_conocimiento,
 area_conocimiento_otro: datos.area_conocimiento_otro ?? "",
 perfil_profesional: datos.perfil_profesional,
 palabras_clave: datos.palabras_clave,
 habilidades_tecnologicas: datos.habilidades_tecnologicas,
 proyectos_relevantes: datos.proyectos_relevantes,

 tipo_servicios: datos.tipo_servicios,
 tipo_servicios_otro: datos.tipo_servicios_otro ?? "",
 descripcion_servicios: datos.descripcion_servicios,
 sectores: datos.sectores,
 sectores_otro: datos.sectores_otro ?? "",
 modalidad_servicios: datos.modalidad_servicios,
 interesado_en: datos.interesado_en,
 interesado_en_otro: datos.interesado_en_otro ?? "",

 nombre_contacto_emergencia: datos.nombre_contacto_emergencia,
 parentesco_contacto_emergencia: datos.parentesco_contacto_emergencia,
 parentesco_contacto_emergencia_otro:
 datos.parentesco_contacto_emergencia_otro ?? "",
 telefono_contacto_emergencia: datos.telefono_contacto_emergencia,
 tipo_sanguineo: datos.tipo_sanguineo,
 alergias_condiciones_medicas: datos.alergias_condiciones_medicas ?? "",
 privacidad_datos_emergencia: datos.privacidad_datos_emergencia,

 autoriza_publicacion: datos.autoriza_publicacion,
 datos_publicos: datos.datos_publicos,
 };
}
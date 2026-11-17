// components/admin/solicitudes/datos-solicitud.tsx
import {
 Accordion,
 AccordionContent,
 AccordionItem,
 AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Campo } from "./campo";
import type { SolicitudDatosSnapshot } from "@/lib/registro/solicitud-snapshot";

function ListaBadges({ items }: { items: string[] }) {
 if (items.length === 0) {
 return <span className="text-sm text-muted-foreground">—</span>;
 }
 return (
 <div className="flex flex-wrap gap-1.5">
 {items.map((item) => (
 <Badge key={item} variant="outline" className="font-normal">
 {item}
 </Badge>
 ))}
 </div>
 );
}

export function DatosSolicitud({ datos }: { datos: SolicitudDatosSnapshot }) {
 return (
 <Accordion
 defaultValue={["generales", "contacto", "perfil", "servicios", "emergencia"]}
 className="space-y-2"
 >
 <AccordionItem value="generales" className="rounded-lg border px-4">
 <AccordionTrigger>Datos generales</AccordionTrigger>
 <AccordionContent className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-3">
 <Campo label="Nombre(s)" value={datos.nombres} />
 <Campo label="Apellido paterno" value={datos.apellido_paterno} />
 <Campo label="Apellido materno" value={datos.apellido_materno} />
 <Campo label="Género" value={datos.genero} />
 </AccordionContent>
 </AccordionItem>

 <AccordionItem value="contacto" className="rounded-lg border px-4">
 <AccordionTrigger>Contacto</AccordionTrigger>
 <AccordionContent className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2">
 <Campo label="Teléfono celular" value={datos.telefono_celular} />
 <Campo label="Teléfono de casa" value={datos.telefono_casa} />
 <Campo label="Correo electrónico" value={datos.correo_electronico} />
 <Campo label="LinkedIn" value={datos.linkedin} />
 <Campo label="ORCID" value={datos.orcid} />
 <Campo label="Sitio web" value={datos.sitio_web} />
 </AccordionContent>
 </AccordionItem>

 <AccordionItem value="ubicacion" className="rounded-lg border px-4">
 <AccordionTrigger>Ubicación y disponibilidad</AccordionTrigger>
 <AccordionContent className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2">
 <Campo label="Estado de residencia" value={datos.estado_residencia} />
 <Campo label="Ciudad de residencia" value={datos.ciudad_residencia} />
 <div className="sm:col-span-2">
 <p className="mb-1.5 text-xs font-medium text-muted-foreground">
 Disponibilidad geográfica
 </p>
 <ListaBadges items={datos.disponibilidad_geografica} />
 </div>
 </AccordionContent>
 </AccordionItem>

 <AccordionItem value="perfil" className="rounded-lg border px-4">
 <AccordionTrigger>Perfil profesional</AccordionTrigger>
 <AccordionContent className="space-y-4 pb-4">
 <div>
 <p className="mb-1.5 text-xs font-medium text-muted-foreground">
 Área(s) de conocimiento
 </p>
 <ListaBadges items={datos.area_conocimiento} />
 {datos.area_conocimiento_otro && (
 <p className="mt-1 text-sm text-muted-foreground">
 Otro: {datos.area_conocimiento_otro}
 </p>
 )}
 </div>
 <Campo label="Perfil profesional" value={datos.perfil_profesional} />
 <div>
 <p className="mb-1.5 text-xs font-medium text-muted-foreground">
 Palabras clave
 </p>
 <ListaBadges items={datos.palabras_clave} />
 </div>
 <Campo
 label="Habilidades tecnológicas"
 value={datos.habilidades_tecnologicas}
 />
 </AccordionContent>
 </AccordionItem>

 <AccordionItem value="proyectos" className="rounded-lg border px-4">
 <AccordionTrigger>
 Proyectos relevantes ({datos.proyectos_relevantes.length})
 </AccordionTrigger>
 <AccordionContent className="space-y-3 pb-4">
 {datos.proyectos_relevantes.length === 0 && (
 <p className="text-sm text-muted-foreground">
 No se registraron proyectos.
 </p>
 )}
 {datos.proyectos_relevantes.map((p, i) => (
 <div key={i} className="rounded-md border p-3">
 <div className="mb-2 flex items-center justify-between gap-2">
 <p className="text-sm font-medium">{p.nombre}</p>
 <Badge variant="outline">{p.anio}</Badge>
 </div>
 <p className="text-sm text-muted-foreground">{p.descripcion}</p>
 <p className="mt-1 text-xs text-muted-foreground">Rol: {p.rol}</p>
 </div>
 ))}
 </AccordionContent>
 </AccordionItem>

 <AccordionItem value="servicios" className="rounded-lg border px-4">
 <AccordionTrigger>Servicios profesionales</AccordionTrigger>
 <AccordionContent className="space-y-4 pb-4">
 <div>
 <p className="mb-1.5 text-xs font-medium text-muted-foreground">
 Tipo de servicios
 </p>
 <ListaBadges items={datos.tipo_servicios} />
 {datos.tipo_servicios_otro && (
 <p className="mt-1 text-sm text-muted-foreground">
 Otro: {datos.tipo_servicios_otro}
 </p>
 )}
 </div>
 <Campo
 label="Descripción de servicios"
 value={datos.descripcion_servicios}
 />
 <div>
 <p className="mb-1.5 text-xs font-medium text-muted-foreground">
 Sectores
 </p>
 <ListaBadges items={datos.sectores} />
 {datos.sectores_otro && (
 <p className="mt-1 text-sm text-muted-foreground">
 Otro: {datos.sectores_otro}
 </p>
 )}
 </div>
 <div>
 <p className="mb-1.5 text-xs font-medium text-muted-foreground">
 Modalidad de servicios
 </p>
 <ListaBadges items={datos.modalidad_servicios} />
 </div>
 <div>
 <p className="mb-1.5 text-xs font-medium text-muted-foreground">
 Interesado en
 </p>
 <ListaBadges items={datos.interesado_en} />
 {datos.interesado_en_otro && (
 <p className="mt-1 text-sm text-muted-foreground">
 Otro: {datos.interesado_en_otro}
 </p>
 )}
 </div>
 </AccordionContent>
 </AccordionItem>

 <AccordionItem value="emergencia" className="rounded-lg border px-4">
 <AccordionTrigger>Datos de emergencia</AccordionTrigger>
 <AccordionContent className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2">
 <Campo
 label="Nombre de contacto"
 value={datos.nombre_contacto_emergencia}
 />
 <Campo
 label="Parentesco"
 value={datos.parentesco_contacto_emergencia}
 />
 {datos.parentesco_contacto_emergencia_otro && (
 <div className="sm:col-span-2">
 <Campo
 label="Parentesco (otro)"
 value={datos.parentesco_contacto_emergencia_otro}
 />
 </div>
 )}
 <Campo
 label="Teléfono"
 value={datos.telefono_contacto_emergencia}
 />
 <Campo label="Tipo sanguíneo" value={datos.tipo_sanguineo} />
 <div className="sm:col-span-2">
 <Campo
 label="Alergias o condiciones médicas"
 value={datos.alergias_condiciones_medicas}
 />
 </div>
 <Campo
 label="Visible en credencial QR"
 value={datos.privacidad_datos_emergencia ? "Sí" : "No"}
 />
 </AccordionContent>
 </AccordionItem>

 <AccordionItem value="visibilidad" className="rounded-lg border px-4">
 <AccordionTrigger>Visibilidad y privacidad</AccordionTrigger>
 <AccordionContent className="space-y-3 pb-4">
 <Campo
 label="Autoriza publicación en catálogo"
 value={datos.autoriza_publicacion ? "Sí" : "No"}
 />
 <div>
 <p className="mb-1.5 text-xs font-medium text-muted-foreground">
 Datos públicos
 </p>
 <ListaBadges items={datos.datos_publicos} />
 </div>
 </AccordionContent>
 </AccordionItem>
 </Accordion>
 );
}
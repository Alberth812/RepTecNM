// components/admin/solicitudes/solicitud-version-view.tsx
import { RevisionInfo } from "./revision-info";
import { ArchivoPreview } from "./archivo-preview";
import { DatosSolicitud } from "./datos-solicitud";
import type { SolicitudVersion } from "@/lib/api/solicitudes";

export function SolicitudVersionView({ version }: { version: SolicitudVersion }) {
 return (
 <div className="space-y-6">
 <RevisionInfo version={version} />

 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
 <ArchivoPreview titulo="Fotografía" archivo={version.fotografia} />
 <ArchivoPreview
 titulo="Comprobante de membresía"
 archivo={version.comprobanteMembresia}
 />
 </div>

 <DatosSolicitud datos={version.datos} />
 </div>
 );
}

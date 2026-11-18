// app/(afiliado)/registro/page.tsx 
import { requireAfiliado } from "@/lib/auth/session";
import { obtenerSolicitudActualParaAfiliado } from "@/lib/db/solicitudes/queries";
import { getFileUrl } from "@/lib/storage";
import RegistroForm from "@/components/afilliate/registro/RegistroFormv2";
import { mapSnapshotToFormInput } from "@/lib/db/solicitudes/mapSnapshotToFormInput";
import RegistroEnviado from "@/components/afilliate/registro/ui/RegistroEnviado";
import { NoAutorizado } from "@/components/auth/no-autorizado";

export default async function Page() {
  const { afiliado } = await requireAfiliado([
    "NO_INICIADA",
    "PENDIENTE_APROBACION",
    "REQUIERE_CORRECCION",
  ]);

  if (afiliado.membershipStatus === "NO_INICIADA") {
    return <RegistroForm />;
  }

  if (afiliado.membershipStatus === "PENDIENTE_APROBACION") {
    return <RegistroEnviado />;
  }

  if (afiliado.membershipStatus === "REQUIERE_CORRECCION") {
    const solicitud = await obtenerSolicitudActualParaAfiliado(afiliado.userId);

    // No debería pasar (no hay REQUIERE_CORRECCION sin solicitud previa),
    // pero por seguridad caemos al formulario vacío en vez de tronar.
    if (!solicitud) {
      return <RegistroForm />;
    }

    const [fotografiaUrl, comprobanteUrl] = await Promise.all([
      getFileUrl("afiliados", solicitud.fotografia.objectKey),
      getFileUrl("afiliados", solicitud.comprobanteMembresia.objectKey),
    ]);

    return (
      <RegistroForm
        initialData={mapSnapshotToFormInput(solicitud.datos)}
        observaciones={solicitud.revisionObservaciones}
        archivosActuales={{
          fotografia: {
            originalName: solicitud.fotografia.originalName,
            url: fotografiaUrl,
          },
          comprobanteMembresia: {
            originalName: solicitud.comprobanteMembresia.originalName,
            url: comprobanteUrl,
          },
        }}
      />
    );
  }

  // ACTIVO, RECHAZADO, INACTIVO, SUSPENDIDO, BAJA:
  // ya los manejas en otro lado según comentaste — deja aquí tu
  // componente/mensaje correspondiente para esos casos.
  return <NoAutorizado redirectHref="/" />;
}

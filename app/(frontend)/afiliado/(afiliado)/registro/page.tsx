// app/(frontend)/afiliado/registro/page.tsx
import { redirect } from "next/navigation";
import { requireAfiliado } from "@/lib/auth/session";
import { obtenerSolicitudActualParaAfiliado } from "@/lib/db/solicitudes/queries";
import { getFileUrl } from "@/lib/storage";
import RegistroForm from "@/components/afilliate/registro/RegistroFormv2";
import { mapSnapshotToFormInput } from "@/lib/db/solicitudes/mapSnapshotToFormInput";
import RegistroEnviado from "@/components/afilliate/registro/ui/RegistroEnviado";

export default async function Page() {
  // 1. Exigimos que sea un afiliado, pero SIN restringir el estado aún.
  // Esto nos permite leer el estado y decidir qué mostrar.
  const { afiliado } = await requireAfiliado();

  const status = afiliado.membershipStatus;

  // 2. Manejo de estados según la lógica de negocio (RF-MEMB-002)
  
  if (status === "ACTIVO") {
    // Si ya está activo, no tiene nada que hacer en el registro
    redirect("/afiliado/inicio");
  }

  if (status === "NO_INICIADA") {
    return <RegistroForm />;
  }

  if (status === "PENDIENTE_APROBACION") {
    return <RegistroEnviado />;
  }

  if (status === "REQUIERE_CORRECCION") {
    const solicitud = await obtenerSolicitudActualParaAfiliado(afiliado.userId);

    // Fallback por seguridad: si no hay solicitud, redirigimos al inicio
    if (!solicitud) {
      redirect("/afiliado/inicio");
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

  // 3. Estados que no deberían interactuar con el registro (RECHAZADO, INACTIVO, SUSPENDIDO, BAJA)
  // Mostramos un mensaje claro y profesional.
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-8">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Restringido</h2>
      <p className="text-gray-600 max-w-md">
        Tu estado de membresía actual (<strong>{status}</strong>) no te permite acceder al formulario de registro o modificación de datos. 
        Si crees que esto es un error, por favor contacta a la administración.
      </p>
    </div>
  );
}
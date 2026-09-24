// app/(afiliado)/registro/page.tsx
import ModificarDatosForm from "@/lib/actualizar-datos/ModificarDatosForm";
import { obtenerDatosActuales } from "@/lib/actualizar-datos/obtenerDatosActuales";
import { requireAfiliado } from "@/lib/auth/session";

export default async function Page() {
  const { afiliado } = await requireAfiliado(["ACTIVO", "INACTIVO"]);

  const datosActuales = await obtenerDatosActuales(afiliado.userId);

  return <ModificarDatosForm initialData={datosActuales} />;
}

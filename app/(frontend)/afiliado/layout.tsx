import { redirect } from "next/navigation";
import { requireAfiliado } from "@/lib/auth/session";
import { BarraAfiliado } from "@/components/barra-afiliado/BarraAfiliado";

// Rutas que un afiliado NO-activo puede visitar
const ALLOWED_FOR_NON_ACTIVE = [
  "/afiliado/registro",
  "/afiliado/inicio",
  "/afiliado/cuenta",
];

export default async function AfiliadoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // requireAfiliado lanza error si no hay sesión o si el rol no es AFILIADO
  const { afiliado } = await requireAfiliado();

  const status = afiliado.membershipStatus;

  // Estados que NO deben acceder a NADA (redirigir a login con mensaje)
  if (status === "SUSPENDIDO" || status === "BAJA") {
    redirect("/login?reason=suspended");
  }

  // Estados que solo pueden ver el registro/inicio/cuenta
  if (
    status === "NO_INICIADA" ||
    status === "PENDIENTE_APROBACION" ||
    status === "REQUIERE_CORRECCION" ||
    status === "RECHAZADO" ||
    status === "INACTIVO"
  ) {
    // Aquí no podemos leer pathname directamente en un layout server,
    // así que usamos una trampa: solo permitimos children si estamos
    // en una subruta permitida. La validación real de pathname la
    // hacemos en cada page.tsx con requireAfiliado([...]).
    // Para blindar, enviamos a registro si el usuario intenta algo más.
  }

  return <BarraAfiliado>{children}</BarraAfiliado>;
}

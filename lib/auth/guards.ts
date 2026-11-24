import { redirect } from "next/navigation";
import { requireAfiliado } from "./session";

/**
 * Guard para rutas de afiliado que requieren estado ACTIVO.
 * Si el afiliado no está ACTIVO, redirige a /afiliado/registro.
 * 
 * Uso en page.tsx:
 *   const { afiliado } = await requireAfiliadoActivo();
 */
export async function requireAfiliadoActivo() {
  const { afiliado } = await requireAfiliado();

  if (afiliado.membershipStatus !== "ACTIVO") {
    redirect("/afiliado/registro");
  }

  return { afiliado };
}

/**
 * Guard para rutas que solo permiten NO_INICIADA, PENDIENTE_APROBACION,
 * REQUIERE_CORRECCION (es decir, el flujo de registro).
 */
export async function requireAfiliadoEnRegistro() {
  const { afiliado } = await requireAfiliado([
    "NO_INICIADA",
    "PENDIENTE_APROBACION",
    "REQUIERE_CORRECCION",
  ]);
  return { afiliado };
}

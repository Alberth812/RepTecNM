import { requireAfiliadoActivo } from "@/lib/auth/guards";
import PageClient from "./page-client";

export default async function Page() {
  // Si no está ACTIVO, esto redirige automáticamente a /afiliado/registro
  await requireAfiliadoActivo();
  
  // Si llega aquí, es ACTIVO, renderizamos el componente cliente
  return <PageClient />;
}

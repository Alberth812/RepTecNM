import { PublicacionDetallePageClient } from "@/components/publicaciones/general/publicacion-detalle-page-client";

interface PublicacionDetallePageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicacionDetallePage({
  params,
}: PublicacionDetallePageProps) {
  const { id } = await params;
  return <PublicacionDetallePageClient id={id} />;
}

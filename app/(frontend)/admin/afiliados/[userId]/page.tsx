// @/app/admin/afiliados/[userId]/page.tsx
import { AfiliadoDetailView } from "@/components/admin/afiliados/afiliado-detail-view";

interface AfiliadoDetallePageProps {
  params: Promise<{ userId: string }>;
}

export default async function AfiliadoDetallePage({
  params,
}: AfiliadoDetallePageProps) {
  const { userId } = await params;

  return (
    <div className="mx-auto w-full max-w-4xl py-6">
      <AfiliadoDetailView userId={userId} />
    </div>
  );
}

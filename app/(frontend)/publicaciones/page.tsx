import type { Metadata } from "next";

import { PublicacionesPageClient } from "@/components/publicaciones/general/publicaciones-page-client";

export const metadata: Metadata = {
 title: "Publicaciones académicas",
};

export default function PublicacionesPage() {
 return <PublicacionesPageClient />;
}

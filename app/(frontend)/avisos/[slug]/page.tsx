// app/avisos/[slug]/page.tsx
import { LivePreviewListener } from "@/components/live-preview/refresh-route-on-save";
import { RichText } from "@/components/posts/rich-text";
import { AvisoBadges } from "@/components/avisos/avisos-badges";
import { queryAvisoBySlug } from "@/payload/queries/avisos";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

type Args = {
 params: Promise<{
 slug: string;
 }>;
};

export async function generateMetadata({ params }: Args): Promise<Metadata> {
 const { slug } = await params;
 const decodedSlug = decodeURIComponent(slug);

 const aviso = await queryAvisoBySlug(decodedSlug);

 if (!aviso) {
 return {
 title: "Aviso no encontrado",
 };
 }

 return {
 title: aviso.title,
 };
}

export default async function AvisoPage({
 params,
}: {
 params: Promise<{ slug: string }>;
}) {
 const { slug } = await params;
 const decodedSlug = decodeURIComponent(slug);

 const { isEnabled: draft } = await draftMode();
 const aviso = await queryAvisoBySlug(decodedSlug);

 if (!aviso) {
 notFound();
 }

 const publishedDate = new Intl.DateTimeFormat("es", {
 dateStyle: "long",
 }).format(new Date(aviso.publishedAt));

 return (
 <article className="mx-auto max-w-3xl px-4 py-16">
 {draft ? <LivePreviewListener /> : null}

 <header className="mb-10">
 <AvisoBadges
 important={Boolean(aviso.important)}
 expiresAt={aviso.expiresAt ?? null}
 />

 <h1 className="mt-3 text-4xl font-medium leading-tight text-foreground">
 {aviso.title}
 </h1>

 <p className="mt-3 text-sm text-muted-foreground">{publishedDate}</p>
 </header>

 <RichText content={aviso.content} />
 </article>
 );
}
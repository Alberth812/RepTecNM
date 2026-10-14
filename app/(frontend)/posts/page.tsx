import { LivePreviewListener } from "@/components/live-preview/refresh-route-on-save";
import { RichText } from "@/components/posts/rich-text";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { queryPostBySlug } from "@/payload/queries/posts";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type Args = {
 params: Promise<{
 slug: string;
 }>;
};

function getMediaUrl(url: string): string {
 try {
 return new URL(url).pathname;
 } catch {
 return url;
 }
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
 const { slug } = await params;
 const decodedSlug = decodeURIComponent(slug);

 const post = await queryPostBySlug(decodedSlug);

 if (!post) {
 return {
 title: "Post no encontrado",
 };
 }

 return {
 title: post.title,
 };
}

export default async function PostPage({ params }: Args) {
 const { slug } = await params;
 const decodedSlug = decodeURIComponent(slug);

 const { isEnabled: draft } = await draftMode();
 const post = await queryPostBySlug(decodedSlug);

 if (!post) {
 notFound();
 }

 const hero = typeof post.heroImage === "object" ? post.heroImage : null;

 const heroUrl = hero?.url ? getMediaUrl(hero.url) : null;

 const publishedDate = post.publishedAt
 ? new Intl.DateTimeFormat("es-MX", {
 dateStyle: "long",
 }).format(new Date(post.publishedAt))
 : null;

 return (
 <main className="min-h-screen bg-muted/30">
 {draft ? <LivePreviewListener /> : null}

 <article className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
 <div className="overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm">
 {/* Header */}
 <header className="px-6 pb-10 pt-8 sm:px-10 sm:pt-10 lg:px-16 lg:pt-14">
 <div className="mx-auto max-w-3xl">
 <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
 <Link
 href="/posts"
 className="font-medium transition-colors hover:text-foreground"
 >
 Publicaciones
 </Link>

 <span aria-hidden="true" className="text-border">
 /
 </span>

 {publishedDate ? (
 <time dateTime={post.publishedAt ?? undefined}>
 {publishedDate}
 </time>
 ) : (
 <span>Borrador</span>
 )}

 {draft ? (
 <>
 <span aria-hidden="true" className="text-border">
 /
 </span>

 <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
 Vista previa
 </span>
 </>
 ) : null}
 </div>

 <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]">
 {post.title}
 </h1>
 </div>
 </header>

 {/* Hero */}
 {heroUrl ? (
 <div className="px-4 sm:px-6 lg:px-10">
 <AspectRatio
 ratio={16 / 8}
 className="overflow-hidden rounded-xl bg-muted"
 >
 <Image
 src={heroUrl}
 alt={hero?.alt ?? post.title}
 fill
 priority
 sizes="(min-width: 1024px) 944px, calc(100vw - 32px)"
 className="object-cover"
 />
 </AspectRatio>
 </div>
 ) : null}

 {/* Content */}
 <div className="px-6 pb-14 pt-12 sm:px-10 lg:px-16 lg:pb-20 lg:pt-16">
 <div className="mx-auto max-w-3xl">
 <RichText content={post.content} />
 </div>
 </div>
 </div>
 </article>
 </main>
 );
}

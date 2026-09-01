import { LivePreviewListener } from "@/components/live-preview/refresh-route-on-save";
import { PostRichText } from "@/components/posts/post-rich-text";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { queryPostBySlug } from "@/payload/queries/posts";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import Image from "next/image";
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

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const { isEnabled: draft } = await draftMode();
  const post = await queryPostBySlug(decodedSlug);

  if (!post) {
    notFound();
  }

  const hero = typeof post.heroImage === "object" ? post.heroImage : null;

  const publishedDate = new Intl.DateTimeFormat("es", {
    dateStyle: "long",
  }).format(new Date(post.publishedAt));

  const heroUrl = hero?.url ? getMediaUrl(hero.url) : null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      {draft ? <LivePreviewListener /> : null}

      <header className="mb-10">
        <h1 className="text-4xl font-medium leading-tight text-foreground">
          {post.title}
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">{publishedDate}</p>
      </header>

      {heroUrl ? (
        <AspectRatio
          ratio={16 / 9}
          className="mb-10 overflow-hidden rounded-lg bg-muted"
        >
          <Image
            src={heroUrl}
            alt={hero?.alt ?? post.title}
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            priority
            className="object-cover"
          />
        </AspectRatio>
      ) : null}

      <PostRichText content={post.content} />
    </article>
  );
}

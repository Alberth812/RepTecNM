import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { getPayloadClient } from "@/lib/payload/getPayloadClient";
import { PostRichText } from "@/components/posts/post-rich-text";

async function getPost(slug: string) {
  const payload = await getPayloadClient();

  const { docs } = await payload.find({
    collection: "posts",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2, // resuelve heroImage y también los uploads dentro de "content" (MediaBlock)
  });

  return docs[0] ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return { title: post?.title ?? "Post no encontrado" };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const hero = typeof post.heroImage === "object" ? post.heroImage : null;
  const publishedDate = new Intl.DateTimeFormat("es", {
    dateStyle: "long",
  }).format(new Date(post.publishedAt));

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <header className="mb-10">
        <h1 className="text-4xl font-medium leading-tight text-foreground">
          {post.title}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">{publishedDate}</p>
      </header>

      {hero?.url ? (
        <AspectRatio
          ratio={16 / 9}
          className="mb-10 overflow-hidden rounded-lg bg-muted"
        >
          <Image
            src={hero.url}
            alt={hero.alt ?? post.title}
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

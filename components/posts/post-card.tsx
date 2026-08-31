import Image from "next/image";
import Link from "next/link";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { Post } from "@/payload-types";

type PostCardProps = {
  post: Pick<Post, "id" | "title" | "slug" | "heroImage">;
};

export function PostCard({ post }: PostCardProps) {
  const hero = typeof post.heroImage === "object" ? post.heroImage : null;

  return (
    <Link href={`/posts/${post.slug}`} className="group block">
      <AspectRatio
        ratio={4 / 3}
        className="overflow-hidden rounded-lg bg-muted"
      >
        {hero?.url ? (
          <Image
            src={hero.url}
            alt={hero.alt ?? post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : null}
      </AspectRatio>
      <h3 className="mt-4 text-lg font-medium leading-snug text-foreground">
        {post.title}
      </h3>
    </Link>
  );
}

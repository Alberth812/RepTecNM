import type { Metadata } from "next";
import { getPayloadClient } from "@/lib/payload/getPayloadClient";
import { PostCard } from "@/components/posts/post-card";
import { PostsPagination } from "@/components/posts/posts-pagination";

export const metadata: Metadata = { title: "Blog" };

const POSTS_PER_PAGE = 9;

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const payload = await getPayloadClient();

  const { docs: posts, totalPages } = await payload.find({
    collection: "posts",
    page,
    limit: POSTS_PER_PAGE,
    sort: "-publishedAt",
    // Solo pedimos lo que la card muestra: título, slug y hero.
    select: { title: true, slug: true, heroImage: true },
    depth: 1, // necesario para que heroImage venga poblado (url, alt)
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="mb-10 text-3xl font-medium">Blog</h1>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">
          Todavía no hay posts publicados.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      <div className="mt-14">
        <PostsPagination
          currentPage={page}
          totalPages={totalPages}
          basePath="/posts"
        />
      </div>
    </div>
  );
}

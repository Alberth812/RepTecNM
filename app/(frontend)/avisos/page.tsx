import type { Metadata } from "next";

import { getPayloadClient } from "@/lib/payload/getPayloadClient";
import { NoticeCard } from "@/components/avisos/notice-card";
import { PostsPagination } from "@/components/posts/posts-pagination";

export const metadata: Metadata = {
  title: "Avisos",
};

const NOTICES_PER_PAGE = 10;

export default async function NoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const payload = await getPayloadClient();

  const {
    docs: notices,
    totalPages,
  } = await payload.find({
    collection: "notices",
    page,
    limit: NOTICES_PER_PAGE,
    sort: "-publishedAt",

    select: {
      title: true,
      slug: true,
      isImportant: true,
      expirationDate: true,
      publishedAt: true,
    },

    depth: 0,
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <header className="mb-10">
        <h1 className="text-3xl font-medium tracking-tight">
          Avisos
        </h1>

        <p className="mt-2 text-muted-foreground">
          Consulta las noticias y comunicados publicados por la organización.
        </p>
      </header>

      {notices.length === 0 ? (
        <div className="rounded-xl border bg-muted/30 px-6 py-12 text-center">
          <p className="text-muted-foreground">
            Todavía no hay avisos publicados.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))}
        </div>
      )}

      <div className="mt-14">
        <PostsPagination
          currentPage={page}
          totalPages={totalPages}
          basePath="/avisos"
        />
      </div>
    </div>
  );
}
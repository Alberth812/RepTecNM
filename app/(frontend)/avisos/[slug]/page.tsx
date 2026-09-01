import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";

import { LivePreviewListener } from "@/components/live-preview/refresh-route-on-save";
import { NoticeViewer } from "@/components/avisos/notice-viewer";
import {
  queryNoticeBySlug,
  queryNoticesForNavigation,
} from "@/payload/queries/avisos";

type Args = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: Args): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const notice = await queryNoticeBySlug(decodedSlug);

  if (!notice) {
    return {
      title: "Aviso no encontrado",
    };
  }

  return {
    title: notice.title,
  };
}

export default async function NoticePage({ params }: Args) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const { isEnabled: draft } = await draftMode();

  const notice = await queryNoticeBySlug(decodedSlug);

  if (!notice) {
    notFound();
  }

  const navigation = await queryNoticesForNavigation({
    currentSlug: notice.slug,
  });

  return (
    <>
      {draft ? <LivePreviewListener /> : null}

      <NoticeViewer
        notice={notice}
        previous={navigation.previous}
        next={navigation.next}
      />
    </>
  );
}
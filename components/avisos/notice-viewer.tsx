import { AlertCircle } from "lucide-react";
import { NoticeNavigation } from "./notice-navigation";
import { PostRichText } from "@/components/posts/post-rich-text";
import type { Notice } from "@/payload-types";

type NoticeViewerProps = {
  notice: Notice;
  previous?: {
    title: string;
    slug: string;
  } | null;
  next?: {
    title: string;
    slug: string;
  } | null;
};

export function NoticeViewer({
  notice,
  previous,
  next,
}: NoticeViewerProps) {
  const expirationDate = notice.expirationDate
    ? new Intl.DateTimeFormat("es-MX", {
        dateStyle: "long",
        timeZone: "America/Mexico_City",
      }).format(new Date(notice.expirationDate))
    : null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <NoticeNavigation previous={previous} next={next} />

      <header className="mb-10">
        {notice.isImportant ? (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            <AlertCircle className="size-4" />
            Aviso importante
          </div>
        ) : null}

        <h1 className="text-4xl font-medium leading-tight tracking-tight text-foreground md:text-5xl">
          {notice.title}
        </h1>

        {expirationDate ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Vigente hasta el {expirationDate}
          </p>
        ) : null}
      </header>

      <div className="prose prose-neutral max-w-none dark:prose-invert">
        <PostRichText content={notice.content} />
      </div>
    </article>
  );
}
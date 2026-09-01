import Link from "next/link";
import { AlertCircle, ArrowRight, CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import type { Notice } from "@/payload-types";
import { cn } from "@/lib/utils";

type NoticeCardProps = {
  notice: Pick<
    Notice,
    "title" | "slug" | "isImportant" | "expirationDate" | "publishedAt"
  >;
};

const MEXICO_TIME_ZONE = "America/Mexico_City";

function formatPublishedDate(date: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeZone: MEXICO_TIME_ZONE,
  }).format(new Date(date));
}

function formatExpirationDate(date: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeZone: MEXICO_TIME_ZONE,
  }).format(new Date(date));
}

export function NoticeCard({ notice }: NoticeCardProps) {
  const publishedDate = notice.publishedAt
    ? formatPublishedDate(notice.publishedAt)
    : null;

  const expirationDate = notice.expirationDate
    ? formatExpirationDate(notice.expirationDate)
    : null;

  return (
    <article className="group rounded-xl border bg-card p-5 transition-colors hover:bg-muted/30 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {notice.isImportant ? (
              <Badge variant="default" className="gap-1.5">
                <AlertCircle className="size-3.5" />
                Importante
              </Badge>
            ) : null}

            {publishedDate ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="size-3.5" />
                {publishedDate}
              </span>
            ) : null}
          </div>

          <h2 className="text-xl font-medium leading-snug tracking-tight">
            <Link
              href={`/avisos/${notice.slug}`}
              className="transition-colors hover:text-primary"
            >
              {notice.title}
            </Link>
          </h2>

          {notice.isImportant && expirationDate ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Vigente hasta el {expirationDate}
            </p>
          ) : null}
        </div>

        <Link
          href={`/avisos/${notice.slug}`}
          className={cn(
            buttonVariants({
              variant: "ghost",
              size: "sm",
            }),
            "shrink-0 self-start",
          )}
        >
          Leer aviso
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}

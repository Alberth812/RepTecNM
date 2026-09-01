import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NoticeNavigationProps = {
  previous?: {
    title: string;
    slug: string;
  } | null;
  next?: {
    title: string;
    slug: string;
  } | null;
};

export function NoticeNavigation({ previous, next }: NoticeNavigationProps) {
  if (!previous && !next) {
    return null;
  }

  return (
    <nav
      aria-label="Navegación entre avisos"
      className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-4"
    >
      {previous ? (
        <Link
          href={`/avisos/${previous.slug}`}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "min-w-0 justify-start",
          )}
        >
          <ChevronLeft className="size-4 shrink-0" />
          <span className="truncate">{previous.title}</span>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={`/avisos/${next.slug}`}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "min-w-0 justify-end",
          )}
        >
          <span className="truncate">{next.title}</span>
          <ChevronRight className="size-4 shrink-0" />
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}

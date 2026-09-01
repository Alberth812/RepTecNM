"use client";

import { useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, X } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

import { PostRichText } from "@/components/posts/post-rich-text";
import type { Notice } from "@/payload-types";
import { cn } from "@/lib/utils";

type ImportantNoticesModalProps = {
  notices: Notice[];
};

const MEXICO_TIME_ZONE = "America/Mexico_City";

function formatExpirationDate(expirationDate: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeZone: MEXICO_TIME_ZONE,
  }).format(new Date(expirationDate));
}

export function ImportantNoticesModal({ notices }: ImportantNoticesModalProps) {
  const [open, setOpen] = useState(notices.length > 0);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (notices.length === 0) {
    return null;
  }

  const notice = notices[currentIndex];

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < notices.length - 1;

  const expirationDate = notice.expirationDate
    ? formatExpirationDate(notice.expirationDate)
    : null;

  function goPrevious() {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }

  function goNext() {
    setCurrentIndex((index) => Math.min(index + 1, notices.length - 1));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-h-[90vh] overflow-hidden p-0 sm:max-w-3xl"
        showCloseButton={false}
      >
        <div className="flex max-h-[90vh] flex-col">
          {/* Barra superior */}
          <div className="flex shrink-0 items-center justify-between border-b px-5 py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertCircle className="size-4 text-primary" />
              <span>Avisos importantes</span>

              {notices.length > 1 ? (
                <span className="text-muted-foreground">
                  {currentIndex + 1} de {notices.length}
                </span>
              ) : null}
            </div>

            <DialogClose
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  size: "icon",
                }),
              )}
              aria-label="Cerrar"
            >
              <X className="size-4" />
            </DialogClose>
          </div>

          {/* Navegación */}
          {notices.length > 1 ? (
            <div className="flex shrink-0 items-center justify-between border-b px-3 py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={goPrevious}
                disabled={!hasPrevious}
              >
                <ChevronLeft className="size-4" />
                Anterior
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={goNext}
                disabled={!hasNext}
              >
                Siguiente
                <ChevronRight className="size-4" />
              </Button>
            </div>
          ) : null}

          {/* Contenido */}
          <div className="overflow-y-auto px-6 py-8">
            <DialogTitle className="text-2xl font-medium leading-tight sm:text-3xl">
              {notice.title}
            </DialogTitle>

            <DialogDescription className="mt-2">
              {expirationDate ? `Vigente hasta el ${expirationDate}` : null}
            </DialogDescription>

            <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
              <PostRichText content={notice.content} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

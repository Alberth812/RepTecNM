// components/avisos/avisos-modal.tsx
"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RichText } from "@/components/posts/rich-text";
import type { Aviso } from "@/payload-types";

const DISMISSED_KEY = "avisos:dismissed";

function readDismissed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DISMISSED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function persistDismissed(ids: string[]) {
  try {
    window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(ids));
  } catch {
    // localStorage puede fallar (incógnito, cuota llena, etc.); en el peor
    // caso el aviso se vuelve a mostrar la próxima vez, no es grave.
  }
}

function formatVence(expiresAt: string): string {
  const days = Math.ceil(
    (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  return days <= 1 ? "Vence hoy" : `Vence en ${days} días`;
}

type Props = {
  avisos: Array<Pick<Aviso, "id" | "title" | "content" | "expiresAt">>;
};

export function AvisosModal({ avisos }: Props) {
  const [pending, setPending] = useState<Props["avisos"]>([]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismissed = new Set(readDismissed());
    const remaining = avisos.filter(
      (aviso) => !dismissed.has(String(aviso.id)),
    );

    if (remaining.length > 0) {
      setPending(remaining);
      setOpen(true);
    }
    // Solo debe evaluarse una vez, con la lista resuelta en el servidor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = pending[index];

  const handleClose = () => {
    const dismissed = new Set(readDismissed());
    pending.forEach((aviso) => dismissed.add(String(aviso.id)));
    persistDismissed(Array.from(dismissed));
    setOpen(false);
  };

  if (!current) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose();
        else setOpen(next);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Importante
            </Badge>
            {current.expiresAt ? (
              <span className="text-xs text-muted-foreground">
                {formatVence(current.expiresAt)}
              </span>
            ) : null}
          </div>

          <DialogTitle className="text-xl">{current.title}</DialogTitle>

          {pending.length > 1 ? (
            <DialogDescription>
              Aviso {index + 1} de {pending.length}
            </DialogDescription>
          ) : null}
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <RichText content={current.content} />
        </ScrollArea>

        {pending.length > 1 ? (
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Anterior
            </Button>

            <Button
              variant="ghost"
              size="sm"
              disabled={index === pending.length - 1}
              onClick={() =>
                setIndex((i) => Math.min(pending.length - 1, i + 1))
              }
            >
              Siguiente
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
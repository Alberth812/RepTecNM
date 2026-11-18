// @/components/admin/afiliados/quitar-suspension-dialog.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuitarSuspensionAfiliadoMutation } from "@/lib/hooks/use-afiliados";
import type { ApiClientError } from "@/lib/api/client/afiliados";

interface QuitarSuspensionDialogProps {
  userId: string;
  nombreCompleto: string;
  motivoSuspension: string | null;
}

export function QuitarSuspensionDialog({
  userId,
  nombreCompleto,
  motivoSuspension,
}: QuitarSuspensionDialogProps) {
  const [open, setOpen] = useState(false);
  const mutation = useQuitarSuspensionAfiliadoMutation(userId);

  function onConfirm() {
    mutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Se quitó la suspensión del afiliado.");
        setOpen(false);
      },
      onError: (error) => {
        toast.error(
          (error as ApiClientError).message ??
            "No se pudo quitar la suspensión.",
        );
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>
        Quitar suspensión
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quitar suspensión</DialogTitle>
          <DialogDescription>
            {nombreCompleto || "Este afiliado"} recuperará el acceso a la
            plataforma. Revisa el motivo por el que fue suspendido antes de
            continuar.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border bg-muted/40 p-3 text-sm">
          <p className="mb-1 font-medium text-foreground">
            Motivo de la suspensión
          </p>
          <p className="whitespace-pre-wrap text-muted-foreground">
            {motivoSuspension || "No se registró un motivo."}
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Quitando suspensión…" : "Quitar suspensión"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// @/components/admin/afiliados/suspender-afiliado-dialog.tsx
"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  suspenderAfiliadoBodySchema,
  type SuspenderAfiliadoBody,
} from "@/lib/validations/afiliados";
import { useSuspenderAfiliadoMutation } from "@/lib/hooks/use-afiliados";
import type { ApiClientError } from "@/lib/api/client/afiliados";

interface SuspenderAfiliadoDialogProps {
  userId: string;
  nombreCompleto: string;
}

export function SuspenderAfiliadoDialog({
  userId,
  nombreCompleto,
}: SuspenderAfiliadoDialogProps) {
  const [open, setOpen] = useState(false);
  const mutation = useSuspenderAfiliadoMutation(userId);

  const form = useForm<SuspenderAfiliadoBody>({
    resolver: zodResolver(suspenderAfiliadoBodySchema),
    defaultValues: { motivo: "" },
  });

  function onOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) form.reset();
  }

  function onSubmit(values: SuspenderAfiliadoBody) {
    mutation.mutate(values.motivo, {
      onSuccess: () => {
        toast.success("Afiliado suspendido correctamente.");
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(
          (error as ApiClientError).message ??
            "No se pudo suspender al afiliado.",
        );
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger /*asChild*/>
        <Button variant="destructive">Suspender</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Suspender afiliado</DialogTitle>
            <DialogDescription>
              {nombreCompleto || "Este afiliado"} dejará de tener acceso a la
              plataforma y se cerrarán todas sus sesiones activas. Esta acción
              puede revertirse más adelante.
            </DialogDescription>
          </DialogHeader>

          <Field className="py-2">
            <FieldLabel htmlFor="motivo">Motivo de la suspensión</FieldLabel>
            <Controller
              control={form.control}
              name="motivo"
              render={({ field }) => (
                <Textarea
                  id="motivo"
                  placeholder="Describe el motivo de la suspensión (10 a 500 caracteres)"
                  rows={4}
                  {...field}
                />
              )}
            />
            <FieldDescription>Entre 10 y 500 caracteres.</FieldDescription>
            {form.formState.errors.motivo && (
              <FieldError>{form.formState.errors.motivo.message}</FieldError>
            )}
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Suspendiendo…" : "Suspender afiliado"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

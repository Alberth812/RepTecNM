// Ubicación sugerida: @/lib/components/instituciones/institucion-delete-dialog.tsx

"use client";

import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteInstitucionMutation } from "@/lib/instituciones/hooks/use-instituciones";
import { ApiRequestError } from "@/lib/api/instituciones-client";
import type { Institucion } from "@/lib/instituciones/types";

interface InstitucionDeleteDialogProps {
  institucion: Institucion | null;
  onOpenChange: (open: boolean) => void;
  onConflict: (id: string) => void;
}

export function InstitucionDeleteDialog({
  institucion,
  onOpenChange,
  onConflict,
}: InstitucionDeleteDialogProps) {
  const deleteMutation = useDeleteInstitucionMutation();

  function handleConfirm() {
    if (!institucion) return;

    deleteMutation.mutate(institucion.id, {
      onSuccess: () => onOpenChange(false),
      onError: (error) => {
        if (error instanceof ApiRequestError && error.status === 409) {
          toast.error(
            "No se puede eliminar la institución porque existen registros asociados.",
          );
          // Optimización de UX: deshabilita el botón de eliminar para esta
          // institución durante la sesión actual. El servidor sigue siendo
          // la autoridad y vuelve a validar la restricción en cada intento.
          onConflict(institucion.id);
          onOpenChange(false);
          return;
        }

        toast.error(
          error instanceof ApiRequestError
            ? error.message
            : "No se pudo eliminar la institución.",
        );
      },
    });
  }

  return (
    <AlertDialog
      open={institucion !== null}
      onOpenChange={(open) => {
        if (!deleteMutation.isPending) onOpenChange(open);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar institución?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará permanentemente la institución
            {institucion ? ` "${institucion.nombre}"` : ""}. Esta acción no se
            puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              handleConfirm();
            }}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// components/admin/toggle-admin-status-dialog.tsx
//
// Un mismo componente implementa tanto el modal de "activación" como el de
// "desactivación": ambos comparten exactamente la misma estructura de
// confirmación y solo cambian el texto y el endpoint que se llama (vía
// useToggleAdminStatusMutation(action)). Se parametriza con `action` en
// lugar de duplicar el componente para no repetir lógica.

"use client";

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
import { useToggleAdminStatusMutation } from "@/lib/admins/hooks/use-admins";
import type { AdminListItem } from "@/lib/admins/types";

interface ToggleAdminStatusDialogProps {
  admin: AdminListItem | null;
  action: "activate" | "deactivate";
  onOpenChange: (open: boolean) => void;
}

const COPY = {
  activate: {
    title: "Activar administrador",
    description: (name: string) =>
      `¿Deseas activar a ${name}? Podrá iniciar sesión nuevamente.`,
    confirmLabel: "Activar",
    pendingLabel: "Activando...",
  },
  deactivate: {
    title: "Desactivar administrador",
    description: (name: string) =>
      `¿Deseas desactivar a ${name}? Se cerrarán todas sus sesiones activas de inmediato.`,
    confirmLabel: "Desactivar",
    pendingLabel: "Desactivando...",
  },
} as const;

export function ToggleAdminStatusDialog({
  admin,
  action,
  onOpenChange,
}: ToggleAdminStatusDialogProps) {
  const toggleMutation = useToggleAdminStatusMutation(action);
  const copy = COPY[action];

  return (
    <AlertDialog
      open={admin !== null}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onOpenChange(false);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{copy.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {admin ? copy.description(admin.nombreCompleto) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={toggleMutation.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={toggleMutation.isPending}
            className={
              action === "deactivate"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : undefined
            }
            onClick={(event) => {
              event.preventDefault();
              if (!admin) return;
              toggleMutation.mutate(admin.userId, {
                onSuccess: () => onOpenChange(false),
              });
            }}
          >
            {toggleMutation.isPending ? copy.pendingLabel : copy.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

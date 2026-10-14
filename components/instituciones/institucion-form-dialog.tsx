// Ubicación sugerida: @/lib/components/instituciones/institucion-form-dialog.tsx

"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";
import {
 useCreateInstitucionMutation,
 useUpdateInstitucionMutation,
} from "@/lib/instituciones/hooks/use-instituciones";
import {
 createInstitucionSchema,
 updateInstitucionSchema,
} from "@/lib/validation/instituciones";
import type { Institucion } from "@/lib/instituciones/types";

type FormDialogState =
 | { mode: "create" }
 | { mode: "edit"; institucion: Institucion }
 | null;

interface InstitucionFormDialogProps {
 state: FormDialogState;
 onOpenChange: (open: boolean) => void;
}

export function InstitucionFormDialog({
 state,
 onOpenChange,
}: InstitucionFormDialogProps) {
 const isEdit = state?.mode === "edit";

 const [nombre, setNombre] = useState("");
 const [estado, setEstado] = useState<"ACTIVO" | "INACTIVO">("ACTIVO");
 const [errors, setErrors] = useState<{ nombre?: string }>({});

 const createMutation = useCreateInstitucionMutation();
 const updateMutation = useUpdateInstitucionMutation();

 const isSubmitting = createMutation.isPending || updateMutation.isPending;

 // Sincroniza el formulario cada vez que se abre el diálogo (crear o editar).
 useEffect(() => {
 if (state?.mode === "edit") {
 setNombre(state.institucion.nombre);
 setEstado(state.institucion.estado);
 } else if (state?.mode === "create") {
 setNombre("");
 setEstado("ACTIVO");
 }
 setErrors({});
 }, [state]);

 function handleSubmit(event: FormEvent) {
 event.preventDefault();
 if (isSubmitting || !state) return;

 if (isEdit) {
 const result = updateInstitucionSchema.safeParse({ nombre, estado });
 if (!result.success) {
 setErrors({ nombre: result.error.flatten().fieldErrors.nombre?.[0] });
 return;
 }

 updateMutation.mutate(
 { id: state.institucion.id, input: result.data },
 { onSuccess: () => onOpenChange(false) },
 );
 return;
 }

 const result = createInstitucionSchema.safeParse({ nombre });
 if (!result.success) {
 setErrors({ nombre: result.error.flatten().fieldErrors.nombre?.[0] });
 return;
 }

 createMutation.mutate(result.data, {
 onSuccess: () => onOpenChange(false),
 });
 }

 return (
 <Dialog
 open={state !== null}
 onOpenChange={(open) => {
 if (!isSubmitting) onOpenChange(open);
 }}
 >
 <DialogContent>
 <form onSubmit={handleSubmit}>
 <DialogHeader>
 <DialogTitle>
 {isEdit ? "Modificar institución" : "Añadir nueva institución"}
 </DialogTitle>
 <DialogDescription>
 {isEdit
 ? "Actualiza el nombre o el estado de la institución."
 : "Ingresa el nombre de la nueva institución (entre 10 y 50 caracteres)."}
 </DialogDescription>
 </DialogHeader>

 <div className="grid gap-4 py-4">
 <div className="grid gap-2">
 <Label htmlFor="nombre">Nombre</Label>
 <Input
 id="nombre"
 value={nombre}
 onChange={(event) => setNombre(event.target.value)}
 placeholder="Nombre de la institución"
 disabled={isSubmitting}
 maxLength={50}
 aria-invalid={Boolean(errors.nombre)}
 />
 {errors.nombre && (
 <p className="text-sm text-destructive">{errors.nombre}</p>
 )}
 </div>

 {isEdit && (
 <div className="grid gap-2">
 <Label htmlFor="estado">Estado</Label>
 <Select
 value={estado}
 onValueChange={(value) =>
 setEstado(value as "ACTIVO" | "INACTIVO")
 }
 disabled={isSubmitting}
 >
 <SelectTrigger id="estado">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="ACTIVO">Activo</SelectItem>
 <SelectItem value="INACTIVO">Inactivo</SelectItem>
 </SelectContent>
 </Select>
 </div>
 )}
 </div>

 <DialogFooter>
 <Button
 type="button"
 variant="outline"
 onClick={() => onOpenChange(false)}
 disabled={isSubmitting}
 >
 Cancelar
 </Button>
 <Button type="submit" disabled={isSubmitting}>
 {isSubmitting ? "Guardando..." : "Guardar"}
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>
 );
}

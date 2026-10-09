// components/admin/create-admin-dialog.tsx

"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateAdminMutation } from "@/lib/admins/hooks/use-admins";
import { ADMIN_SUBTYPES } from "@/lib/constants";
// Se reutiliza tal cual el schema que ya valida el endpoint POST
// /api/admin/create (nombre, email, password, subtype). No se duplican
// reglas de validación en el frontend.
import { createAdminSchema } from "@/lib/validation/schemas";

type CreateAdminFormValues = z.infer<typeof createAdminSchema>;

const SUBTYPE_LABELS: Record<CreateAdminFormValues["subtype"], string> = {
  [ADMIN_SUBTYPES.GENERAL]: "General",
  [ADMIN_SUBTYPES.CONTENIDO]: "Contenido",
};

const items = Object.values(ADMIN_SUBTYPES).map((value) => ({
  label: SUBTYPE_LABELS[value],
  value,
}));

export function CreateAdminDialog() {
  const [open, setOpen] = useState(false);
  const createAdminMutation = useCreateAdminMutation();

  const form = useForm<CreateAdminFormValues>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      subtype: ADMIN_SUBTYPES.CONTENIDO,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    createAdminMutation.mutate(values, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) form.reset();
      }}
    >
      <DialogTrigger render={<Button />}>
        Agregar nuevo administrador
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar nuevo administrador</DialogTitle>
          <DialogDescription>
            Se enviará un correo de bienvenida a la dirección indicada. La
            cuenta queda con el correo verificado desde su creación.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <FieldGroup>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor={field.name}>Nombre completo</FieldLabel>
                  <Input
                    id={field.name}
                    autoComplete="name"
                    aria-invalid={fieldState.invalid || undefined}
                    {...field}
                  />
                  {fieldState.error ? (
                    <FieldError>{fieldState.error.message}</FieldError>
                  ) : null}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="subtype"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor={field.name}>Subtipo</FieldLabel>
                  <Select
                    items={items}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder="Selecciona un subtipo" />
                    </SelectTrigger>

                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error ? (
                    <FieldError>{fieldState.error.message}</FieldError>
                  ) : null}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor={field.name}>
                    Correo electrónico
                  </FieldLabel>
                  <Input
                    id={field.name}
                    type="email"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid || undefined}
                    {...field}
                  />
                  {fieldState.error ? (
                    <FieldError>{fieldState.error.message}</FieldError>
                  ) : null}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor={field.name}>Contraseña</FieldLabel>
                  <Input
                    id={field.name}
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid || undefined}
                    {...field}
                  />
                  {fieldState.error ? (
                    <FieldError>{fieldState.error.message}</FieldError>
                  ) : null}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createAdminMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createAdminMutation.isPending}>
              {createAdminMutation.isPending
                ? "Creando..."
                : "Crear administrador"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

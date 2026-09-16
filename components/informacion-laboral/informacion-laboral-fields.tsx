// @/components/informacion-laboral/informacion-laboral-fields.tsx
//
// Primitivas de campo reutilizables para la Sección 3. Todas usan
// <Controller /> (el patrón recomendado por shadcn/ui para el componente
// Field, ver https://ui.shadcn.com/docs/forms/react-hook-form) para poder
// controlar Checkbox/RadioGroup, que no exponen un <input> nativo compatible
// con `register`.

"use client";

import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MESES_OPTIONS } from "./informacion-laboral-options";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";

import type { SelectOption } from "./informacion-laboral-options";

/* -------------------------------------------------------------------------- */
/* Detalle "Otro" inline                                                     */
/* -------------------------------------------------------------------------- */

interface OtroDetailFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
}

function OtroDetailField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label = "Especifique",
}: OtroDetailFieldProps<TFieldValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="mt-3 max-w-sm">
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>

          <Input
            id={field.name}
            {...field}
            value={
              typeof field.value === "string"
                ? field.value
                : field.value == null
                  ? ""
                  : String(field.value)
            }
            aria-invalid={fieldState.invalid}
          />

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Selección múltiple (checkbox)                                             */
/* -------------------------------------------------------------------------- */

interface CheckboxGroupFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  otroName?: FieldPath<TFieldValues>;
  otroLabel?: string;
  legend: string;
  description?: string;
  options: SelectOption[];
  disabled?: boolean;
}

export function CheckboxGroupField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  otroName,
  otroLabel,
  legend,
  description,
  options,
  disabled,
}: CheckboxGroupFieldProps<TFieldValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selected: string[] = Array.isArray(field.value)
          ? field.value.filter(
              (value: unknown): value is string => typeof value === "string",
            )
          : [];

        const toggle = (value: string, checked: boolean) => {
          const next = checked
            ? [...selected, value]
            : selected.filter((v) => v !== value);

          field.onChange(next);
        };

        const otroOption = options.find((o) => o.requiresDetail);

        const showOtro = Boolean(
          otroName && otroOption && selected.includes(otroOption.value),
        );

        return (
          <FieldSet data-invalid={fieldState.invalid}>
            <FieldLegend variant="label">{legend}</FieldLegend>

            {description && <FieldDescription>{description}</FieldDescription>}

            <FieldGroup>
              {options.map((option) => {
                const id = `${field.name}-${option.value}`;

                return (
                  <Field key={option.value} orientation="horizontal">
                    <Checkbox
                      id={id}
                      checked={selected.includes(option.value)}
                      disabled={disabled}
                      onCheckedChange={(checked) =>
                        toggle(option.value, checked === true)
                      }
                    />

                    <FieldLabel htmlFor={id} className="font-normal">
                      {option.label}
                    </FieldLabel>
                  </Field>
                );
              })}
            </FieldGroup>

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}

            {showOtro && otroName && (
              <OtroDetailField
                control={control}
                name={otroName}
                label={otroLabel}
              />
            )}
          </FieldSet>
        );
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Selección única (radio)                                                   */
/* -------------------------------------------------------------------------- */

interface RadioOptionsFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  otroName?: FieldPath<TFieldValues>;
  otroLabel?: string;
  legend: string;
  description?: string;
  options: SelectOption[];
  disabled?: boolean;
}

export function RadioOptionsField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  otroName,
  otroLabel,
  legend,
  description,
  options,
  disabled,
}: RadioOptionsFieldProps<TFieldValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const fieldValue = typeof field.value === "string" ? field.value : "";

        const otroOption = options.find((o) => o.requiresDetail);

        const showOtro = Boolean(
          otroName && otroOption && fieldValue === otroOption.value,
        );

        return (
          <FieldSet data-invalid={fieldState.invalid}>
            <FieldLegend variant="label">{legend}</FieldLegend>

            {description && <FieldDescription>{description}</FieldDescription>}

            <RadioGroup
              value={fieldValue}
              onValueChange={field.onChange}
              disabled={disabled}
            >
              <FieldGroup>
                {options.map((option) => {
                  const id = `${field.name}-${option.value}`;

                  return (
                    <Field key={option.value} orientation="horizontal">
                      <RadioGroupItem value={option.value} id={id} />

                      <FieldLabel htmlFor={id} className="font-normal">
                        {option.label}
                      </FieldLabel>
                    </Field>
                  );
                })}
              </FieldGroup>
            </RadioGroup>

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}

            {showOtro && otroName && (
              <OtroDetailField
                control={control}
                name={otroName}
                label={otroLabel}
              />
            )}
          </FieldSet>
        );
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Booleano Sí/No                                                            */
/* -------------------------------------------------------------------------- */

interface BooleanRadioFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function BooleanRadioField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  disabled,
}: BooleanRadioFieldProps<TFieldValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={`${field.name}-si`}>{label}</FieldLabel>

          {description && <FieldDescription>{description}</FieldDescription>}

          <RadioGroup
            className="flex flex-row gap-6"
            disabled={disabled}
            value={
              field.value === true ? "si" : field.value === false ? "no" : ""
            }
            onValueChange={(value) => field.onChange(value === "si")}
          >
            <Field orientation="horizontal" className="w-auto">
              <RadioGroupItem value="si" id={`${field.name}-si`} />

              <FieldLabel htmlFor={`${field.name}-si`} className="font-normal">
                Sí
              </FieldLabel>
            </Field>

            <Field orientation="horizontal" className="w-auto">
              <RadioGroupItem value="no" id={`${field.name}-no`} />

              <FieldLabel htmlFor={`${field.name}-no`} className="font-normal">
                No
              </FieldLabel>
            </Field>
          </RadioGroup>

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

interface MesSelectProps {
  id: string;
  name: string;
  value: number | null | undefined;
  onChange: (value: number | undefined) => void;
  onBlur: () => void;
  ref?: React.Ref<HTMLButtonElement>;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  invalid?: boolean;
}

export function MesSelect({
  id,
  name,
  value,
  onChange,
  onBlur,
  ref,
  invalid,
  ...aria
}: MesSelectProps) {
  return (
    <Select
      items={MESES_OPTIONS}
      value={value != null ? String(value) : null}
      onValueChange={(value) => {
        onChange(value === null ? undefined : Number(value));
      }}
    >
      <SelectTrigger
        id={id}
        name={name}
        ref={ref}
        onBlur={onBlur}
        aria-invalid={invalid}
        {...aria}
      >
        <SelectValue placeholder="Selecciona mes" />
      </SelectTrigger>

      <SelectContent>
        {MESES_OPTIONS.map((mes) => (
          <SelectItem key={mes.value} value={mes.value}>
            {mes.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

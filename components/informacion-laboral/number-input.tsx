// @/components/ui/number-input.tsx
"use client";

import { forwardRef, useMemo } from "react";

import { Input } from "@/components/ui/input";

type BaseInputProps = Omit<
 React.ComponentProps<typeof Input>,
 "value" | "onChange" | "type" | "min" | "max"
>;

interface NumberInputProps extends BaseInputProps {
 value: number | undefined;
 onChange: (value: number | undefined) => void;
 min?: number;
 max?: number;
 decimal?: boolean;
 maxDigits?: number;
 allowNegative?: boolean;
 clampOnBlur?: boolean;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
 function NumberInput(
 {
 value,
 onChange,
 min,
 max,
 decimal = false,
 maxDigits,
 allowNegative = false,
 clampOnBlur = true,
 onBlur,
 ...props
 },
 ref,
 ) {
 const pattern = useMemo(() => {
 const sign = allowNegative ? "-?" : "";
 return decimal
 ? new RegExp(`^${sign}\\d*\\.?\\d*$`)
 : new RegExp(`^${sign}\\d*$`);
 }, [decimal, allowNegative]);

 return (
 <Input
 {...props}
 ref={ref}
 type="text"
 inputMode={decimal ? "decimal" : "numeric"}
 autoComplete="off"
 value={value ?? ""}
 onChange={(event) => {
 const raw = event.target.value;

 if (raw === "") {
 onChange(undefined);
 return;
 }

 if (!pattern.test(raw)) return;

 if (maxDigits && raw.replace(/[-.]/g, "").length > maxDigits) return;

 const num = Number(raw);

 if (max !== undefined && num > max) return;

 onChange(num);
 }}
 onBlur={(event) => {
 if (clampOnBlur && value !== undefined) {
 let next = value;
 if (min !== undefined && next < min) next = min;
 if (max !== undefined && next > max) next = max;
 if (next !== value) onChange(next);
 }

 onBlur?.(event);
 }}
 />
 );
 },
);

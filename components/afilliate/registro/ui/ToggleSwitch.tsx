"use client";

import { cn } from "@/lib/registro/cn";

interface ToggleSwitchProps {
 label: string;
 description?: string;
 checked: boolean;
 onChange: (checked: boolean) => void;
}

/** Interruptor para los campos `type: "boolean"` del esquema. */
export default function ToggleSwitch({ label, description, checked, onChange }: ToggleSwitchProps) {
 return (
 <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3.5">
 <span className="space-y-0.5">
 <span className="block text-sm font-medium text-slate-800">{label}</span>
 {description && <span className="block text-xs text-slate-500">{description}</span>}
 </span>
 <span className="relative inline-flex shrink-0 items-center">
 <input
 type="checkbox"
 checked={checked}
 onChange={(e) => onChange(e.target.checked)}
 className="peer sr-only"
 />
 <span
 className={cn(
 "h-6 w-11 rounded-full transition-colors",
 checked ? "bg-[#004B87]" : "bg-slate-300"
 )}
 />
 <span
 className={cn(
 "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
 checked && "translate-x-5"
 )}
 />
 </span>
 </label>
 );
}

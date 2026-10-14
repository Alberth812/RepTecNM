import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs));
}

/** Formatea bytes como "1.2 MB", "480 KB", etc. */
export function formatBytes(bytes: number): string {
 if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

 const units = ["B", "KB", "MB", "GB"] as const;
 const exponent = Math.min(
 Math.floor(Math.log(bytes) / Math.log(1024)),
 units.length - 1,
 );
 const value = bytes / 1024 ** exponent;

 return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`;
}

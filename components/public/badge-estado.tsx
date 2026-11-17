"use client";

export function BadgeEstado({ estado }: { estado: string }) {
  const estilos =
    estado === "ACTIVO"
      ? "bg-green-500/15 text-green-700 dark:text-green-400"
      : estado === "BAJA"
        ? "bg-red-500/15 text-red-700 dark:text-red-400"
        : "bg-amber-500/15 text-amber-700 dark:text-amber-400";
  return (
    <span className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${estilos}`}>
      {estado}
    </span>
  );
}

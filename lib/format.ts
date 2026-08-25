// lib/format.ts
export function formatNombreCompleto(persona: {
  nombres: string | null;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;
}): string {
  return (
    [persona.nombres, persona.apellidoPaterno, persona.apellidoMaterno]
      .filter(Boolean)
      .join(" ") || "Sin nombre"
  );
}

export function formatFecha(iso: string): string {
  return new Date(iso).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const unidades = ["KB", "MB", "GB"];
  let valor = bytes;
  let i = -1;
  do {
    valor /= 1024;
    i++;
  } while (valor >= 1024 && i < unidades.length - 1);
  return `${valor.toFixed(1)} ${unidades[i]}`;
}
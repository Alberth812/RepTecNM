export type Mensaje = {
  id: string;
  motivo: string;
  contenido: string;
  leido: boolean;
  createdAt: string;
  // Para mensajes recibidos:
  remitenteNombre?: string;
  remitenteEmail?: string;
  nombreParaRespuesta?: string;
  correoParaRespuesta?: string;
  telefonoParaRespuesta?: string;
  // Para mensajes enviados:
  destinatarioNombre?: string;
  destinatarioEmail?: string;
};

export async function cargarMensajes(tipo: "recibidos" | "enviados" = "recibidos"): Promise<Mensaje[]> {
  try {
    const res = await fetch(`/api/mensajes?tipo=${tipo}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Error al cargar mensajes");
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Error cargando mensajes:", error);
    return [];
  }
}

export async function marcarLeido(id: string) {
  try {
    const res = await fetch(`/api/mensajes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "leido" }),
    });
    return res.ok;
  } catch (error) {
    console.error("Error marcando como leído:", error);
    return false;
  }
}

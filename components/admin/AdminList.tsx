"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, LinkButton, Spinner } from "@/components/ui/primitives";

type AdminRow = {
  id: string;
  nombreCompleto: string;
  email: string;
  subtype: "GENERAL" | "CONTENIDO";
  isRoot: boolean;
};

type CurrentAdmin = {
  id: string;
  subtype: "GENERAL" | "CONTENIDO";
  isRoot: boolean;
};

const SUBTYPE_LABEL: Record<AdminRow["subtype"], string> = {
  GENERAL: "General",
  CONTENIDO: "Contenido",
};

function canDelete(target: AdminRow, current: CurrentAdmin): boolean {
  if (target.id === current.id) return false;
  if (target.isRoot) return false;
  if (target.subtype === "GENERAL") return current.isRoot;
  return current.subtype === "GENERAL"; // target.subtype === "CONTENIDO"
}

export function AdminList({ current, refreshKey }: { current: CurrentAdmin; refreshKey: number }) {
  const [admins, setAdmins] = useState<AdminRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/admins");
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setError(data?.error ?? "No se pudo cargar la lista de administradores.");
      return;
    }
    setAdmins(data.admins);
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  async function handleDelete(target: AdminRow) {
    if (!confirm(`¿Eliminar la cuenta de administrador de ${target.email}? Esta acción no se puede deshacer.`)) {
      return;
    }
    setDeletingId(target.id);
    setError(null);

    const res = await fetch(`/api/admins/${target.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);

    setDeletingId(null);

    if (!res.ok) {
      setError(data?.error ?? "No se pudo eliminar la cuenta.");
      return;
    }

    load();
  }

  if (error) return <Alert kind="error">{error}</Alert>;
  if (!admins) {
    return (
      <div className="flex items-center gap-2 text-sm text-brand-500">
        <Spinner /> Cargando…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-sand-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-sand-50 text-xs font-semibold uppercase tracking-wide text-brand-500">
          <tr>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Correo</th>
            <th className="px-4 py-3">Subtipo</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-200">
          {admins.map((a) => (
            <tr key={a.id}>
              <td className="px-4 py-3 text-brand-900">
                {a.nombreCompleto}
                {a.isRoot ? (
                  <span className="ml-2 rounded-full bg-gold-400/15 px-2 py-0.5 text-xs font-semibold text-gold-600">
                    Raíz
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3 text-brand-700">{a.email}</td>
              <td className="px-4 py-3 text-brand-700">{SUBTYPE_LABEL[a.subtype]}</td>
              <td className="px-4 py-3 text-right">
                {canDelete(a, current) ? (
                  <LinkButton
                    type="button"
                    onClick={() => handleDelete(a)}
                    disabled={deletingId === a.id}
                    className="text-red-700"
                  >
                    {deletingId === a.id ? "Eliminando…" : "Eliminar"}
                  </LinkButton>
                ) : (
                  <span className="text-xs text-brand-300">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

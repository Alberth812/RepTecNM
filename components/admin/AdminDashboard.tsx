"use client";

import { useState } from "react";
import { AdminList } from "./AdminList";
import { CreateAdminForm } from "./CreateAdminForm";

type CurrentAdmin = { id: string; subtype: "GENERAL" | "CONTENIDO"; isRoot: boolean };

export function AdminDashboard({ current }: { current: CurrentAdmin }) {
 const [refreshKey, setRefreshKey] = useState(0);

 return (
 <div className="flex flex-col gap-8">
 {current.subtype === "GENERAL" ? (
 <section className="rounded-2xl border border-sand-200 bg-white p-8 shadow-sm">
 <h2 className="text-lg font-bold text-brand-900">Nueva cuenta de administrador</h2>
 <p className="mt-1 text-sm text-brand-500">RF-AUTH-013. Solo administradores GENERAL pueden crear cuentas.</p>
 <div className="mt-6">
 <CreateAdminForm onCreated={() => setRefreshKey((k) => k + 1)} />
 </div>
 </section>
 ) : null}

 <section className="rounded-2xl border border-sand-200 bg-white p-8 shadow-sm">
 <h2 className="text-lg font-bold text-brand-900">Administradores</h2>
 <p className="mt-1 text-sm text-brand-500">RF-AUTH-014. Los permisos de eliminación dependen de tu subtipo.</p>
 <div className="mt-6">
 <AdminList current={current} refreshKey={refreshKey} />
 </div>
 </section>
 </div>
 );
}

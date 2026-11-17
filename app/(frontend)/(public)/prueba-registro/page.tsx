import type { Metadata } from "next";
import RegistroForm from "@/components/afilliate/registro/RegistroForm";

export const metadata: Metadata = {
 title: "Registro de Afiliado · REP TecNM",
 description:
 "Formulario de registro para la Red de Egresados de Posgrado del TecNM",
};

export default function RegistroPage() {
 return (
 <main className="min-h-screen bg-slate-50 px-4 py-10 sm:py-14">
 <div className="mx-auto mb-8 max-w-2xl text-center">
 <p className="text-xs font-semibold uppercase tracking-wide text-[#004B87]">
 REP TecNM
 </p>
 <h1 className="mt-1 font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
 Registro de Afiliado
 </h1>
 <p className="mt-2 text-sm text-slate-500">
 Red de Egresados de Posgrado del Tecnológico Nacional de México
 </p>
 </div>
 <RegistroForm />
 </main>
 );
}

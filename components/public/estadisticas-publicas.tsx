"use client";

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const POR_AREA = [
  { name: "Ingeniería", total: 420 },
  { name: "Económico-Adm.", total: 310 },
  { name: "Salud", total: 180 },
  { name: "Educación", total: 150 },
  { name: "Agropecuarias", total: 120 },
  { name: "Arquitectura", total: 68 },
];

const POR_PROGRAMA = [
  { name: "Maestría", value: 890 },
  { name: "Doctorado", value: 358 },
];

const POR_ENTIDAD = [
  { name: "CDMX", total: 210 },
  { name: "Nuevo León", total: 180 },
  { name: "Guanajuato", total: 150 },
  { name: "Yucatán", total: 120 },
  { name: "Baja California", total: 100 },
  { name: "Oaxaca", total: 90 },
];

const POR_ACTIVIDAD = [
  { name: "Académica", total: 520 },
  { name: "Empresarial", total: 280 },
  { name: "Independiente", total: 190 },
  { name: "Gubernamental", total: 160 },
  { name: "Otra", total: 98 },
];

const AZULES = ["#004B87", "#2E7CC4", "#7FB2E5", "#0A2E52", "#5A9BD8", "#BBD4EE"];

export function EstadisticasPublicas() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <h2 className="font-serif text-3xl font-bold tracking-tight">La red en números</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Información agregada de la comunidad. Ninguna estadística permite identificar
          a una persona (RF-DASH-007).
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Área de conocimiento</CardTitle>
            <CardDescription>Afiliados activos por área</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={POR_AREA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#004B87" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Programa de posgrado</CardTitle>
            <CardDescription>Maestría frente a Doctorado</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={POR_PROGRAMA} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                  {POR_PROGRAMA.map((_, i) => (
                    <Cell key={i} fill={AZULES[i]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entidad federativa</CardTitle>
            <CardDescription>Principales entidades de residencia</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={POR_ENTIDAD}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#2E7CC4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad profesional</CardTitle>
            <CardDescription>Tipo de actividad de los afiliados</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={POR_ACTIVIDAD}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#0A2E52" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 rounded-2xl bg-[#27518F] p-6 text-center text-white">
        <p className="text-3xl font-bold">18%</p>
        <p className="mt-1 text-sm text-sky-100/80">
          de los afiliados pertenece al Sistema Nacional de Investigadores (SNI)
        </p>
      </div>
    </section>
  );
}

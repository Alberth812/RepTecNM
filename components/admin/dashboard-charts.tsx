"use client";

import {
 ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
 CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { distribucionArea, distribucionPosgrado } from "@/lib/mock/dashboard";

const COLORS = ["#004B87", "#2E7CC4", "#7FB2E5", "#0A2E52"];

export function DashboardCharts() {
 return (
 <div className="grid gap-4 md:grid-cols-2">
 <Card>
 <CardHeader>
 <CardTitle>Afiliados por área de conocimiento</CardTitle>
 <CardDescription>Distribución de egresados activos (RF-DASH-002)</CardDescription>
 </CardHeader>
 <CardContent className="h-72">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={distribucionArea}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} />
 <XAxis dataKey="area" tick={{ fontSize: 11 }} />
 <YAxis />
 <Tooltip />
 <Bar dataKey="total" fill="#004B87" radius={[4, 4, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle>Nivel de posgrado</CardTitle>
 <CardDescription>Maestría frente a Doctorado</CardDescription>
 </CardHeader>
 <CardContent className="h-72">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie data={distribucionPosgrado} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
 {distribucionPosgrado.map((_, i) => (
 <Cell key={i} fill={COLORS[i]} />
 ))}
 </Pie>
 <Legend />
 <Tooltip />
 </PieChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>
 </div>
 );
}
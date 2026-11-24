// @/components/admin/estadisticas/afiliados-charts.tsx

"use client";

import type { ReactNode } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type {
  DistributionItem,
  TrendItem,
} from "@/lib/estadisticas/afiliados-dashboard";

const CHART_COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#a855f7",
  "#ec4899",
  "#0891b2",
  "#ea580c",
  "#64748b",
  "#84cc16",
  "#6366f1",
  "#d946ef",
  "#0d9488",
];

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>{title}</CardTitle>

        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
  );
}

/**
 * Gráfica de pastel para distribuciones.
 */
export function DistributionPieCard({
  title,
  description,
  data,
}: {
  title: string;
  description?: string;
  data: DistributionItem[];
}) {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <ChartCard title={title} description={description}>
      {total === 0 ? (
        <EmptyChart />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              nameKey="label"
              dataKey="value"
              cx="50%"
              cy="45%"
              outerRadius={95}
              innerRadius={48}
              paddingAngle={2}
              strokeWidth={1}
            >
              {data.map((item, index) => (
                <Cell
                  key={item.label}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip />

            <Legend verticalAlign="bottom" height={65} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

/**
 * Gráfica de barras para distribuciones.
 *
 * Se muestran como máximo 12 categorías para evitar
 * que las gráficas con demasiadas opciones sean ilegibles.
 */
export function DistributionBarCard({
  title,
  description,
  data,
  maxItems = 12,
}: {
  title: string;
  description?: string;
  data: DistributionItem[];
  maxItems?: number;
}) {
  const chartData = data.slice(0, maxItems);

  if (chartData.every((item) => item.value === 0)) {
    return (
      <ChartCard title={title} description={description}>
        <EmptyChart />
      </ChartCard>
    );
  }

  const height = Math.max(260, chartData.length * 34);

  return (
    <ChartCard title={title} description={description}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            top: 5,
            right: 20,
            bottom: 5,
            left: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />

          <XAxis
            type="number"
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            type="category"
            dataKey="label"
            width={165}
            interval={0}
            tick={{
              fontSize: 11,
            }}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip />

          <Bar dataKey="value" name="Afiliados" radius={[0, 5, 5, 0]}>
            {chartData.map((item, index) => (
              <Cell
                key={item.label}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/**
 * Gráfica temporal: altas de afiliados o proyectos.
 */
export function TrendBarCard({
  title,
  description,
  data,
}: {
  title: string;
  description?: string;
  data: TrendItem[];
}) {
  return (
    <ChartCard title={title} description={description}>
      {data.length === 0 ? (
        <EmptyChart />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 15,
              bottom: 5,
              left: -15,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis dataKey="year" tickLine={false} axisLine={false} />

            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />

            <Tooltip />

            <Bar
              dataKey="value"
              name="Registros"
              fill="#2563eb"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[280px] items-center justify-center">
      <p className="text-sm text-muted-foreground">
        No hay datos suficientes para mostrar esta gráfica.
      </p>
    </div>
  );
}

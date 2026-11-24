// @/components/admin/estadisticas/afiliados-dashboard.tsx

"use client";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import {
  Activity,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  FileUser,
  Globe2,
  Users,
  UserCheck,
  UserRoundX,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  DistributionBarCard,
  DistributionPieCard,
  TrendBarCard,
} from "./afiliados-charts";

import {
  afiliadosDashboardFiltersSchema,
  CURRENT_YEAR,
  MEMBERSHIP_STATUS_OPTIONS,
  type AfiliadosDashboardFilters,
  type AfiliadosDashboardResponse,
} from "@/lib/estadisticas/afiliados-dashboard";
import { ESTADOS_MEXICO, GENERO_OPTIONS } from "@/lib/registro/types";

// -------------------------------------------------------------
// API
// -------------------------------------------------------------

async function fetchAfiliadosDashboard(
  filters: AfiliadosDashboardFilters,
  signal: AbortSignal,
): Promise<AfiliadosDashboardResponse> {
  const params = new URLSearchParams();

  if (filters.anioDesde !== undefined) {
    params.set("anioDesde", String(filters.anioDesde));
  }

  if (filters.anioHasta !== undefined) {
    params.set("anioHasta", String(filters.anioHasta));
  }

  if (filters.estadoResidencia) {
    params.set("estadoResidencia", filters.estadoResidencia);
  }

  if (filters.genero) {
    params.set("genero", filters.genero);
  }

  if (filters.membershipStatus) {
    params.set("membershipStatus", filters.membershipStatus);
  }

  const queryString = params.toString();

  const response = await fetch(
    `/api/admin/estadisticas/afiliados${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
      cache: "no-store",
      signal,
    },
  );

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.error ?? "No fue posible obtener las estadísticas.",
    );
  }

  return result as AfiliadosDashboardResponse;
}

// -------------------------------------------------------------
// Tipos y utilidades
// -------------------------------------------------------------

interface FilterDraft {
  anioDesde: string;
  anioHasta: string;
  estadoResidencia: string;
  genero: string;
  membershipStatus: string;
}

const INITIAL_FILTER_DRAFT: FilterDraft = {
  anioDesde: "",
  anioHasta: "",
  estadoResidencia: "",
  genero: "",
  membershipStatus: "",
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-MX").format(value);
}

function formatPercentage(value: number): string {
  return `${value.toLocaleString("es-MX", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

// -------------------------------------------------------------
// Indicadores
// -------------------------------------------------------------

interface MetricCardProps {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

function MetricCard({ label, value, description, icon }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>

          <p className="text-2xl font-bold tracking-tight tabular-nums">
            {value}
          </p>

          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        <div className="rounded-lg bg-muted p-3">{icon}</div>
      </CardContent>
    </Card>
  );
}

function MetricSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        <div className="h-8 w-20 animate-pulse rounded bg-muted" />
        <div className="h-3 w-36 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

// -------------------------------------------------------------
// Filtros
// -------------------------------------------------------------

function Filters({
  draft,
  onChange,
  onApply,
  onReset,
  error,
}: {
  draft: FilterDraft;
  onChange: <K extends keyof FilterDraft>(
    key: K,
    value: FilterDraft[K],
  ) => void;
  onApply: () => void;
  onReset: () => void;
  error: string | null;
}) {
  const selectClassName =
    "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

  const inputClassName =
    "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>

        <CardDescription>
          Filtra los indicadores por periodo de registro, ubicación, género o
          estado de membresía.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2">
            <label htmlFor="anioDesde" className="text-sm font-medium">
              Año inicial
            </label>

            <input
              id="anioDesde"
              type="number"
              min={1965}
              max={CURRENT_YEAR}
              placeholder="Desde"
              value={draft.anioDesde}
              onChange={(event) => onChange("anioDesde", event.target.value)}
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="anioHasta" className="text-sm font-medium">
              Año final
            </label>

            <input
              id="anioHasta"
              type="number"
              min={1965}
              max={CURRENT_YEAR}
              placeholder="Hasta"
              value={draft.anioHasta}
              onChange={(event) => onChange("anioHasta", event.target.value)}
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="estadoResidencia" className="text-sm font-medium">
              Estado de residencia
            </label>

            <select
              id="estadoResidencia"
              value={draft.estadoResidencia}
              onChange={(event) =>
                onChange("estadoResidencia", event.target.value)
              }
              className={selectClassName}
            >
              <option value="">Todos los estados</option>

              {ESTADOS_MEXICO.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="genero" className="text-sm font-medium">
              Género
            </label>

            <select
              id="genero"
              value={draft.genero}
              onChange={(event) => onChange("genero", event.target.value)}
              className={selectClassName}
            >
              <option value="">Todos</option>

              {GENERO_OPTIONS.map((genero) => (
                <option key={genero} value={genero}>
                  {genero}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="membershipStatus" className="text-sm font-medium">
              Estado de membresía
            </label>

            <select
              id="membershipStatus"
              value={draft.membershipStatus}
              onChange={(event) =>
                onChange("membershipStatus", event.target.value)
              }
              className={selectClassName}
            >
              <option value="">Todos los estados</option>

              {MEMBERSHIP_STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={onApply}>
            Aplicar filtros
          </Button>

          <Button type="button" variant="outline" onClick={onReset}>
            Limpiar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// -------------------------------------------------------------
// Dashboard principal
// -------------------------------------------------------------

export function AfiliadosDashboard() {
  const [draft, setDraft] = useState<FilterDraft>(INITIAL_FILTER_DRAFT);

  const [filters, setFilters] = useState<AfiliadosDashboardFilters>({});

  const [filterError, setFilterError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["admin", "estadisticas", "afiliados", filters],

    queryFn: ({ signal }) => fetchAfiliadosDashboard(filters, signal),

    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  function updateDraft<K extends keyof FilterDraft>(
    key: K,
    value: FilterDraft[K],
  ) {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  /**
   * Validación frontend.
   *
   * Se utiliza exactamente el mismo esquema Zod que utiliza
   * el endpoint del backend.
   */
  function handleApplyFilters() {
    const parsed = afiliadosDashboardFiltersSchema.safeParse({
      anioDesde: draft.anioDesde === "" ? undefined : Number(draft.anioDesde),

      anioHasta: draft.anioHasta === "" ? undefined : Number(draft.anioHasta),

      estadoResidencia: draft.estadoResidencia || undefined,

      genero: draft.genero || undefined,

      membershipStatus: draft.membershipStatus || undefined,
    });

    if (!parsed.success) {
      setFilterError(
        parsed.error.issues[0]?.message ??
          "Verifica los filtros proporcionados.",
      );

      return;
    }

    setFilterError(null);
    setFilters(parsed.data);
  }

  function handleResetFilters() {
    setDraft(INITIAL_FILTER_DRAFT);
    setFilters({});
    setFilterError(null);
  }

  const data = query.data;

  const metrics = data
    ? [
        {
          label: "Total de afiliados",
          value: formatNumber(data.summary.total),
          description: "Afiliados que coinciden con los filtros",
          icon: <Users className="size-5 text-muted-foreground" />,
        },
        {
          label: "Afiliados activos",
          value: formatNumber(data.summary.activos),
          description: `${formatPercentage(data.summary.porcentajeActivos)} del total`,
          icon: <UserCheck className="size-5 text-muted-foreground" />,
        },
        {
          label: "Afiliados inactivos",
          value: formatNumber(data.summary.inactivos),
          description: "Con estado INACTIVO",
          icon: <UserRoundX className="size-5 text-muted-foreground" />,
        },
        {
          label: "Afiliados suspendidos",
          value: formatNumber(data.summary.suspendidos),
          description: "Con estado SUSPENDIDO",
          icon: <Activity className="size-5 text-muted-foreground" />,
        },
        {
          label: "Autorizan publicación",
          value: formatNumber(data.summary.autorizanPublicacion),
          description: `${formatPercentage(data.summary.porcentajePublicacion)} del total`,
          icon: <Globe2 className="size-5 text-muted-foreground" />,
        },
        {
          label: "Con fotografía",
          value: formatNumber(data.summary.conFotografia),
          description: "Tienen fotografía asociada",
          icon: <Camera className="size-5 text-muted-foreground" />,
        },
        {
          label: "Con perfil profesional",
          value: formatNumber(data.summary.conPerfilProfesional),
          description: "Tienen descripción profesional",
          icon: <FileUser className="size-5 text-muted-foreground" />,
        },
        {
          label: "Proyectos relevantes",
          value: formatNumber(data.summary.totalProyectos),
          description: `${formatNumber(data.summary.afiliadosConProyecto)} afiliados con proyectos · Promedio: ${data.summary.promedioProyectosPorAfiliado}`,
          icon: <BriefcaseBusiness className="size-5 text-muted-foreground" />,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Encabezado */}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Estadísticas de afiliados
          </h1>

          <p className="text-sm text-muted-foreground">
            Indicadores generales, distribución y actividad de la Red de
            Egresados de Posgrado.
          </p>
        </div>

        {query.isFetching && (
          <span className="text-sm text-muted-foreground">
            Actualizando estadísticas...
          </span>
        )}
      </div>

      {/* Filtros */}

      <Filters
        draft={draft}
        onChange={updateDraft}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        error={filterError}
      />

      {/* Error */}

      {query.isError && (
        <Card className="border-destructive/50">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-destructive">
                No fue posible cargar las estadísticas.
              </p>

              <p className="text-sm text-muted-foreground">
                {query.error.message}
              </p>
            </div>

            <Button variant="outline" onClick={() => query.refetch()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Indicadores principales */}

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Indicadores generales</h2>

          <p className="text-sm text-muted-foreground">
            Resumen de los afiliados que coinciden con los filtros
            seleccionados.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {query.isPending && !data
            ? Array.from({ length: 8 }).map((_, index) => (
                <MetricSkeleton key={index} />
              ))
            : metrics.map((metric) => (
                <MetricCard key={metric.label} {...metric} />
              ))}
        </div>
      </section>

      {data && (
        <>
          {/* Membresía y crecimiento */}

          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold">Membresía y crecimiento</h2>

              <p className="text-sm text-muted-foreground">
                Estados de membresía y evolución de los registros en la
                plataforma.
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <DistributionPieCard
                title="Estados de membresía"
                description="Cantidad de afiliados por estado."
                data={data.distributions.membershipStatus}
              />

              <TrendBarCard
                title="Registros de afiliados por año"
                description="Cantidad de afiliados registrados por año, según createdAt."
                data={data.registrationsByYear}
              />
            </div>
          </section>

          {/* Información demográfica */}

          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold">Información demográfica</h2>

              <p className="text-sm text-muted-foreground">
                Distribución geográfica y características generales de los
                afiliados.
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <DistributionBarCard
                title="Afiliados por estado"
                description="Los 12 estados con mayor cantidad de afiliados."
                data={data.distributions.estados}
                maxItems={12}
              />

              <DistributionBarCard
                title="Distribución por género"
                description="Cantidad de afiliados por género."
                data={data.distributions.genero}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Principales ciudades</CardTitle>

                <CardDescription>
                  Las diez ciudades con mayor número de afiliados registrados.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {data.topCities.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No hay ciudades registradas.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="pb-3 pr-4 font-medium">Ciudad</th>

                          <th className="pb-3 pr-4 font-medium">Estado</th>

                          <th className="pb-3 text-right font-medium">
                            Afiliados
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {data.topCities.map((city) => (
                          <tr
                            key={`${city.label}-${city.estado}`}
                            className="border-b last:border-0"
                          >
                            <td className="py-3 pr-4 font-medium">
                              {city.label}
                            </td>

                            <td className="py-3 pr-4 text-muted-foreground">
                              {city.estado}
                            </td>

                            <td className="py-3 text-right font-medium tabular-nums">
                              {formatNumber(city.value)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Perfil profesional */}

          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold">Perfil profesional</h2>

              <p className="text-sm text-muted-foreground">
                Áreas de conocimiento y características de los perfiles
                profesionales registrados.
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <DistributionBarCard
                title="Áreas de conocimiento"
                description="Cantidad de afiliados que seleccionaron cada área."
                data={data.distributions.areasConocimiento}
              />

              <DistributionBarCard
                title="Disponibilidad geográfica"
                description="Alcance geográfico de los servicios ofrecidos."
                data={data.distributions.disponibilidadGeografica}
              />
            </div>
          </section>

          {/* Servicios profesionales */}

          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold">Servicios profesionales</h2>

              <p className="text-sm text-muted-foreground">
                Características de los servicios que los afiliados están en
                condiciones de ofrecer.
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <DistributionBarCard
                title="Tipos de servicios"
                description="Servicios profesionales seleccionados."
                data={data.distributions.tiposServicios}
              />

              <DistributionBarCard
                title="Sectores de atención"
                description="Sectores en los que pueden ofrecer servicios."
                data={data.distributions.sectores}
              />

              <DistributionBarCard
                title="Modalidades de servicio"
                description="Modalidades de contratación o colaboración."
                data={data.distributions.modalidades}
              />

              <DistributionBarCard
                title="Intereses de colaboración"
                description="Actividades en las que los afiliados están interesados."
                data={data.distributions.interesadosEn}
              />
            </div>
          </section>

          {/* Proyectos */}

          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold">Proyectos relevantes</h2>

              <p className="text-sm text-muted-foreground">
                Evolución temporal de los proyectos registrados por los
                afiliados.
              </p>
            </div>

            <TrendBarCard
              title="Proyectos por año"
              description="Cantidad de proyectos relevantes según el año registrado en cada proyecto."
              data={data.projectsByYear}
            />
          </section>

          {/* Pie de dashboard */}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-xs text-muted-foreground">
            <span>
              Información calculada a partir de los registros de afiliados y
              proyectos relevantes.
            </span>

            <span>
              Actualizado:{" "}
              {new Date(data.generatedAt).toLocaleString("es-MX", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>
        </>
      )}

      {/* Sin resultados */}

      {data && data.summary.total === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <CheckCircle2 className="size-8 text-muted-foreground" />

            <p className="font-medium">No se encontraron afiliados.</p>

            <p className="text-sm text-muted-foreground">
              Modifica o elimina los filtros para consultar otros registros.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

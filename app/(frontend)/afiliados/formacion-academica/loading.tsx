// app/afiliado/formacion-academica/loading.tsx

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <div className="space-y-2">
        <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-96 animate-pulse rounded-md bg-muted" />
      </div>

      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}

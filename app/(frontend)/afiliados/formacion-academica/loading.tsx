// app/afiliado/formacion-academica/loading.tsx

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="h-8 w-72 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded-md bg-muted" />
      </div>

      {/* Form sections */}
      <div className="space-y-6">
        {[1, 2, 3].map((section) => (
          <div
            key={section}
            className="rounded-lg border bg-card p-6 shadow-sm"
          >
            <div className="mb-6 space-y-2">
              <div className="h-5 w-48 animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
              </div>

              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

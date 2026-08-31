"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        background: "#f8fafc",
        color: "#0f172a",
        margin: 0,
      }}
    >
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: 24,
        }}
      >
        <p
          style={{ fontSize: 56, fontWeight: 700, color: "#004B87", margin: 0 }}
        >
          REP TecNM
        </p>
        <h1 style={{ fontSize: 24, marginTop: 16 }}>
          Estamos trabajando en ello
        </h1>
        <p
          style={{
            maxWidth: 420,
            color: "#64748b",
            fontSize: 14,
            marginTop: 8,
          }}
        >
          El servicio presentó una falla general y estamos restableciéndolo. En
          unos momentos todo volverá a la normalidad; gracias por tu paciencia.
        </p>
        <button
          onClick={() => reset()}
          style={{
            marginTop: 24,
            background: "#004B87",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}

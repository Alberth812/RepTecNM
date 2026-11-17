// components/admin/solicitudes/campo.tsx
export function Campo({
 label,
 value,
}: {
 label: string;
 value: React.ReactNode;
}) {
 return (
 <div className="space-y-1">
 <p className="text-xs font-medium text-muted-foreground">{label}</p>
 <p className="text-sm">{value || "—"}</p>
 </div>
 );
}
// components/avisos/aviso-badges.tsx
import { AlertTriangle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Props = {
 important: boolean;
 expiresAt?: string | null;
};

export function AvisoBadges({ important, expiresAt }: Props) {
 if (!important) return null;

 const expired = expiresAt
 ? new Date(expiresAt).getTime() < Date.now()
 : false;

 return (
 <div className="flex flex-wrap items-center gap-2">
 <Badge
 variant="outline"
 className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
 >
 <AlertTriangle className="h-3.5 w-3.5" />
 Importante
 </Badge>

 {expiresAt ? (
 <Badge variant={expired ? "secondary" : "outline"} className="gap-1">
 <Clock className="h-3.5 w-3.5" />
 {expired
 ? "Expirado"
 : `Vence el ${new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(new Date(expiresAt))}`}
 </Badge>
 ) : null}
 </div>
 );
}
import Link from "next/link";
import { ChevronRight, UserRound } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// MiCuenta
export default function MiCuenta() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserRound className="h-5 w-5" />
          </div>

          <div>
            <CardTitle className="text-lg">Mi cuenta</CardTitle>
            <p className="text-sm text-muted-foreground">
              Gestiona tus datos personales
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <nav className="divide-y rounded-lg border">
          <Link
            href="/afiliado/modificar-datos"
            className="group flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-muted/50"
          >
            <div>
              <p className="text-sm font-medium">Actualizar mis datos</p>
              <p className="text-sm text-muted-foreground">
                Modifica tu información personal
              </p>
            </div>

            <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
          </Link>

          <Link
            href="/cambiar-password"
            className="group flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-muted/50"
          >
            <div>
              <p className="text-sm font-medium">Cambiar contraseña</p>
              <p className="text-sm text-muted-foreground">
                Actualiza la contraseña de tu cuenta
              </p>
            </div>

            <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
          </Link>
        </nav>
      </CardContent>
    </Card>
  );
}

import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuthShellProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Envoltorio visual compartido por register/login/verify-email/forgot y
 * reset password: card centrada, acento superior en el color de marca
 * (#004B87) y un footer opcional para links secundarios ("¿No tienes
 * cuenta?", "Volver a iniciar sesión", etc.).
 */
export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="h-9 w-9 rounded-md bg-[#004B87]" aria-hidden="true" />
        </div>

        <Card className="border-t-4 border-t-[#004B87] shadow-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl">{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>

        {footer ? (
          <div className="mt-4 text-center text-sm text-muted-foreground">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}

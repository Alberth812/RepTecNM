"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, GraduationCap, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [ver, setVer] = useState(false);
  const [cargando, setCargando] = useState(false);

  const iniciarSesion = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      // 1. Obtener token CSRF
      await fetch("/api/auth/csrf/", { credentials: "include" });
      
      // 2. Obtener la cookie csrftoken
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];

      // 3. Intentar login
      const res = await fetch("/api/auth/login/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken || "",
        },
        body: JSON.stringify({ username: correo, password: clave }),
      });

      // 4. Verificar si la respuesta es realmente JSON
      const contentType = res.headers.get("content-type");
      let data;
      
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("El servidor no devolvió JSON. Respuesta cruda:", text);
        toast.error("Error del servidor. Revisa la consola (F12) para ver el detalle.");
        setCargando(false);
        return;
      }

      if (data.success) {
        toast.success(`Bienvenido, ${data.nombre}`);
        router.push(data.rol === "admin" ? "/dashboard" : "/");
        router.refresh();
      } else {
        toast.error(data.error || "Credenciales inválidas");
      }
    } catch (error) {
      console.error("Error de red o parseo:", error);
      toast.error("Error de conexión con el servidor");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#004B87]/10">
            <GraduationCap className="h-6 w-6 text-[#004B87]" />
          </div>
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder a la Red de Egresados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={iniciarSesion} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="correo">Correo electrónico o Usuario</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="correo"
                  type="text"
                  placeholder="usuario o correo"
                  className="pl-9"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clave">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="clave"
                  type={ver ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-10"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setVer(!ver)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  aria-label={ver ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {ver ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-[#004B87] hover:bg-[#003562]"
              disabled={cargando}
            >
              {cargando ? "Verificando..." : "Iniciar sesión"}
              {!cargando && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <Link href="/registro" className="text-[#004B87] hover:underline">
              ¿No tienes cuenta? Afíliate aquí
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import type { ComponentProps } from "react";

import { useLogoutMutation } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";

interface LogoutButtonProps extends Omit<
 ComponentProps<typeof Button>,
 "onClick"
> {
 redirectTo?: string;
}

/** POST /api/auth/sign-out (endpoint estándar de better-auth). */
export function LogoutButton({
 redirectTo = "/login",
 variant = "outline",
 ...buttonProps
}: LogoutButtonProps) {
 const router = useRouter();
 const logoutMutation = useLogoutMutation();

 async function handleLogout() {
 await logoutMutation.mutateAsync();
 router.push(redirectTo);
 router.refresh();
 }

 return (
 <Button
 variant={variant}
 onClick={handleLogout}
 disabled={logoutMutation.isPending}
 {...buttonProps}
 >
 {logoutMutation.isPending ? (
 <Loader2 className="h-4 w-4 animate-spin" />
 ) : (
 <LogOut className="h-4 w-4" />
 )}
 Cerrar sesión
 </Button>
 );
}

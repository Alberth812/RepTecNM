"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { SecondaryButton } from "@/components/ui/primitives";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <SecondaryButton type="button" onClick={handleSignOut} disabled={loading} className="w-auto px-4 py-2 text-sm">
      {loading ? "Cerrando…" : "Cerrar sesión"}
    </SecondaryButton>
  );
}

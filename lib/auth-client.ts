"use client";

import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

// Sin `baseURL`: el cliente usa el mismo origen del que se sirve la app
// (la API de auth vive en /api/auth dentro de este mismo proyecto Next.js).
export const authClient = createAuthClient({
  plugins: [emailOTPClient()],
});

export const { useSession, signIn, signOut, signUp } = authClient;

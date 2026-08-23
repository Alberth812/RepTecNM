"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  forgotPasswordRequest,
  loginRequest,
  registerRequest,
  resendVerificationRequest,
  resetPasswordRequest,
} from "@/lib/api/auth-api";
import { fetchMe } from "@/lib/api/me";
import { authClient } from "@/lib/auth-client";

export const meQueryKey = ["me"] as const;

/** Sesión + datos de dominio (rol, subtipo/isRoot o membershipStatus). */
export function useMeQuery() {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: fetchMe,
    retry: false,
    staleTime: 60_000,
  });
}

export function useRegisterMutation() {
  return useMutation({ mutationFn: registerRequest });
}

export function useResendVerificationMutation() {
  return useMutation({ mutationFn: resendVerificationRequest });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: loginRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meQueryKey });
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({ mutationFn: forgotPasswordRequest });
}

export function useResetPasswordMutation() {
  return useMutation({ mutationFn: resetPasswordRequest });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await authClient.signOut();
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: meQueryKey });
    },
  });
}

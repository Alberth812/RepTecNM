import { auth } from "@/lib/auth/auth";
import { getClientIp } from "@/lib/http/client-ip";
import { toErrorResponse } from "@/lib/http/responses";
import {
  assertLoginAllowed,
  recordLoginFailure,
  resetLoginFailures,
} from "@/lib/rate-limit/login-lockout";
import { loginSchema } from "@/lib/validation/schemas";
import { normalizeLoginError } from "@/lib/api/normalize-login-error";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    let rawBody: unknown;

    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid or empty JSON body" },
        { status: 400 },
      );
    }

    const result = loginSchema.safeParse(rawBody);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { email, password } = result.data;
    const ip = getClientIp(request);

    await assertLoginAllowed(email, ip);

    let response: Response;

    try {
      response = await auth.api.signInEmail({
        body: { email, password },
        asResponse: true,
      });
    } catch (error) {
      const normalizedError = normalizeLoginError(error);

      if (normalizedError.code === "INVALID_CREDENTIALS") {
        await recordLoginFailure(email, ip);
      }

      throw normalizedError;
    }

    if (!response.ok) {
      // Important: only do this if signInEmail returns
      // authentication failures as a Response rather than throwing.
      // Normalize/check the response according to your auth API contract.
      return response;
    }

    await resetLoginFailures(email);

    return response;
  } catch (error) {
    return toErrorResponse(error);
  }
}

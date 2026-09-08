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
    const body = loginSchema.parse(await request.json());
    const ip = getClientIp(request);

    await assertLoginAllowed(body.email, ip);

    let response: Response;

    try {
      response = await auth.api.signInEmail({
        body: {
          email: body.email,
          password: body.password,
        },
        asResponse: true,
      });
    } catch (error) {
      const normalizedError = normalizeLoginError(error);

      if (normalizedError.code === "INVALID_CREDENTIALS") {
        await recordLoginFailure(body.email, ip);
      }

      throw normalizedError;
    }

    await resetLoginFailures(body.email);

    const data = (await response.json().catch(() => null)) as {
      user?: {
        id: string;
        email: string;
        role?: string;
      };
    } | null;

    const headers = new Headers({
      "content-type": "application/json",
    });

    for (const cookie of response.headers.getSetCookie()) {
      headers.append("set-cookie", cookie);
    }

    return new NextResponse(JSON.stringify(data), {
      status: response.status,
      headers,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
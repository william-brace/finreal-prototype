import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateBasicAuth } from "./utils/auth/basicAuth";
import { updateSession } from "./utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // First, validate basic authentication
  const authResponse = validateBasicAuth(request);

  // If basic authentication failed, return the error response
  if (authResponse) {
    return authResponse;
  }

  // Basic auth passed, now handle Supabase session management
  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api/public).*)"],
};

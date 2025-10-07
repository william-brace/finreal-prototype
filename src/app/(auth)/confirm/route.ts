import { type EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  const redirectWithFlash = async (
    path: string,
    status: "success" | "error",
    message: string
  ) => {
    // Set flash message and redirect
    (await cookies()).set(
      "flash",
      JSON.stringify({
        status,
        message,
      }),
      {
        path: "/",
        httpOnly: true,
        maxAge: 15,
        sameSite: "lax",
      }
    );
    return NextResponse.redirect(new URL(path, request.url));
  };

  if (!token_hash || !type) {
    return redirectWithFlash(
      "/login",
      "error",
      "Invalid confirmation link. Please try signing up again."
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({ type, token_hash });
  console.log("error", error);

  if (!error) {
    return redirectWithFlash(
      next,
      "success",
      "Email confirmed successfully! Welcome to FinReal."
    );
  }

  // Map common Supabase errors to user-friendly messages
  const msg = (error.message || "").toLowerCase();
  if (msg.includes("expired")) {
    return redirectWithFlash(
      "/login",
      "error",
      "This confirmation link has expired. Please sign up again to get a new link."
    );
  }

  return redirectWithFlash(
    "/login",
    "error",
    "Invalid confirmation link. Please try signing up again."
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  forgotPasswordSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from "@/features/auth/model/schema";
import { createClient } from "@/utils/supabase/server";

// Action result types
type AuthResult = { error?: string; success?: boolean };

export async function login(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<AuthResult | never> {
  const supabase = await createClient();

  // Extract and validate form data
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
    // rememberMe: formData.get("rememberMe") === "on", // Convert checkbox value to boolean - checkbox is sent from html form as "on" or null
  };

  const validationResult = signInSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      error: validationResult.error.errors[0]?.message || "Validation failed",
    };
  }

  const { error } = await supabase.auth.signInWithPassword(
    validationResult.data
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<AuthResult> {
  const supabase = await createClient();

  // Extract and validate form data
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const validationResult = signUpSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      error: validationResult.error.errors[0]?.message || "Validation failed",
    };
  }

  // Only pass email and password to Supabase (name and confirmPassword not needed)
  const { email, password } = validationResult.data;
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function sendResetPasswordEmail(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<AuthResult> {
  const supabase = await createClient();

  // Extract and validate form data
  const rawData = {
    email: formData.get("email"),
  };

  const validationResult = forgotPasswordSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      error: validationResult.error.errors[0]?.message || "Validation failed",
    };
  }

  const { email } = validationResult.data;

  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updatePassword(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<AuthResult> {
  const supabase = await createClient();

  const rawData = {
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const validationResult = updatePasswordSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      error: validationResult.error.errors[0]?.message || "Validation failed",
    };
  }

  const { password } = validationResult.data;

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    console.log("Update password error:", error);
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function logout(): Promise<
  { success: boolean; error?: string } | never
> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout error:", error);
    return {
      success: false,
      error: error.message || "Failed to log out. Please try again.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/login");
}

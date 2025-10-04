"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supbase-client";

interface SignInData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface UseSignInReturn {
  signIn: (data: SignInData) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export function useSignIn(): UseSignInReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const signIn = async (data: SignInData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const { data: _authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

      console.log("authData", _authData);

      if (authError) {
        throw authError;
      }

      setSuccess(true);

      // TODO: Handle remember me functionality if needed

      // Redirect to home page after successful sign in
      setTimeout(() => {
        router.push("/");
      }, 1000); // Small delay to show success message
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during sign in"
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    signIn,
    loading,
    error,
    success,
  };
}

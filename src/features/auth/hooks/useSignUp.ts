"use client";

import { useState } from "react";
import { supabase } from "@/lib/supbase-client";

interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

interface UseSignUpReturn {
  signUp: (data: SignUpData) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export function useSignUp(): UseSignUpReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const signUp = async (data: SignUpData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      console.log("authData", authData);

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during sign up"
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    signUp,
    loading,
    error,
    success,
  };
}

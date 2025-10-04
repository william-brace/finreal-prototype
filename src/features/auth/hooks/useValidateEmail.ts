"use client";

import { supabase } from "@/lib/supbase-client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const useValidateEmail = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const validateEmail = async () => {
    try {
      setLoading(true);
      setError(null);

      // Extract tokens from URL hash
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);

      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (!accessToken || !refreshToken) {
        throw new Error("Missing authentication tokens in URL");
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        throw sessionError;
      }

      setSuccess(true);

      // Navigate to home page after successful validation
      setTimeout(() => {
        router.push("/");
      }, 2000); // Wait 2 seconds to show success message
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to validate email";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Auto-validate when component mounts
  useEffect(() => {
    validateEmail();
  }, []);

  return { loading, error, success, validateEmail };
};

export default useValidateEmail;

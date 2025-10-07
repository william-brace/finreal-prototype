"use client";

import { sendResetPasswordEmail } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "../model/schema";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(sendResetPasswordEmail, null);

  const {
    register,
    formState: { errors, isSubmitting, isValid },
    watch,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  });

  const email = watch("email");

  const error = state?.error;
  const success = state?.success;
  const loading = pending || isSubmitting;
  const disabled = loading || !isValid || !email;

  if (success) {
    return (
      <Card>
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <p className="text-sm text-muted-foreground">
            We &apos;ve sent a password reset link to your email address
          </p>
        </CardHeader>
        <CardContent className="w-[400px] space-y-4">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              If you don&apos;t see the email in your inbox, check your spam
              folder.
            </p>
            <div className="space-y-2">
              <Link href="/forgot-password" className="block">
                <Button variant="outline" className="w-full">
                  Try different email
                </Button>
              </Link>
              <Link href="/login" className="block">
                <Button variant="ghost" className="w-full">
                  Back to sign in
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl">Forgot your password?</CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we&apos;ll send you a link to reset your
          password
        </p>
      </CardHeader>
      <CardContent className="w-[400px] space-y-4">
        <form action={action} className="space-y-4">
          <FormTextInput
            id="email"
            label="Email address"
            type="email"
            placeholder="Enter your email address"
            error={errors.email}
            {...register("email")}
          />

          {error && (
            <div className="text-sm text-destructive bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={disabled}>
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

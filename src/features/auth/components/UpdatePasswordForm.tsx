"use client";

import { updatePassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import {
  updatePasswordSchema,
  type UpdatePasswordFormData,
} from "../model/schema";

export function UpdatePasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, null);

  const {
    register,
    formState: { errors, isSubmitting, isValid },
    watch,
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    mode: "onChange",
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const error = state?.error;
  const success = state?.success;
  const loading = pending || isSubmitting;
  const disabled = loading || !isValid || !password || !confirmPassword;

  if (success) {
    return (
      <Card>
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl">Password updated!</CardTitle>
          <p className="text-sm text-muted-foreground">
            Your password has been successfully updated
          </p>
        </CardHeader>
        <CardContent className="w-[400px] space-y-4">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              You can use your new password next time you sign in.
            </p>
            <Link href="/" className="block">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl">Set new password</CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter your new password below
        </p>
      </CardHeader>
      <CardContent className="w-[400px] space-y-4">
        <form action={action} className="space-y-4">
          <FormTextInput
            id="password"
            label="New password"
            type="password"
            placeholder="Enter your new password"
            error={errors.password}
            {...register("password")}
          />
          <FormTextInput
            id="confirmPassword"
            label="Confirm new password"
            type="password"
            placeholder="Confirm your new password"
            error={errors.confirmPassword}
            {...register("confirmPassword")}
          />

          {error && (
            <div className="text-sm text-destructive bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={disabled}>
            {loading ? "Updating..." : "Update password"}
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

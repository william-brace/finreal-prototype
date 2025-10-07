"use client";

import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { signInSchema, type SignInFormData } from "../model/schema";

export function SignInForm() {
  const [state, action, pending] = useActionState(login, null);

  const {
    register,
    formState: { errors, isSubmitting, isValid },
    watch,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const email = watch("email");
  const password = watch("password");

  const error = state?.error;
  const loading = pending || isSubmitting;
  const disabled = loading || !isValid || !email || !password;

  return (
    <Card>
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl">FinReal</CardTitle>
        <p className="text-sm text-muted-foreground">
          Real Estate Financial Modeling
        </p>
      </CardHeader>
      <CardContent className="w-[400px] space-y-4">
        <form action={action} className="space-y-4">
          <FormTextInput
            id="email"
            label="Email address"
            type="email"
            placeholder="Email address"
            error={errors.email}
            {...register("email")}
          />
          <FormTextInput
            id="password"
            label="Password"
            type="password"
            placeholder="Password"
            error={errors.password}
            {...register("password")}
          />
          <div className="flex items-center justify-between">
            {/* <FormCheckbox
              id="rememberMe"
              label="Remember me"
              {...register("rememberMe")}
            /> */}
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={disabled}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

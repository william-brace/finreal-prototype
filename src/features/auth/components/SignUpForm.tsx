"use client";

import { signup } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { signUpSchema, type SignUpFormData } from "../model/schema";

export function SignUpForm() {
  const [state, action, pending] = useActionState(signup, null);

  const {
    register,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
  });

  const success = state?.success;
  const error = state?.error;
  const loading = pending || isSubmitting;

  return (
    <>
      {success ? (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">
              Account Created Successfully!
            </CardTitle>
            <CardDescription className="text-green-700">
              We&apos;ve sent a verification email to your inbox. Please check
              your email and click the verification link to activate your
              account.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Create an Account</CardTitle>
            <CardDescription>
              Join FinReal to start managing your real estate projects
            </CardDescription>
          </CardHeader>
          <CardContent className=" w-[500px]">
            <form action={action} className="space-y-4">
              <FormTextInput
                id="name"
                label="Full Name"
                type="text"
                placeholder="Enter your full name"
                error={errors.name}
                {...register("name")}
              />
              <FormTextInput
                id="email"
                label="Email"
                type="email"
                placeholder="Enter your email"
                error={errors.email}
                {...register("email")}
              />
              <FormTextInput
                id="password"
                label="Password"
                type="password"
                placeholder="Create a password"
                error={errors.password}
                {...register("password")}
              />
              <FormTextInput
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                error={errors.confirmPassword}
                {...register("confirmPassword")}
              />

              {error && (
                <div className="text-sm text-destructive bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      )}
    </>
  );
}

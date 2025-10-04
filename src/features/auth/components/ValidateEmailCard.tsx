"use client";

import { Spinner } from "@/components/ui/shadcn-io/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useValidateEmail from "../hooks/useValidateEmail";

export function ValidateEmailCard() {
  const { loading, error, success } = useValidateEmail();

  if (loading) {
    return (
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Validating Email</CardTitle>
          <CardDescription>
            Please wait while we verify your email address...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-[400px] border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">Validation Failed</CardTitle>
          <CardDescription className="text-red-700">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-[400px] border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">
            Email Verified Successfully!
          </CardTitle>
          <CardDescription className="text-green-700">
            Your email has been verified. Redirecting you to the home page...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return null;
}

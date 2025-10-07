import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export default async function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center flex-col">
      <ForgotPasswordForm />
    </div>
  );
}

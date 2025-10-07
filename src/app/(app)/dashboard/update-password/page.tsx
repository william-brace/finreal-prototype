import { UpdatePasswordForm } from "@/features/auth/components/UpdatePasswordForm";

export default async function UpdatePasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center flex-col">
      <UpdatePasswordForm />
    </div>
  );
}

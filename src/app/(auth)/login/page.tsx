import { SignInForm } from "@/features/auth/components/SignInForm";
import { FlashMessage } from "@/components/ui/FlashMessage";

export default async function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center flex-col">
      <FlashMessage />
      <SignInForm />
    </div>
  );
}

import { ValidateEmailCard } from "@/features/auth/components/ValidateEmailCard";

export default function AuthCallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <ValidateEmailCard />
    </div>
  );
}

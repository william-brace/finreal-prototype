import Link from "next/link";
import { UserProfile } from "./UserProfile";
import { createClient } from "@/utils/supabase/server";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userName = user?.user_metadata.full_name;

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-semibold">FinReal</h1>
          <nav>
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Projects
            </Link>
          </nav>
        </div>
        <UserProfile userName={userName} />
      </div>
    </header>
  );
}

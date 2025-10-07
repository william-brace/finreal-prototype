import { cookies } from "next/headers";

interface FlashMessageProps {
  className?: string;
}

export async function FlashMessage({ className = "mb-4" }: FlashMessageProps) {
  const cookieStore = await cookies();
  const flashRaw = cookieStore.get("flash")?.value;
  let flash: { status: "success" | "error"; message: string } | null = null;

  try {
    if (flashRaw) flash = JSON.parse(flashRaw);
  } catch (error) {
    console.warn("Invalid flash cookie JSON:", flashRaw);
  }

  if (!flash) return null;

  return (
    <div
      className={`rounded p-3 text-sm ${className} ${
        flash.status === "success"
          ? "bg-green-50 text-green-800 border border-green-200"
          : "bg-red-50 text-red-800 border border-red-200"
      }`}
    >
      {flash.message}
    </div>
  );
}

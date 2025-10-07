import "@/app/globals.css";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

ModuleRegistry.registerModules([AllCommunityModule]);

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinReal",
  description: "Real Estate Development Financial Analysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">{children}</div>
      </body>
    </html>
  );
}

import "@/app/globals.css";
import { Header } from "@/components/layout/header";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import type { Metadata } from "next";

ModuleRegistry.registerModules([AllCommunityModule]);

export const metadata: Metadata = {
  title: "FinReal",
  description: "Real Estate Development Financial Analysis",
};

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}

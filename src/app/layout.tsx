import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import {
  ModuleRegistry,
  AllCommunityModule,
} from 'ag-grid-community';

ModuleRegistry.registerModules([
  AllCommunityModule,
]);

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinReal",
  description: "Real Estate Development Financial Analysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  );
}

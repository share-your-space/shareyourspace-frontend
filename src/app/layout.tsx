import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";
import ClientProviders from "@/components/layout/ClientProviders";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShareYourSpace 2.0",
  description: "Connecting Corporates with Startups & Freelancers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProviders>
          <MainLayout>{children}</MainLayout>
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
} 
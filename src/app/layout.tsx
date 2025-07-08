import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/layout/ClientProviders";
import { Toaster } from "@/components/ui/sonner";
import { DialogProvider } from "@/context/DialogContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { useAuthStore } from '@/store/authStore';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ShareYourSpace",
  description: "A platform to connect and share spaces.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProviders>
          <DialogProvider>
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-grow bg-background text-foreground">
                    {children}
                  </main>
                  <Footer />
                </div>
            <Toaster />
          </DialogProvider>
        </ClientProviders>
      </body>
    </html>
  );
} 
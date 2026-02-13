import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";
import { verifySession } from "@/lib/auth";
import { getAllEvents } from "@/lib/queries";
import "./globals.css";

export const metadata: Metadata = {
  title: "Festival Fund Manager",
  description: "Track temple festival income and expenditures with ease",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAuthenticated = await verifySession();
  const events = await getAllEvents();

  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        <Navbar isAuthenticated={isAuthenticated} events={events} />
        <main>{children}</main>
        <footer className="py-6 text-center text-sm text-stone-400">
          &copy; {new Date().getFullYear()} Rajesh TP. All rights reserved.
        </footer>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}

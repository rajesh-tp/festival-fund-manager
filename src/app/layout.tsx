import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('festival-theme');if(t==='gold'||t==='sky')document.documentElement.setAttribute('data-theme',t)}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-body-bg text-text-heading antialiased">
        <ThemeProvider>
          <Navbar isAuthenticated={isAuthenticated} events={events} />
          <main>{children}</main>
          <footer className="py-6 text-center text-sm text-text-faint">
            &copy; {new Date().getFullYear()} Rajesh T Parameswaran. All rights reserved.
          </footer>
        </ThemeProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}

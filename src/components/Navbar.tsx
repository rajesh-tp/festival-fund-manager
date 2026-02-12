"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/entry", label: "Data Entry" },
  { href: "/reports", label: "Reports" },
];

type NavbarProps = {
  isAuthenticated: boolean;
};

export function Navbar({ isAuthenticated }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="bg-amber-800 text-white shadow-lg">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <svg
              className="h-7 w-7 text-amber-300"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            Festival Fund Manager
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-amber-900 text-amber-100"
                    : "text-amber-100 hover:bg-amber-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <form action={logout}>
                <button
                  type="submit"
                  className="ml-2 rounded-lg px-4 py-2 text-sm font-medium text-amber-100 transition-colors hover:bg-amber-700"
                >
                  Logout
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                className={`ml-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  pathname === "/login"
                    ? "bg-amber-900 text-amber-100"
                    : "text-amber-100 hover:bg-amber-700"
                }`}
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-2 text-amber-100 hover:bg-amber-700 md:hidden"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`overflow-hidden transition-all duration-300 md:hidden ${
            isOpen ? "max-h-64 pb-4" : "max-h-0"
          }`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-amber-900 text-amber-100"
                  : "text-amber-100 hover:bg-amber-700"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <form action={logout}>
              <button
                type="submit"
                onClick={() => setIsOpen(false)}
                className="block w-full rounded-lg px-4 py-2 text-left text-sm font-medium text-amber-100 transition-colors hover:bg-amber-700"
              >
                Logout
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className={`block rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                pathname === "/login"
                  ? "bg-amber-900 text-amber-100"
                  : "text-amber-100 hover:bg-amber-700"
              }`}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

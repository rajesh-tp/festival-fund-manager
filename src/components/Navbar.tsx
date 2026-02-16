"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { logout } from "@/lib/actions";
import { EventSelector } from "@/components/EventSelector";
import { ThemeSwitcher, ThemeSwitcherInline } from "@/components/ThemeSwitcher";
import type { Event } from "@/db/schema";

const navLinks = [
  { href: "/events", label: "Events", needsEvent: false },
  { href: "/", label: "Home", needsEvent: true },
  { href: "/entry", label: "Data Entry", needsEvent: true },
  { href: "/reports", label: "Reports", needsEvent: true },
];

type NavbarProps = {
  isAuthenticated: boolean;
  events: Event[];
};

export function Navbar({ isAuthenticated, events }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event");

  function buildHref(link: (typeof navLinks)[number]) {
    if (link.needsEvent && eventId) {
      return `${link.href}?event=${eventId}`;
    }
    return link.href;
  }

  return (
    <nav className="bg-nav text-white shadow-lg">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/events" className="flex items-center gap-2 text-lg font-bold text-nav-text">
            <svg
              className="h-7 w-7 text-nav-icon"
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
                href={buildHref(link)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-nav-active text-nav-text"
                    : "text-nav-text hover:bg-nav-hover"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="ml-2">
              <EventSelector events={events} />
            </div>

            <ThemeSwitcher />

            {isAuthenticated ? (
              <form action={logout}>
                <button
                  type="submit"
                  className="ml-2 rounded-lg px-4 py-2 text-sm font-medium text-nav-text transition-colors hover:bg-nav-hover"
                >
                  Logout
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                className={`ml-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  pathname === "/login"
                    ? "bg-nav-active text-nav-text"
                    : "text-nav-text hover:bg-nav-hover"
                }`}
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-2 text-nav-text hover:bg-nav-hover md:hidden"
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
            isOpen ? "max-h-96 pb-4" : "max-h-0"
          }`}
        >
          <div className="mb-2 px-4 py-2">
            <EventSelector events={events} />
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={buildHref(link)}
              onClick={() => setIsOpen(false)}
              className={`block rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-nav-active text-nav-text"
                  : "text-nav-text hover:bg-nav-hover"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <ThemeSwitcherInline />
          {isAuthenticated ? (
            <form action={logout}>
              <button
                type="submit"
                onClick={() => setIsOpen(false)}
                className="block w-full rounded-lg px-4 py-2 text-left text-sm font-medium text-nav-text transition-colors hover:bg-nav-hover"
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
                  ? "bg-nav-active text-nav-text"
                  : "text-nav-text hover:bg-nav-hover"
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

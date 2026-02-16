"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme, type Theme } from "./ThemeProvider";

const themes: { value: Theme; label: string }[] = [
  { value: "gold", label: "Festival Gold" },
  { value: "sky", label: "Festival Sky" },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-nav-text transition-colors hover:bg-nav-hover"
        aria-haspopup="true"
        aria-expanded={open}
      >
        Themes
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 w-44 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
          {themes.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                setTheme(t.value);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                theme === t.value
                  ? "bg-accent-light-bg font-medium text-accent-text"
                  : "text-text-secondary hover:bg-surface-alt"
              }`}
            >
              {theme === t.value && (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {theme !== t.value && <span className="inline-block w-4" />}
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ThemeSwitcherInline() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="px-4 py-2">
      <p className="mb-1.5 text-xs font-medium tracking-wider text-nav-text/60 uppercase">
        Themes
      </p>
      <div className="flex gap-2">
        {themes.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTheme(t.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              theme === t.value
                ? "bg-nav-active text-nav-text"
                : "text-nav-text hover:bg-nav-hover"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

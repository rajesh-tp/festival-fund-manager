"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "gold" | "sky";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "gold",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("gold");

  useEffect(() => {
    const stored = localStorage.getItem("festival-theme") as Theme | null;
    if (stored === "gold" || stored === "sky") {
      setThemeState(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
  }, []);

  function setTheme(newTheme: Theme) {
    setThemeState(newTheme);
    localStorage.setItem("festival-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

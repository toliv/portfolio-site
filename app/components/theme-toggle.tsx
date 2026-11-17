"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);

  function toggleTheme() {
    const nextDark = document.documentElement.dataset.theme !== "dark";
    const theme = nextDark ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    setDark(nextDark);
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // The current page still switches when browser storage is unavailable.
    }
  }

  return (
    <button type="button" onClick={toggleTheme} aria-pressed={dark} className="theme-toggle">
      Dark mode
    </button>
  );
}

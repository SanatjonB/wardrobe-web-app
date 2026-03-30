"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      style={{
        background: "none",
        border: "1px solid var(--border)",
        borderRadius: "999px",
        padding: "6px 10px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        color: "var(--muted)",
        transition: "all 0.15s ease",
      }}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
};

export { ThemeSwitcher };

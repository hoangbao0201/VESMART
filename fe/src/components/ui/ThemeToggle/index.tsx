"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type Theme = "light" | "dark";

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("vesmart-theme");
  if (stored === "light" || stored === "dark") return stored;
  const cookieMatch = document.cookie.match(/(?:^|; )vesmart-theme=(light|dark)/);
  if (cookieMatch?.[1] === "light" || cookieMatch?.[1] === "dark") {
    return cookieMatch[1];
  }
  // Mặc định sáng - không theo prefers-color-scheme của trình duyệt
  return "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem("vesmart-theme", theme);
  document.cookie = `vesmart-theme=${theme}; path=/; max-age=31536000; SameSite=Lax`;
}

const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = getPreferredTheme();
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Đổi giao diện"
        disabled
      >
        <Sun className="size-4" aria-hidden />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={theme === "dark" ? "Bật giao diện sáng" : "Bật giao diện tối"}
    >
      {theme === "dark" ? (
        <Sun className="size-4" aria-hidden />
      ) : (
        <Moon className="size-4" aria-hidden />
      )}
    </Button>
  );
};

export default ThemeToggle;

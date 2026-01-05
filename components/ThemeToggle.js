"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid Hydration Mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Toggle Theme"
    >
      <Sun 
        size={20} 
        className="absolute transition-all duration-500 rotate-0 scale-100 dark:-rotate-90 dark:scale-0 text-amber-500" 
      />
      <Moon 
        size={20} 
        className="absolute transition-all duration-500 rotate-90 scale-0 dark:rotate-0 dark:scale-100 text-blue-400" 
      />
    </button>
  );
}
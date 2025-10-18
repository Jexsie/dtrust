"use client";

import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  isLightTheme: boolean;
  toggleTheme: () => void;
  hasStarted: boolean;
}

export default function ThemeToggle({
  isLightTheme,
  toggleTheme,
  hasStarted,
}: ThemeToggleProps) {
  return (
    <div
      className={`${
        hasStarted
          ? "w-full flex justify-end mb-4 relative"
          : "absolute top-6 right-6"
      }`}
    >
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg transition-all bg-[#333] dark:bg-[#f1f5f9] hover:bg-[#444] dark:hover:bg-[#e2e8f0] text-[#e0e0e0] dark:text-[#1e293b]"
        title={isLightTheme ? "Switch to dark mode" : "Switch to light mode"}
      >
        {isLightTheme ? <Moon size={20} /> : <Sun size={20} />}
      </button>
    </div>
  );
}

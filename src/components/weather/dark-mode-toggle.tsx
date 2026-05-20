"use client";

import { Sun, Moon } from "lucide-react";
import { useSettings } from "@/components/providers";
import { useWeather } from "@/components/providers";

export function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useSettings();
  const { isDarkGradient } = useWeather();
  const iconClass = isDarkGradient ? "text-[#F5F3F0]" : "text-[#292524]";

  return (
    <button
      onClick={toggleDarkMode}
      role="switch"
      aria-checked={darkMode}
      aria-label="Dark mode"
      className={`p-2 rounded-xl hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#2EA8A8] ${iconClass}`}
    >
      {darkMode ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}

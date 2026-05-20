"use client";

import { useSettings } from "@/components/providers";
import { useWeather } from "@/components/providers";

export function UnitToggle() {
  const { units, toggleUnits } = useSettings();
  const { isDarkGradient } = useWeather();
  const isImperial = units === "imperial";
  const textClass = isDarkGradient ? "text-[#F5F3F0]" : "text-[#292524]";

  return (
    <button
      onClick={toggleUnits}
      role="switch"
      aria-checked={isImperial}
      aria-label="Unit system: metric or imperial"
      className="flex items-center gap-2 group rounded-full px-2 py-1 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#2EA8A8]"
    >
      <span
        className={`text-xs font-bold transition-colors ${
          !isImperial ? "text-[#2EA8A8]" : textClass + " opacity-50"
        }`}
      >
        °C
      </span>
      <div className="relative w-[48px] h-[26px] rounded-full transition-colors duration-300 bg-black/15 dark:bg-white/15">
        <div
          className={`absolute top-[3px] w-5 h-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-transform duration-300 ${
            isImperial ? "translate-x-[25px]" : "translate-x-[3px]"
          }`}
        />
      </div>
      <span
        className={`text-xs font-bold transition-colors ${
          isImperial ? "text-[#2EA8A8]" : textClass + " opacity-50"
        }`}
      >
        °F
      </span>
    </button>
  );
}

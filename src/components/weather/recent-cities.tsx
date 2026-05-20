"use client";

import { X } from "lucide-react";
import { useSettings, useWeather } from "@/components/providers";
import type { RecentCity } from "@/types/weather";

interface Props {
  onCitySelect: (city: RecentCity) => void;
}

export function RecentCities({ onCitySelect }: Props) {
  const { recentCities, clearRecentCities } = useSettings();
  const { isDarkGradient } = useWeather();

  if (recentCities.length === 0) return null;

  const textClass = isDarkGradient ? "text-[#F5F3F0]" : "text-[#292524]";
  const mutedClass = isDarkGradient ? "text-[#A8A29E]" : "text-[#A8A29E]";

  return (
    <nav aria-label="Recent cities" className="w-full max-w-md">
      <div className="flex items-center justify-between mb-2">
        <p className={`text-xs font-bold ${mutedClass}`}>Recent Cities</p>
        <button
          onClick={clearRecentCities}
          className={`text-xs hover:underline ${mutedClass}`}
          aria-label="Clear recent cities"
        >
          Clear
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {recentCities.map((city) => (
          <button
            key={`${city.lat}-${city.lon}`}
            onClick={() => onCitySelect(city)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-bold backdrop-blur-[8px] border border-white/20 bg-white/20 hover:bg-white/35 transition-all duration-200 cursor-pointer ${textClass}`}
          >
            {city.name}
            <span className={`text-[11px] font-normal ${mutedClass}`}>
              {city.country}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}

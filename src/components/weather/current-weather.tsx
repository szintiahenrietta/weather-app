"use client";

import { useRef, useCallback } from "react";
import { Droplets, Wind, Thermometer, Eye } from "lucide-react";
import { useWeather, useSettings } from "@/components/providers";
import {
  celsiusToFahrenheit,
  msToMph,
  getWindDirection,
  getGreeting,
} from "@/lib/constants";
import { AnimatedNumber } from "./animated-number";
import { WeatherIcon } from "./weather-icon";

export function CurrentWeather() {
  const { current, isDarkGradient, cityDisplayName, cityDisplayCountry } = useWeather();
  const { units } = useSettings();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 0.8;
    const rotateX = ((centerY - y) / centerY) * 0.8;

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.002)`;

    // Glare
    const glare = card.querySelector("[data-glare]") as HTMLElement;
    if (glare) {
      glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.08), transparent 60%)`;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform =
      "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)";
    card.style.transition = "transform 300ms ease-out";
    const glare = card.querySelector("[data-glare]") as HTMLElement;
    if (glare) glare.style.background = "transparent";
    setTimeout(() => {
      if (card) card.style.transition = "transform 150ms ease-out";
    }, 300);
  }, []);

  if (!current) return null;

  const temp =
    units === "imperial"
      ? celsiusToFahrenheit(current.main.temp)
      : current.main.temp;
  const feelsLike =
    units === "imperial"
      ? celsiusToFahrenheit(current.main.feels_like)
      : current.main.feels_like;
  const windSpeed =
    units === "imperial"
      ? msToMph(current.wind.speed)
      : current.wind.speed;
  const windDir = getWindDirection(current.wind.deg);
  const unitLabel = units === "imperial" ? "°F" : "°C";
  const windUnit = units === "imperial" ? "mph" : "m/s";
  const greeting = getGreeting(current.timezone);
  const textClass = isDarkGradient ? "text-[#F5F3F0]" : "text-[#292524]";
  const secondaryClass = isDarkGradient
    ? "text-[#D4CFC8]"
    : "text-[#78716C]";
  const mutedClass = isDarkGradient ? "text-[#A8A29E]" : "text-[#A8A29E]";

  const updatedAgo = getRelativeTime(current.dt);

  return (
    <div
      ref={cardRef}
      className="glass-card p-4 sm:p-5 md:p-8 w-full relative overflow-hidden"
      style={{ transition: "transform 150ms ease-out" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-label={`Current weather in ${cityDisplayName ?? current.name}`}
    >
      {/* Parallax glare overlay */}
      <div
        data-glare
        className="absolute inset-0 pointer-events-none rounded-[16px]"
        aria-hidden="true"
      />

      {/* Greeting */}
      <p className={`text-sm font-bold mb-1 ${secondaryClass}`}>
        {greeting},
      </p>

      {/* City + Country */}
      <h1
        className={`text-2xl sm:text-[30px] font-black leading-[1.2] tracking-[-0.01em] break-words ${textClass}`}
      >
        {cityDisplayName ?? current.name}
        <span className={`text-sm sm:text-base font-normal ml-2 ${secondaryClass}`}>
          {cityDisplayCountry ?? current.sys.country}
        </span>
      </h1>

      {/* Main temp + condition */}
      <div className="flex flex-wrap items-start gap-x-4 gap-y-2 mt-4">
        <div className="flex items-start">
          <span
            className={`text-[40px] sm:text-[48px] font-black leading-[1.1] tracking-[-0.02em] ${textClass}`}
          >
            <AnimatedNumber value={Math.round(temp)} />
          </span>
          <span
            className={`text-lg sm:text-xl font-bold mt-2 ${textClass}`}
          >
            {unitLabel}
          </span>
        </div>
        <div className="flex flex-col mt-2 gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <WeatherIcon
              iconCode={current.weather[0].icon}
              className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0"
            />
            <span className={`text-sm sm:text-base capitalize ${textClass} break-words`}>
              {current.weather[0].description}
            </span>
          </div>
        </div>
      </div>

      {/* Detail stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
        <StatItem
          icon={<Thermometer className="h-4 w-4" />}
          label="Feels like"
          value={
            <>
              <AnimatedNumber value={Math.round(feelsLike)} />
              {unitLabel}
            </>
          }
          textClass={textClass}
          secondaryClass={secondaryClass}
        />
        <StatItem
          icon={<Droplets className="h-4 w-4" />}
          label="Humidity"
          value={`${current.main.humidity}%`}
          textClass={textClass}
          secondaryClass={secondaryClass}
        />
        <StatItem
          icon={<Wind className="h-4 w-4" />}
          label="Wind"
          value={
            <>
              <AnimatedNumber value={Math.round(windSpeed)} /> {windUnit} {windDir}
            </>
          }
          textClass={textClass}
          secondaryClass={secondaryClass}
        />
        <StatItem
          icon={<Eye className="h-4 w-4" />}
          label="Visibility"
          value={`${(current.visibility / 1000).toFixed(1)} km`}
          textClass={textClass}
          secondaryClass={secondaryClass}
        />
      </div>

      {/* Updated timestamp */}
      <p className={`text-xs mt-4 ${mutedClass}`}>Updated {updatedAgo}</p>
    </div>
  );
}

function StatItem({
  icon,
  label,
  value,
  textClass,
  secondaryClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  textClass: string;
  secondaryClass: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className={secondaryClass}>{icon}</div>
      <div>
        <p className={`text-xs ${secondaryClass}`}>{label}</p>
        <p className={`text-sm font-bold ${textClass}`}>{value}</p>
      </div>
    </div>
  );
}

function getRelativeTime(unixTimestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - unixTimestamp;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

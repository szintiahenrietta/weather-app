"use client";

import { useWeather } from "@/components/providers";
import { GRADIENT_PALETTES, DEFAULT_GRADIENT } from "@/lib/constants";
import { WeatherParticles } from "./weather-particles";

export function WeatherBackground() {
  const { current, conditionCategory, timeOfDay } = useWeather();

  const gradient = current
    ? GRADIENT_PALETTES[conditionCategory][timeOfDay]
    : DEFAULT_GRADIENT;

  return (
    <div className="fixed inset-0 -z-10" aria-hidden="true">
      <div
        className="weather-gradient absolute inset-0"
        style={{ background: gradient }}
      />
      {current && (
        <WeatherParticles
          condition={conditionCategory}
          timeOfDay={timeOfDay}
        />
      )}
    </div>
  );
}

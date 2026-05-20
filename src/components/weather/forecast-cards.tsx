"use client";

import { useWeather, useSettings } from "@/components/providers";
import { aggregateDailyForecasts } from "@/lib/forecast-utils";
import { celsiusToFahrenheit } from "@/lib/constants";
import { AnimatedNumber } from "./animated-number";
import { WeatherIcon } from "./weather-icon";

export function ForecastCards() {
  const { forecast, current, isDarkGradient } = useWeather();
  const { units } = useSettings();

  if (!forecast || !current) return null;

  const daily = aggregateDailyForecasts(
    forecast.list,
    forecast.city.timezone
  );

  const unitLabel = units === "imperial" ? "°F" : "°C";
  const textClass = isDarkGradient ? "text-[#F5F3F0]" : "text-[#292524]";
  const secondaryClass = isDarkGradient
    ? "text-[#D4CFC8]"
    : "text-[#78716C]";

  return (
    <section aria-label="5-day forecast">
      <h2
        className={`text-xl sm:text-2xl font-bold leading-[1.3] mb-3 sm:mb-4 ${textClass}`}
      >
        5-Day Forecast
      </h2>
      {/* On narrow screens: horizontal scroll snap. On sm+: 5-col grid. */}
      <div
        className="flex sm:grid sm:grid-cols-5 gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory sm:overflow-visible -mx-3 px-3 sm:mx-0 sm:px-0 pb-1 sm:pb-0"
        style={{ scrollbarWidth: "none" }}
      >
        {daily.map((day) => {
          const high =
            units === "imperial"
              ? celsiusToFahrenheit(day.high)
              : day.high;
          const low =
            units === "imperial"
              ? celsiusToFahrenheit(day.low)
              : day.low;

          return (
            <div
              key={day.dayLabel}
              className="glass-card p-3 flex flex-col items-center gap-2 text-center snap-start flex-shrink-0 w-[7.5rem] sm:w-auto"
            >
              <p className={`text-sm font-bold ${textClass}`}>
                {day.dayLabel}
              </p>
              <WeatherIcon
                iconCode={day.condition.icon.replace("n", "d")}
                className="w-10 h-10"
              />
              <p className={`text-xs capitalize ${secondaryClass}`}>
                {day.condition.description}
              </p>
              <div className="flex gap-2 items-baseline">
                <span className={`text-sm font-bold ${textClass}`}>
                  <AnimatedNumber value={Math.round(high)} />
                  {unitLabel}
                </span>
                <span className={`text-xs ${secondaryClass}`}>
                  <AnimatedNumber value={Math.round(low)} />
                  {unitLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

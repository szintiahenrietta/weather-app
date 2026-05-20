"use client";

import { Sunrise, Sunset } from "lucide-react";
import { useWeather } from "@/components/providers";

export function SunriseSunset() {
  const { current, cityDisplayName, isDarkGradient } = useWeather();

  if (!current) return null;

  const { sunrise, sunset } = current.sys;
  const tz = current.timezone;
  const now = current.dt;

  const sunriseLocal = formatTime(sunrise, tz);
  const sunsetLocal = formatTime(sunset, tz);
  const nowLocal = formatTime(now, tz);

  // Calculate sun position as percentage through the day
  const dayLength = sunset - sunrise;
  let sunPosition = 0;
  if (now >= sunrise && now <= sunset) {
    sunPosition = ((now - sunrise) / dayLength) * 100;
  } else if (now > sunset) {
    sunPosition = 100;
  }

  const isDay = now >= sunrise && now <= sunset;

  // Golden hour: first/last ~30 min of daylight
  const goldenMorningEnd = Math.min(
    ((30 * 60) / dayLength) * 100,
    15
  );
  const goldenEveningStart = Math.max(
    100 - ((30 * 60) / dayLength) * 100,
    85
  );

  // Golden hour absolute time (30 min before sunset)
  const goldenHourStart = sunset - 30 * 60;
  const goldenHourPosition = Math.max(
    ((goldenHourStart - sunrise) / dayLength) * 100,
    0
  );

  // Time until golden hour
  const secondsUntilGolden = goldenHourStart - now;
  let goldenHourLabel = "";
  if (secondsUntilGolden > 0 && isDay) {
    const h = Math.floor(secondsUntilGolden / 3600);
    const m = Math.floor((secondsUntilGolden % 3600) / 60);
    if (h > 0 && m > 0) {
      goldenHourLabel = `Golden hour in ${h}h ${m}m`;
    } else if (h > 0) {
      goldenHourLabel = `Golden hour in ${h}h`;
    } else {
      goldenHourLabel = `Golden hour in ${m}m`;
    }
  } else if (now >= goldenHourStart && now <= sunset) {
    goldenHourLabel = "Golden hour now";
  }

  const textClass = isDarkGradient ? "text-[#F5F3F0]" : "text-[#292524]";
  const secondaryClass = isDarkGradient
    ? "text-[#D4CFC8]"
    : "text-[#78716C]";
  const mutedClass = isDarkGradient ? "text-[#A8A29E]" : "text-[#A8A29E]";

  // Time until sunset/sunrise for SR
  const timeUntilSunset = sunset - now;
  const hoursUntil = Math.floor(Math.abs(timeUntilSunset) / 3600);
  const srDescription = isDay
    ? `Sun rose at ${sunriseLocal}, sets at ${sunsetLocal}, currently ${hoursUntil} hour${hoursUntil !== 1 ? "s" : ""} before sunset`
    : `Sun set at ${sunsetLocal}, rises at ${sunriseLocal}`;

  return (
    <section aria-label="Sunrise and sunset timeline">
      <h2
        className={`text-xl sm:text-2xl font-bold leading-[1.3] mb-3 sm:mb-4 ${textClass}`}
      >
        Sunrise & Sunset
      </h2>
      <div
        className="glass-card p-3 sm:p-4 md:p-5"
        role="img"
        aria-label={srDescription}
      >
        {/* Labels */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sunrise className={`h-5 w-5 text-[#F6A06B]`} />
            <div>
              <p className={`text-xs ${mutedClass}`}>Sunrise</p>
              <p className={`text-sm font-bold ${textClass}`}>
                {sunriseLocal}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className={`text-xs ${mutedClass}`}>Sunset</p>
              <p className={`text-sm font-bold ${textClass}`}>
                {sunsetLocal}
              </p>
            </div>
            <Sunset className={`h-5 w-5 text-[#F6A06B]`} />
          </div>
        </div>

        {/* Timeline bar */}
        <div className="relative h-3 rounded-full bg-black/10 dark:bg-white/10">
          <div className="absolute inset-0 rounded-full overflow-hidden">
          {/* Golden hour - morning */}
          <div
            className="absolute top-0 bottom-0 rounded-l-full"
            style={{
              left: "0%",
              width: `${goldenMorningEnd}%`,
              background:
                "linear-gradient(90deg, rgba(246,160,107,0.4), rgba(246,160,107,0.1))",
            }}
          />
          {/* Golden hour - evening */}
          <div
            className="absolute top-0 bottom-0 rounded-r-full"
            style={{
              left: `${goldenEveningStart}%`,
              width: `${100 - goldenEveningStart}%`,
              background:
                "linear-gradient(90deg, rgba(246,160,107,0.1), rgba(246,160,107,0.4))",
            }}
          />
          {/* Day progress fill */}
          <div
            className="absolute top-0 bottom-0 left-0 rounded-full transition-all duration-500"
            style={{
              width: `${sunPosition}%`,
              background:
                "linear-gradient(90deg, #F6A06B, #FDE8A0, #F6A06B)",
            }}
          />
          </div>
          {/* Golden hour dot */}
          {isDay && (
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white/90 border-2 border-[#F6A06B] z-10 transition-all duration-500"
              style={{ left: `${goldenHourPosition}%`, marginLeft: "-6px" }}
              title="Golden hour"
            />
          )}
          {/* Sun indicator */}
          {isDay && (
            <div
              className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#FDE8A0] border-2 border-[#F6A06B] shadow-[0_0_8px_rgba(246,160,107,0.5)] z-20 transition-all duration-500"
              style={{ left: `${sunPosition}%`, marginLeft: "-10px" }}
            />
          )}
        </div>

        {/* Local time note & golden hour */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 mt-2">
          <p className={`text-xs font-medium ${secondaryClass}`}>
            Local time in {cityDisplayName ?? current.name} {nowLocal}
          </p>
          {goldenHourLabel && (
            <p className={`text-xs font-medium ${secondaryClass}`}>
              {goldenHourLabel}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function formatTime(unixTimestamp: number, timezoneOffset: number): string {
  const date = new Date((unixTimestamp + timezoneOffset) * 1000);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  return `${h}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

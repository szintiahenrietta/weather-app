import type { WeatherConditionCategory } from "@/types/weather";

/* ============================================
   Weather Condition Code Mapping
   ============================================ */

/**
 * Maps OpenWeatherMap condition IDs to our app categories.
 * See: https://openweathermap.org/weather-conditions
 */
export function getConditionCategory(
  conditionId: number
): WeatherConditionCategory {
  if (conditionId >= 200 && conditionId < 300) return "thunderstorm";
  if (conditionId >= 300 && conditionId < 400) return "rain"; // drizzle → rain
  if (conditionId >= 500 && conditionId < 600) return "rain";
  if (conditionId >= 600 && conditionId < 700) return "snow";
  if (conditionId >= 700 && conditionId < 800) return "fog"; // mist, smoke, haze, etc.
  if (conditionId === 800) return "clear";
  if (conditionId === 801) return "partly-cloudy";
  if (conditionId >= 802) return "cloudy";
  return "clear"; // fallback
}

/* ============================================
   Gradient Palettes
   ============================================ */

export const GRADIENT_PALETTES: Record<
  WeatherConditionCategory,
  { day: string; night: string }
> = {
  clear: {
    day: "linear-gradient(135deg, #F6A06B 0%, #F7C97E 30%, #FDE8A0 60%, #87CEEB 100%)",
    night:
      "linear-gradient(135deg, #0D1B2A 0%, #1B2838 30%, #2A3A50 60%, #162440 100%)",
  },
  "partly-cloudy": {
    day: "linear-gradient(135deg, #E8C580 0%, #D4B88C 30%, #C8D0D8 60%, #A8C4D8 100%)",
    night:
      "linear-gradient(135deg, #1A2540 0%, #2D3A5C 30%, #3E4F7A 60%, #1E2D48 100%)",
  },
  cloudy: {
    day: "linear-gradient(135deg, #B0B8C0 0%, #C4CAD0 30%, #D8DCE0 60%, #C0C8CE 100%)",
    night:
      "linear-gradient(135deg, #1C2230 0%, #282E3C 30%, #343A48 60%, #222836 100%)",
  },
  rain: {
    day: "linear-gradient(135deg, #7A8A9A 0%, #8E9EAE 30%, #A0B0BE 60%, #6A7A8A 100%)",
    night:
      "linear-gradient(135deg, #141E2A 0%, #1E2A38 30%, #283648 60%, #182430 100%)",
  },
  thunderstorm: {
    day: "linear-gradient(135deg, #4A4A6A 0%, #5C5C7E 30%, #3E3E5A 60%, #6E5E7A 100%)",
    night:
      "linear-gradient(135deg, #0D0D1A 0%, #1A1A3E 30%, #2E1A3E 60%, #0A0A14 100%)",
  },
  snow: {
    day: "linear-gradient(135deg, #D8E4F0 0%, #E8EEF4 30%, #F0F4F8 60%, #C8D8E8 100%)",
    night:
      "linear-gradient(135deg, #1A2030 0%, #252D3C 30%, #303848 60%, #1E2636 100%)",
  },
  fog: {
    day: "linear-gradient(135deg, #C8C4BE 0%, #D8D4CE 30%, #E0DCD6 60%, #CAC6C0 100%)",
    night:
      "linear-gradient(135deg, #1C1E24 0%, #24262C 30%, #2C2E34 60%, #202228 100%)",
  },
};

/** Default gradient for empty state (warm neutral) */
export const DEFAULT_GRADIENT =
  "linear-gradient(135deg, #F6A06B 0%, #F7C97E 30%, #FDE8A0 60%, #87CEEB 100%)";

/* ============================================
   Conditions that trigger dark gradient text override
   ============================================ */

export const DARK_GRADIENT_CONDITIONS: Set<WeatherConditionCategory> = new Set([
  "thunderstorm",
  "rain",
]);

/* ============================================
   Condition Severity (for forecast aggregation)
   ============================================ */

/** Higher number = more severe */
export const CONDITION_SEVERITY: Record<WeatherConditionCategory, number> = {
  clear: 0,
  "partly-cloudy": 1,
  cloudy: 2,
  fog: 3,
  rain: 4,
  snow: 5,
  thunderstorm: 6,
};

/* ============================================
   Wind Direction
   ============================================ */

export function getWindDirection(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

/* ============================================
   Unit Conversions (API always returns metric)
   ============================================ */

export function celsiusToFahrenheit(celsius: number): number {
  return celsius * (9 / 5) + 32;
}

export function msToMph(ms: number): number {
  return ms * 2.237;
}

/* ============================================
   Time Helpers
   ============================================ */

export function getTimeOfDay(
  currentDt: number,
  sunrise: number,
  sunset: number
): "day" | "night" {
  return currentDt >= sunrise && currentDt < sunset ? "day" : "night";
}

export function getGreeting(timezoneOffset: number): string {
  const utcNow = new Date();
  const localHour =
    (utcNow.getUTCHours() + timezoneOffset / 3600 + 24) % 24;

  if (localHour >= 5 && localHour < 12) return "Good morning";
  if (localHour >= 12 && localHour < 17) return "Good afternoon";
  if (localHour >= 17 && localHour < 21) return "Good evening";
  return "Good night";
}

/* ============================================
   localStorage Keys & Persistence
   ============================================ */

export const STORAGE_KEYS = {
  UNIT_PREFERENCE: "weather-app-units",
  RECENT_CITIES: "weather-app-recent-cities",
  DARK_MODE: "weather-app-dark-mode",
  DATA_VERSION: "weather-app-version",
} as const;

export const CURRENT_DATA_VERSION = "1";
export const MAX_RECENT_CITIES = 5;

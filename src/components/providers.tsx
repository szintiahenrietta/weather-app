"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type {
  OWMCurrentWeather,
  OWMForecastResponse,
  UnitSystem,
  RecentCity,
  WeatherConditionCategory,
  TimeOfDay,
} from "@/types/weather";
import { getCurrentWeather, getForecast } from "@/lib/api";
import {
  getConditionCategory,
  getTimeOfDay,
  DARK_GRADIENT_CONDITIONS,
  STORAGE_KEYS,
  CURRENT_DATA_VERSION,
  MAX_RECENT_CITIES,
} from "@/lib/constants";
import { useLocalStorage } from "@/hooks/use-local-storage";

/* ============================================
   Weather Context
   ============================================ */

interface WeatherContextValue {
  current: OWMCurrentWeather | null;
  forecast: OWMForecastResponse | null;
  loading: boolean;
  error: string | null;
  loadWeather: (lat: number, lon: number, cityName?: string, cityCountry?: string) => Promise<void>;
  cityDisplayName: string | null;
  cityDisplayCountry: string | null;
  conditionCategory: WeatherConditionCategory;
  timeOfDay: TimeOfDay;
  isDarkGradient: boolean;
}

const WeatherContext = createContext<WeatherContextValue | null>(null);

export function useWeather() {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error("useWeather must be used within WeatherProvider");
  return ctx;
}

/* ============================================
   Settings Context
   ============================================ */

interface SettingsContextValue {
  units: UnitSystem;
  toggleUnits: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  recentCities: RecentCity[];
  addRecentCity: (city: RecentCity) => void;
  clearRecentCities: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx)
    throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

/* ============================================
   Combined Provider
   ============================================ */

export function AppProviders({ children }: { children: ReactNode }) {
  // Data version check
  useEffect(() => {
    try {
      const version = localStorage.getItem(STORAGE_KEYS.DATA_VERSION);
      if (version !== CURRENT_DATA_VERSION) {
        localStorage.removeItem(STORAGE_KEYS.UNIT_PREFERENCE);
        localStorage.removeItem(STORAGE_KEYS.RECENT_CITIES);
        localStorage.removeItem(STORAGE_KEYS.DARK_MODE);
        localStorage.setItem(STORAGE_KEYS.DATA_VERSION, CURRENT_DATA_VERSION);
      }
    } catch {
      // silent
    }
  }, []);

  return (
    <SettingsProvider>
      <WeatherProvider>{children}</WeatherProvider>
    </SettingsProvider>
  );
}

/* ============================================
   Settings Provider
   ============================================ */

function SettingsProvider({ children }: { children: ReactNode }) {
  const [units, setUnits] = useLocalStorage<UnitSystem>(
    STORAGE_KEYS.UNIT_PREFERENCE,
    "metric"
  );
  const [darkMode, setDarkMode] = useLocalStorage<boolean>(
    STORAGE_KEYS.DARK_MODE,
    false
  );
  const [recentCities, setRecentCities] = useLocalStorage<RecentCity[]>(
    STORAGE_KEYS.RECENT_CITIES,
    []
  );

  // Sync dark mode class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const toggleUnits = useCallback(() => {
    setUnits((prev) => (prev === "metric" ? "imperial" : "metric"));
  }, [setUnits]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, [setDarkMode]);

  const addRecentCity = useCallback(
    (city: RecentCity) => {
      setRecentCities((prev) => {
        const filtered = prev.filter(
          (c) =>
            !(
              c.lat.toFixed(2) === city.lat.toFixed(2) &&
              c.lon.toFixed(2) === city.lon.toFixed(2)
            )
        );
        return [city, ...filtered].slice(0, MAX_RECENT_CITIES);
      });
    },
    [setRecentCities]
  );

  const clearRecentCities = useCallback(() => {
    setRecentCities([]);
  }, [setRecentCities]);

  return (
    <SettingsContext.Provider
      value={{
        units,
        toggleUnits,
        darkMode,
        toggleDarkMode,
        recentCities,
        addRecentCity,
        clearRecentCities,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

/* ============================================
   Weather Provider
   ============================================ */

function WeatherProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<OWMCurrentWeather | null>(null);
  const [forecast, setForecast] = useState<OWMForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cityDisplayName, setCityDisplayName] = useState<string | null>(null);
  const [cityDisplayCountry, setCityDisplayCountry] = useState<string | null>(null);
  const { darkMode } = useSettings();

  const loadWeather = useCallback(async (lat: number, lon: number, cityName?: string, cityCountry?: string) => {
    setLoading(true);
    setError(null);
    setCityDisplayName(cityName ?? null);
    setCityDisplayCountry(cityCountry ?? null);
    try {
      const [currentData, forecastData] = await Promise.all([
        getCurrentWeather(lat, lon),
        getForecast(lat, lon),
      ]);
      setCurrent(currentData);
      setForecast(forecastData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const conditionCategory: WeatherConditionCategory = current
    ? getConditionCategory(current.weather[0].id)
    : "clear";

  const timeOfDay: TimeOfDay = current
    ? darkMode
      ? "night"
      : getTimeOfDay(current.dt, current.sys.sunrise, current.sys.sunset)
    : darkMode
      ? "night"
      : "day";

  const isDarkGradient =
    timeOfDay === "night" || DARK_GRADIENT_CONDITIONS.has(conditionCategory);

  return (
    <WeatherContext.Provider
      value={{
        current,
        forecast,
        loading,
        error,
        loadWeather,
        cityDisplayName,
        cityDisplayCountry,
        conditionCategory,
        timeOfDay,
        isDarkGradient,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

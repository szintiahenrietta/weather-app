"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppProviders, useWeather, useSettings } from "@/components/providers";
import { WeatherBackground } from "@/components/weather/weather-background";
import { CitySearch } from "@/components/weather/city-search";
import { CurrentWeather } from "@/components/weather/current-weather";
import { ForecastCards } from "@/components/weather/forecast-cards";
import { TemperatureChart } from "@/components/weather/temperature-chart";
import { SunriseSunset } from "@/components/weather/sunrise-sunset";
import { UnitToggle } from "@/components/weather/unit-toggle";
import { DarkModeToggle } from "@/components/weather/dark-mode-toggle";
import { RecentCities } from "@/components/weather/recent-cities";
import { WeatherSkeleton } from "@/components/weather/skeleton-loading";
import { ErrorDisplay } from "@/components/weather/error-display";
import { useDynamicFavicon } from "@/hooks/use-dynamic-favicon";
import { useGeolocation } from "@/hooks/use-geolocation";
import type { OWMGeocodingResult, RecentCity } from "@/types/weather";

export default function Home() {
  return (
    <AppProviders>
      <WeatherApp />
    </AppProviders>
  );
}

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

function WeatherApp() {
  const { current, loading, error, loadWeather, conditionCategory, isDarkGradient } =
    useWeather();
  const { addRecentCity } = useSettings();
  const geo = useGeolocation();
  const geoAttempted = useRef(false);
  const lastCoordsRef = useRef<{ lat: number; lon: number } | null>(null);

  useDynamicFavicon(current ? conditionCategory : null);

  // Request geolocation on mount
  useEffect(() => {
    if (!geoAttempted.current) {
      geoAttempted.current = true;
      geo.requestLocation();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load weather when geolocation resolves
  useEffect(() => {
    if (geo.coords && !current && !loading) {
      loadWeather(geo.coords.lat, geo.coords.lon);
      lastCoordsRef.current = geo.coords;
    }
  }, [geo.coords]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCitySelect = useCallback(
    (city: OWMGeocodingResult | RecentCity) => {
      loadWeather(city.lat, city.lon, city.name, city.country);
      lastCoordsRef.current = { lat: city.lat, lon: city.lon };
      addRecentCity({
        name: city.name,
        country: city.country,
        lat: city.lat,
        lon: city.lon,
      });
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [loadWeather, addRecentCity]
  );

  const handleRetry = useCallback(() => {
    if (lastCoordsRef.current) {
      loadWeather(lastCoordsRef.current.lat, lastCoordsRef.current.lon);
    }
  }, [loadWeather]);

  const textClass = isDarkGradient ? "text-[#F5F3F0]" : "text-[#292524]";
  const secondaryClass = isDarkGradient ? "text-[#D4CFC8]" : "text-[#78716C]";
  const hasWeather = !!current;

  return (
    <div className="relative flex flex-1 flex-col min-h-screen">
      <WeatherBackground />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-[8px] bg-white/10 dark:bg-black/10 border-b border-white/10">
        <div className="max-w-[880px] mx-auto flex items-center gap-2 sm:gap-3 px-3 py-3 sm:px-4 md:px-8">
          <div className="flex-1 min-w-0">
            <CitySearch onCitySelect={handleCitySelect} />
          </div>
          <UnitToggle />
          <DarkModeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center px-3 py-6 sm:px-4 sm:py-8 md:px-8">
        <div className="w-full max-w-[880px]">
          <AnimatePresence mode="wait">
            {loading && !current ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <WeatherSkeleton />
              </motion.div>
            ) : hasWeather ? (
              <motion.div
                key={`weather-${current.id}`}
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="space-y-6 sm:space-y-8"
              >
                <motion.div variants={fadeUp}>
                  <CurrentWeather />
                </motion.div>
                <motion.div variants={fadeUp}>
                  <ForecastCards />
                </motion.div>
                <motion.div variants={fadeUp}>
                  <TemperatureChart />
                </motion.div>
                <motion.div variants={fadeUp}>
                  <SunriseSunset />
                </motion.div>
                <motion.div variants={fadeUp}>
                  <RecentCities onCitySelect={handleCitySelect} />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center gap-5 pt-16 md:pt-32 text-center"
              >
                {error ? (
                  <ErrorDisplay onRetry={handleRetry} />
                ) : (
                  <>
                    <p className={`text-base sm:text-lg ${secondaryClass} max-w-xs sm:max-w-sm`}>
                      Search for a city above to see the weather.
                    </p>
                    {geo.loading && (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full border-2 border-[#2EA8A8] border-t-transparent animate-spin" />
                        <p className={`text-sm ${secondaryClass}`}>
                          Trying to find your location…
                        </p>
                      </div>
                    )}
                    {!geo.loading && geo.error === "insecure" && (
                      <p className={`text-xs ${secondaryClass} max-w-xs`}>
                        Location detection needs HTTPS. Use the search above,
                        or open the app over a secure connection.
                      </p>
                    )}
                    {!geo.loading &&
                      geo.error &&
                      geo.error !== "denied" &&
                      geo.error !== "insecure" && (
                        <p className={`text-xs ${secondaryClass} max-w-xs`}>
                          {geo.error}
                        </p>
                      )}
                  </>
                )}
                <RecentCities onCitySelect={handleCitySelect} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error banner when we already have data */}
          {error && current && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <ErrorDisplay onRetry={handleRetry} />
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

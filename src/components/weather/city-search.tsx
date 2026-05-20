"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Clock } from "lucide-react";
import { searchCities } from "@/lib/api";
import type { OWMGeocodingResult, RecentCity } from "@/types/weather";
import { useWeather, useSettings } from "@/components/providers";

interface Props {
  onCitySelect: (city: OWMGeocodingResult) => void;
}

export function CitySearch({ onCitySelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OWMGeocodingResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searching, setSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const { isDarkGradient } = useWeather();
  const { recentCities } = useSettings();
  const [showRecent, setShowRecent] = useState(false);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      setNoResults(false);
      return;
    }
    setSearching(true);
    setNoResults(false);
    try {
      const data = await searchCities(q);
      setResults(data);
      setIsOpen(true);
      setNoResults(data.length === 0);
      setActiveIndex(-1);
    } catch {
      setResults([]);
      setNoResults(true);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowRecent(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 300);
  };

  const selectCity = (city: OWMGeocodingResult | RecentCity) => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setShowRecent(false);
    setNoResults(false);
    onCitySelect(city as OWMGeocodingResult);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectCity(results[activeIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setShowRecent(false);
      inputRef.current?.blur();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setShowRecent(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div
        className={`flex items-center gap-3 rounded-[14px] backdrop-blur-[12px] border px-4 py-3 transition-all duration-200
          ${
            isOpen
              ? "border-[#2EA8A8] shadow-[0_0_0_3px_rgba(46,168,168,0.2)] bg-white/30"
              : "border-white/30 bg-white/20"
          }`}
      >
        <Search
          className={`h-5 w-5 flex-shrink-0 ${isDarkGradient ? "text-[#D4CFC8]" : "text-[#78716C]"}`}
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="city-search-listbox"
          aria-activedescendant={
            activeIndex >= 0 ? `city-option-${activeIndex}` : undefined
          }
          aria-autocomplete="list"
          aria-label="Search for a city"
          placeholder="Search for a city..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) {
              setIsOpen(true);
            } else if (!query && recentCities.length > 0) {
              setShowRecent(true);
            }
          }}
          onBlur={() => {
            // Delay to allow click events on dropdown items to fire first
            setTimeout(() => {
              if (!containerRef.current?.contains(document.activeElement)) {
                setShowRecent(false);
                setIsOpen(false);
              }
            }, 150);
          }}
          className={`flex-1 bg-transparent outline-none rounded-md focus-visible:ring-[3px] focus-visible:ring-[#2EA8A8] text-base placeholder:text-[var(--w-text-muted)] ${isDarkGradient ? "text-[#F5F3F0]" : "text-[#292524]"}`}
          style={{ fontSize: "16px" }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
              setNoResults(false);
              inputRef.current?.focus();
            }}
            className={`flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EA8A8] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${isDarkGradient ? "text-[#D4CFC8]" : "text-[#78716C]"}`}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {searching && (
          <div
            className="h-4 w-4 flex-shrink-0 rounded-full border-2 border-[#2EA8A8] border-t-transparent animate-spin"
            aria-label="Searching..."
          />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-1 w-full z-50">
          <div className="rounded-xl bg-white/85 dark:bg-[#292524]/95 backdrop-blur-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/30 overflow-hidden">
            {noResults ? (
              <div className="px-4 py-3 text-sm text-[#78716C]">
                No cities found — check spelling or try a different name.
              </div>
            ) : (
              <ul
                ref={listRef}
                id="city-search-listbox"
                role="listbox"
                aria-label="City suggestions"
                className="max-h-60 overflow-y-auto"
              >
                {results.map((city, i) => (
                  <li
                    key={`${city.lat}-${city.lon}-${i}`}
                    id={`city-option-${i}`}
                    role="option"
                    aria-selected={i === activeIndex}
                    onClick={() => selectCity(city)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`px-4 py-3 cursor-pointer text-sm transition-colors
                      ${i === activeIndex ? "bg-[#E6F7F7] dark:bg-[rgba(46,168,168,0.15)]" : "hover:bg-black/5 dark:hover:bg-white/5"}
                      ${i > 0 ? "border-t border-black/5 dark:border-white/10" : ""}`}
                  >
                    <span className="font-bold text-[#292524] dark:text-[#F5F3F0]">
                      {city.name}
                    </span>
                    <span className="text-[#78716C] dark:text-[#A8A29E] ml-1">
                      {city.state ? `${city.state}, ` : ""}
                      {city.country}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Recent cities dropdown */}
      {showRecent && !isOpen && recentCities.length > 0 && (
        <div className="absolute top-full mt-1 w-full z-50">
          <div className="rounded-xl bg-white/85 dark:bg-[#292524]/95 backdrop-blur-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/30 overflow-hidden">
            <div className="px-4 py-2 border-b border-black/5 dark:border-white/10">
              <p className="text-xs font-bold text-[#A8A29E]">Recent Cities</p>
            </div>
            <ul role="listbox" aria-label="Recent cities">
              {recentCities.map((city, i) => (
                <li
                  key={`${city.lat}-${city.lon}`}
                  role="option"
                  aria-selected={false}
                  onClick={() => selectCity(city)}
                  className={`px-4 py-3 cursor-pointer text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2
                    ${i > 0 ? "border-t border-black/5 dark:border-white/10" : ""}`}
                >
                  <Clock className="h-3.5 w-3.5 text-[#A8A29E] flex-shrink-0" />
                  <span className="font-bold text-[#292524] dark:text-[#F5F3F0]">
                    {city.name}
                  </span>
                  <span className="text-[#78716C] dark:text-[#A8A29E]">
                    {city.country}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Screen reader announcement */}
      {isOpen && results.length > 0 && (
        <div className="sr-only" role="status" aria-live="polite">
          {results.length} city suggestion{results.length !== 1 ? "s" : ""}{" "}
          available.
        </div>
      )}
    </div>
  );
}

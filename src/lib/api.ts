import type {
  OWMCurrentWeather,
  OWMForecastResponse,
  OWMGeocodingResult,
} from "@/types/weather";

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
const BASE_URL = "https://api.openweathermap.org";

/* ============================================
   In-Memory Cache (10-minute TTL)
   ============================================ */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/* ============================================
   API Functions
   ============================================ */

async function fetchWithErrorHandling<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error(
        "We're checking the weather a bit too fast! Give it a moment and try again."
      );
    }
    if (response.status === 401) {
      throw new Error("Invalid API key. Please check your configuration.");
    }
    throw new Error("Something went wrong. Try again.");
  }

  return response.json();
}

export async function getCurrentWeather(
  lat: number,
  lon: number
): Promise<OWMCurrentWeather> {
  const cacheKey = `current-${lat.toFixed(4)}-${lon.toFixed(4)}`;
  const cached = getCached<OWMCurrentWeather>(cacheKey);
  if (cached) return cached;

  const url = `${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  const data = await fetchWithErrorHandling<OWMCurrentWeather>(url);
  setCache(cacheKey, data);
  return data;
}

export async function getForecast(
  lat: number,
  lon: number
): Promise<OWMForecastResponse> {
  const cacheKey = `forecast-${lat.toFixed(4)}-${lon.toFixed(4)}`;
  const cached = getCached<OWMForecastResponse>(cacheKey);
  if (cached) return cached;

  const url = `${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  const data = await fetchWithErrorHandling<OWMForecastResponse>(url);
  setCache(cacheKey, data);
  return data;
}

interface OpenMeteoGeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
}

interface OpenMeteoGeocodingResponse {
  results?: OpenMeteoGeocodingResult[];
}

async function searchOpenMeteo(query: string): Promise<OWMGeocodingResult[]> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const json: OpenMeteoGeocodingResponse = await response.json();
    return (json.results ?? []).map((r) => ({
      name: r.name,
      lat: r.latitude,
      lon: r.longitude,
      country: r.country_code ?? r.country ?? "",
      state: r.admin1,
    }));
  } catch {
    return [];
  }
}

async function searchOWM(query: string): Promise<OWMGeocodingResult[]> {
  try {
    const url = `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    return (await response.json()) as OWMGeocodingResult[];
  } catch {
    return [];
  }
}

export async function searchCities(
  query: string
): Promise<OWMGeocodingResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const cacheKey = `geo-${trimmed.toLowerCase()}`;
  const cached = getCached<OWMGeocodingResult[]>(cacheKey);
  if (cached) return cached;

  // Query both providers in parallel:
  // - Open-Meteo supports prefix matching ("Budape" → "Budapest")
  // - OpenWeatherMap has broader coverage of smaller localities
  const [openMeteoResults, owmResults] = await Promise.all([
    searchOpenMeteo(trimmed),
    searchOWM(trimmed),
  ]);

  // Merge, deduplicating by approximate coordinates + name.
  const seen = new Set<string>();
  const merged: OWMGeocodingResult[] = [];
  for (const city of [...openMeteoResults, ...owmResults]) {
    const key = `${city.name.toLowerCase()}-${city.lat.toFixed(2)}-${city.lon.toFixed(2)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(city);
  }

  setCache(cacheKey, merged);
  return merged;
}

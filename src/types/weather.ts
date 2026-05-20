/* ============================================
   OpenWeatherMap API Response Types
   ============================================ */

export interface OWMCoordinates {
  lat: number;
  lon: number;
}

export interface OWMWeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface OWMCurrentWeather {
  coord: OWMCoordinates;
  weather: OWMWeatherCondition[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
}

export interface OWMForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: OWMWeatherCondition[];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  visibility: number;
  pop: number;
  dt_txt: string;
}

export interface OWMForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: OWMForecastItem[];
  city: {
    id: number;
    name: string;
    coord: OWMCoordinates;
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export interface OWMGeocodingResult {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

/* ============================================
   App-Level Types
   ============================================ */

export type UnitSystem = "metric" | "imperial";

export type WeatherConditionCategory =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "rain"
  | "thunderstorm"
  | "snow"
  | "fog";

export type TimeOfDay = "day" | "night";

export interface DailyForecast {
  date: Date;
  dayLabel: string;
  high: number;
  low: number;
  condition: OWMWeatherCondition;
  conditionCategory: WeatherConditionCategory;
}

export interface RecentCity {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export interface WeatherData {
  current: OWMCurrentWeather;
  forecast: OWMForecastResponse;
}

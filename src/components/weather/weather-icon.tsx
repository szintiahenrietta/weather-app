import {
  Sun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudSnow,
  CloudFog,
  CloudSun,
  Moon,
  CloudMoon,
} from "lucide-react";

interface WeatherIconProps {
  iconCode: string;
  className?: string;
}

const iconMap: Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  // Day icons
  "01d": Sun,
  "02d": CloudSun,
  "03d": Cloud,
  "04d": Cloud,
  "09d": CloudDrizzle,
  "10d": CloudRain,
  "11d": CloudLightning,
  "13d": CloudSnow,
  "50d": CloudFog,
  // Night icons
  "01n": Moon,
  "02n": CloudMoon,
  "03n": Cloud,
  "04n": Cloud,
  "09n": CloudDrizzle,
  "10n": CloudRain,
  "11n": CloudLightning,
  "13n": CloudSnow,
  "50n": CloudFog,
};

const colorMap: Record<string, string> = {
  "01d": "#F6A06B",
  "02d": "#A8A29E",
  "03d": "#A8A29E",
  "04d": "#78716C",
  "09d": "#87CEEB",
  "10d": "#87CEEB",
  "11d": "#D69E2E",
  "13d": "#B0C4DE",
  "50d": "#A8A29E",
  "01n": "#D4CFC8",
  "02n": "#A8A29E",
  "03n": "#A8A29E",
  "04n": "#78716C",
  "09n": "#87CEEB",
  "10n": "#87CEEB",
  "11n": "#D69E2E",
  "13n": "#B0C4DE",
  "50n": "#A8A29E",
};

export function WeatherIcon({ iconCode, className = "w-10 h-10" }: WeatherIconProps) {
  const Icon = iconMap[iconCode] ?? Cloud;
  const color = colorMap[iconCode] ?? "#A8A29E";

  return <Icon className={className} style={{ color }} />;
}

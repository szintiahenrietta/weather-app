"use client";

import { useEffect } from "react";
import type { WeatherConditionCategory } from "@/types/weather";

const FAVICON_EMOJIS: Record<WeatherConditionCategory, string> = {
  clear: "☀️",
  "partly-cloudy": "⛅",
  cloudy: "☁️",
  rain: "🌧️",
  thunderstorm: "⛈️",
  snow: "🌨️",
  fog: "🌫️",
};

export function useDynamicFavicon(condition: WeatherConditionCategory | null) {
  useEffect(() => {
    if (!condition) return;

    const emoji = FAVICON_EMOJIS[condition];
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.font = "28px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, 16, 18);

    const url = canvas.toDataURL("image/png");
    let link = document.querySelector(
      "link[rel='icon']"
    ) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = url;
  }, [condition]);
}

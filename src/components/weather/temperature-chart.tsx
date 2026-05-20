"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Area,
  ComposedChart,
  type LabelProps,
} from "recharts";
import { useWeather, useSettings } from "@/components/providers";
import { aggregateDailyForecasts } from "@/lib/forecast-utils";
import { celsiusToFahrenheit } from "@/lib/constants";

function useIsNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return narrow;
}

export function TemperatureChart() {
  const { forecast, current, isDarkGradient } = useWeather();
  const { units } = useSettings();
  const isNarrow = useIsNarrow();

  if (!forecast || !current) return null;

  const daily = aggregateDailyForecasts(
    forecast.list,
    forecast.city.timezone
  );

  const unitLabel = units === "imperial" ? "°F" : "°C";
  const textClass = isDarkGradient ? "text-[#F5F3F0]" : "text-[#292524]";
  const axisColor = isDarkGradient ? "#D4CFC8" : "#78716C";
  const gridColor = isDarkGradient
    ? "rgba(255,255,255,0.1)"
    : "rgba(0,0,0,0.08)";

  const data = daily.map((day) => ({
    day: day.dayLabel,
    high: Math.round(
      units === "imperial" ? celsiusToFahrenheit(day.high) : day.high
    ),
    low: Math.round(
      units === "imperial" ? celsiusToFahrenheit(day.low) : day.low
    ),
  }));

  const dataLen = data.length;

  // Find value ranges to detect when labels are near chart edges
  const allHighs = data.map((d) => d.high);
  const allLows = data.map((d) => d.low);
  const maxVal = Math.max(...allHighs);
  const minVal = Math.min(...allLows);
  const valRange = maxVal - minVal || 1;

  const edgeShift = isNarrow ? 10 : 16;
  const labelFontSize = isNarrow ? 11 : 12;

  const renderLabel = (color: string, position: "top" | "bottom") => {
    const LabelComponent = (props: LabelProps) => {
      const x = typeof props.x === "number" ? props.x : Number(props.x ?? 0);
      const y = typeof props.y === "number" ? props.y : Number(props.y ?? 0);
      const index = props.index ?? 0;
      const rawValue = props.value;
      const value =
        typeof rawValue === "number"
          ? rawValue
          : typeof rawValue === "string"
            ? Number(rawValue)
            : 0;
      // Shift first/last points horizontally to avoid axis/edge overlap
      const xPos =
        index === 0
          ? x + edgeShift
          : index === dataLen - 1
            ? x - edgeShift
            : x;

      // Flip label to the other side when near the chart edge
      let yOffset: number;
      if (position === "top") {
        // High line: label above by default, flip below if near top edge
        const nearTop = (value - minVal) / valRange > 0.75;
        yOffset = nearTop ? 20 : -14;
      } else {
        // Low line: label below by default, flip above if near bottom edge
        const nearBottom = (value - minVal) / valRange < 0.25;
        yOffset = nearBottom ? -14 : 20;
      }

      return (
        <text
          x={xPos}
          y={y + yOffset}
          fill={color}
          fontSize={labelFontSize}
          fontWeight={700}
          textAnchor="middle"
        >
          {value}{unitLabel}
        </text>
      );
    };
    LabelComponent.displayName = `TempLabel(${position})`;
    return LabelComponent;
  };

  // Trend summary for accessibility
  const firstHigh = data[0]?.high ?? 0;
  const lastHigh = data[data.length - 1]?.high ?? 0;
  const trend = firstHigh > lastHigh ? "downward" : "upward";
  const ariaLabel = `Temperature trending ${trend} from ${firstHigh}${unitLabel} to ${lastHigh}${unitLabel} over ${data.length} days`;

  return (
    <section aria-label="Temperature trend chart">
      <h2
        className={`text-xl sm:text-2xl font-bold leading-[1.3] mb-3 sm:mb-4 ${textClass}`}
      >
        Temperature Trend
      </h2>
      <div className="glass-card p-3 sm:p-4 md:p-5">
        <div aria-label={ariaLabel} role="img">
          <ResponsiveContainer width="100%" height={isNarrow ? 200 : 240}>
            <ComposedChart
              data={data}
              margin={{
                top: 20,
                right: isNarrow ? 10 : 20,
                left: 0,
                bottom: 0,
              }}
              tabIndex={-1}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridColor}
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{
                  fill: axisColor,
                  fontSize: isNarrow ? 11 : 12,
                  fontWeight: 700,
                }}
                axisLine={{ stroke: gridColor }}
                tickLine={false}
              />
              <YAxis
                width={isNarrow ? 38 : 50}
                tick={{ fill: axisColor, fontSize: isNarrow ? 11 : 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}${unitLabel}`}
                domain={["auto", "auto"]}
              />
              <Area
                type="monotone"
                dataKey="high"
                stroke="none"
                fill="rgba(46, 168, 168, 0.1)"
                activeDot={false}
                isAnimationActive={false}
                legendType="none"
              />
              <Area
                type="monotone"
                dataKey="low"
                stroke="none"
                fill="rgba(46, 168, 168, 0.05)"
                activeDot={false}
                isAnimationActive={false}
                legendType="none"
              />
              <Line
                type="monotone"
                dataKey="high"
                stroke="#F6A06B"
                strokeWidth={2.5}
                dot={{
                  r: 5,
                  fill: "#F6A06B",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
                label={renderLabel("#F6A06B", "top")}
                animationDuration={400}
                name="High"
              />
              <Line
                type="monotone"
                dataKey="low"
                stroke="#2EA8A8"
                strokeWidth={2.5}
                dot={{
                  r: 5,
                  fill: "#2EA8A8",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
                label={renderLabel("#2EA8A8", "bottom")}
                animationDuration={400}
                name="Low"
              />
              <Legend
                wrapperStyle={{ fontSize: 12, fontWeight: 700, color: axisColor }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

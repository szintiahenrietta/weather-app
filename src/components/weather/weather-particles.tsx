"use client";

import type { WeatherConditionCategory, TimeOfDay } from "@/types/weather";
import styles from "./particles.module.css";

interface Props {
  condition: WeatherConditionCategory;
  timeOfDay: TimeOfDay;
}

export function WeatherParticles({ condition, timeOfDay }: Props) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {(condition === "clear" || condition === "partly-cloudy") && (
        <Sunrays subtle={condition === "partly-cloudy"} timeOfDay={timeOfDay} />
      )}
      {(condition === "cloudy" || condition === "partly-cloudy") && (
        <Clouds timeOfDay={timeOfDay} />
      )}
      {condition === "rain" && <Rain heavy={false} />}
      {condition === "thunderstorm" && (
        <>
          <Rain heavy />
          <Lightning />
        </>
      )}
      {condition === "snow" && <Snowflakes />}
      {condition === "fog" && <FogBands />}
    </div>
  );
}

function Sunrays({
  subtle,
  timeOfDay,
}: {
  subtle: boolean;
  timeOfDay: TimeOfDay;
}) {
  if (timeOfDay === "night") return null;
  const rays = [
    { angle: 28, length: "110%", thickness: 8,  top: -5, delay: 0,   type: "thin" as const },
    { angle: 35, length: "120%", thickness: 30, top: -3, delay: 2,   type: "wide" as const },
    { angle: 42, length: "100%", thickness: 10, top: 0,  delay: 4,   type: "thin" as const },
    { angle: 50, length: "115%", thickness: 12, top: 3,  delay: 1,   type: "thin" as const },
    { angle: 55, length: "105%", thickness: 25, top: -8, delay: 3,   type: "wide" as const },
    { angle: 38, length: "95%",  thickness: 8,  top: 6,  delay: 5,   type: "thin" as const },
    { angle: 45, length: "125%", thickness: 10, top: -1, delay: 1.5, type: "thin" as const },
    { angle: 62, length: "90%",  thickness: 20, top: 10, delay: 3.5, type: "wide" as const },
  ];
  const count = subtle ? 5 : 8;
  return (
    <>
      {rays.slice(0, count).map((ray, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${ray.top}%`,
            left: 0,
            width: "100%",
            transform: `rotate(${ray.angle}deg)`,
            transformOrigin: "0% 0%",
          }}
        >
          <div
            className={ray.type === "thin" ? styles.sunrayThin : styles.sunrayWide}
            style={{
              width: ray.length,
              height: `${ray.thickness}px`,
              animationDelay: `${ray.delay}s`,
            }}
          />
        </div>
      ))}
    </>
  );
}

function Clouds({ timeOfDay }: { timeOfDay: TimeOfDay }) {
  const opacity = timeOfDay === "night" ? 0.12 : 0.35;
  const clouds = [
    { top: "8%", scale: 1.2, duration: 120, delay: 0 },
    { top: "18%", scale: 0.8, duration: 150, delay: -40 },
    { top: "4%", scale: 1, duration: 130, delay: -80 },
    { top: "28%", scale: 0.9, duration: 140, delay: -20 },
    { top: "14%", scale: 1.1, duration: 160, delay: -100 },
    { top: "34%", scale: 0.7, duration: 135, delay: -60 },
  ];
  return (
    <>
      {clouds.map((c, i) => (
        <div
          key={i}
          className={styles.cloud}
          style={{
            top: c.top,
            left: 0,
            opacity,
            transform: `scale(${c.scale})`,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
          }}
        >
          <div className={styles.cloudCircle} style={{ width: 60, height: 60, top: 0, left: 10 }} />
          <div className={styles.cloudCircle} style={{ width: 80, height: 80, top: -20, left: 30 }} />
          <div className={styles.cloudCircle} style={{ width: 70, height: 70, top: -10, left: 60 }} />
          <div className={styles.cloudCircle} style={{ width: 50, height: 50, top: 5, left: 85 }} />
        </div>
      ))}
    </>
  );
}

function Rain({ heavy }: { heavy: boolean }) {
  const count = heavy ? 50 : 40;
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={styles.raindrop}
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${0.5 + Math.random() * 0.7}s`,
            animationDelay: `${Math.random() * 2}s`,
            opacity: 0.3 + Math.random() * 0.4,
            width: heavy ? "2px" : "1.5px",
            height: heavy ? "18px" : "14px",
          }}
        />
      ))}
    </>
  );
}

function Lightning() {
  return <div className={styles.lightning} />;
}

function Snowflakes() {
  return (
    <>
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className={styles.snowflake}
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${3 + Math.random() * 4}s`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: 0.4 + Math.random() * 0.4,
            width: `${4 + Math.random() * 6}px`,
            height: `${4 + Math.random() * 6}px`,
          }}
        />
      ))}
    </>
  );
}

function FogBands() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={styles.fogBand}
          style={{
            top: `${15 + i * 14}%`,
            animationDelay: `${i * 2}s`,
            opacity: 0.15 + Math.random() * 0.15,
          }}
        />
      ))}
    </>
  );
}

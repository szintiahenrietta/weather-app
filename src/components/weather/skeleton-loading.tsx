"use client";

export function WeatherSkeleton() {
  return (
    <div className="w-full max-w-[880px] space-y-8 animate-pulse">
      {/* Hero card skeleton */}
      <div className="glass-card p-5 md:p-8">
        <div className="h-4 w-32 rounded skeleton-shimmer mb-2" />
        <div className="h-8 w-48 rounded skeleton-shimmer mb-4" />
        <div className="flex items-start gap-4">
          <div className="h-14 w-24 rounded skeleton-shimmer" />
          <div className="space-y-2">
            <div className="h-12 w-12 rounded-full skeleton-shimmer" />
            <div className="h-4 w-28 rounded skeleton-shimmer" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 rounded skeleton-shimmer" />
          ))}
        </div>
      </div>

      {/* Forecast skeleton */}
      <div>
        <div className="h-7 w-40 rounded skeleton-shimmer mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass-card p-3 h-36 skeleton-shimmer rounded-[16px]" />
          ))}
        </div>
      </div>

      {/* Chart skeleton */}
      <div>
        <div className="h-7 w-48 rounded skeleton-shimmer mb-4" />
        <div className="glass-card p-4 h-[280px] skeleton-shimmer rounded-[16px]" />
      </div>

      {/* Timeline skeleton */}
      <div>
        <div className="h-7 w-44 rounded skeleton-shimmer mb-4" />
        <div className="glass-card p-4 h-24 skeleton-shimmer rounded-[16px]" />
      </div>
    </div>
  );
}

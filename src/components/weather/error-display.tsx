"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { useWeather } from "@/components/providers";

interface Props {
  onRetry: () => void;
}

export function ErrorDisplay({ onRetry }: Props) {
  const { error, isDarkGradient } = useWeather();

  if (!error) return null;

  const textClass = isDarkGradient ? "text-[#F5F3F0]" : "text-[#292524]";

  return (
    <div
      className="glass-card p-4 max-w-md w-full"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-[#E53E3E] flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className={`text-sm ${textClass}`}>{error}</p>
          <button
            onClick={onRetry}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-[#2EA8A8] hover:text-[#258F8F] transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";

interface GeolocationState {
  loading: boolean;
  error: string | null;
  coords: { lat: number; lon: number } | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    error: null,
    coords: null,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        loading: false,
        error: "Geolocation is not supported by your browser.",
        coords: null,
      });
      return;
    }

    // Mobile browsers (esp. iOS Safari) silently block geolocation on
    // non-secure origins. Detect this and surface a useful message instead
    // of hanging on a callback that will never fire.
    if (typeof window !== "undefined" && window.isSecureContext === false) {
      setState({ loading: false, error: "insecure", coords: null });
      return;
    }

    setState({ loading: true, error: null, coords: null });

    // Hard fallback: some platforms ignore the `timeout` option entirely.
    // Force-resolve to an error if nothing fires within 7s.
    let settled = false;
    const fallbackTimer = setTimeout(() => {
      if (settled) return;
      settled = true;
      setState({
        loading: false,
        error: "Location request timed out. Try searching for a city.",
        coords: null,
      });
    }, 7000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (settled) return;
        settled = true;
        clearTimeout(fallbackTimer);
        setState({
          loading: false,
          error: null,
          coords: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          },
        });
      },
      (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(fallbackTimer);
        let message = "Couldn't determine your location.";
        if (err.code === err.PERMISSION_DENIED) {
          message = "denied";
        } else if (err.code === err.TIMEOUT) {
          message = "Location request timed out. Try searching for a city.";
        }
        setState({ loading: false, error: message, coords: null });
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
    );
  }, []);

  return { ...state, requestLocation };
}

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCashForecast, ApiError } from '@/lib/api';

export const FORECAST_HORIZONS = [30, 60, 90] as const;
export type ForecastHorizon = (typeof FORECAST_HORIZONS)[number];

export const FORECAST_HORIZON_ERROR = 'Please choose a 30, 60, or 90 day forecast.';

export interface CashForecastHorizon {
  days: number;
  expected_inflows: number;
  upcoming_bills: number;
  net_cash: number;
}

export interface CashForecast {
  late_bridal_payment: boolean;
  horizons: CashForecastHorizon[];
}

export function isValidForecastHorizon(days: number): days is ForecastHorizon {
  return (FORECAST_HORIZONS as readonly number[]).includes(days);
}

export function useCashForecast(horizonDays: number, lateBridalPayment: boolean = false) {
  const [forecast, setForecast] = useState<CashForecast | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);

  const horizonIsValid = isValidForecastHorizon(horizonDays);

  useEffect(() => {
    if (!horizonIsValid) {
      setForecast(null);
      setError(FORECAST_HORIZON_ERROR);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getCashForecast({ late_bridal_payment: lateBridalPayment })
      .then((result) => {
        if (!cancelled) setForecast(result);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setForecast(null);
        setError(
          err instanceof ApiError ? err.message : 'Could not load the cash forecast.'
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [horizonIsValid, horizonDays, lateBridalPayment, reloadKey]);

  const refetch = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  const horizons = useMemo<CashForecastHorizon[]>(
    () => (Array.isArray(forecast?.horizons) ? forecast.horizons : []),
    [forecast]
  );

  const horizon = useMemo<CashForecastHorizon | null>(
    () => horizons.find((h) => h.days === horizonDays) ?? null,
    [horizons, horizonDays]
  );

  return {
    forecast,
    horizons,
    horizon,
    isLoading,
    error,
    refetch,
  };
}

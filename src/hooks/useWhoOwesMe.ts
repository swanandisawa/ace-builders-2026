'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getWhoOwesMe } from '@/lib/api';

export interface WhoOwesMeAlert {
  sentence: string;
  invoice_id: string;
  bill_id: string | null;
  outstanding_balance: number;
}

export interface WhoOwesMeOverdueClient {
  invoice_id: string;
  client_name: string;
  outstanding_balance: number;
  days_overdue: number;
}

export function useWhoOwesMe() {
  const [rawAlerts, setRawAlerts] = useState<WhoOwesMeAlert[]>([]);
  const [rawOverdueClients, setRawOverdueClients] = useState<WhoOwesMeOverdueClient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState<number>(0);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    getWhoOwesMe()
      .then((data) => {
        if (!active) return;
        setRawAlerts(Array.isArray(data.alerts) ? data.alerts : []);
        setRawOverdueClients(Array.isArray(data.overdue_clients) ? data.overdue_clients : []);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Could not load who owes you');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadToken]);

  const refetch = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  // Guard: only genuinely overdue balances are listed, longest-overdue first.
  const overdueClients = useMemo<WhoOwesMeOverdueClient[]>(() => {
    return rawOverdueClients
      .filter(
        (client) =>
          typeof client.outstanding_balance === 'number' &&
          client.outstanding_balance > 0 &&
          typeof client.days_overdue === 'number' &&
          client.days_overdue > 0,
      )
      .slice()
      .sort((a, b) => b.days_overdue - a.days_overdue);
  }, [rawOverdueClients]);

  // Guard: alerts must carry a readable sentence to be shown.
  const alerts = useMemo<WhoOwesMeAlert[]>(() => {
    return rawAlerts.filter(
      (alert) => typeof alert.sentence === 'string' && alert.sentence.trim().length > 0,
    );
  }, [rawAlerts]);

  const total = useMemo<number>(() => {
    return overdueClients.reduce((sum, client) => sum + client.outstanding_balance, 0);
  }, [overdueClients]);

  return {
    alerts,
    overdueClients,
    total,
    isLoading,
    error,
    refetch,
  };
}

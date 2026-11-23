'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getInvoices } from '@/lib/api';
import type { Invoice } from '@/types/invoice';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const mounted = useRef<boolean>(true);

  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getInvoices();
      if (mounted.current) {
        setInvoices(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      if (mounted.current) {
        setError(err instanceof Error ? err : new Error('Could not load invoices.'));
      }
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  return {
    invoices,
    isLoading,
    error,
    refetch: load,
  };
}

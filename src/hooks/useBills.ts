
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createBillMarkPaid, getBills } from '@/lib/api';
import type { Bill } from '@/types/bill';

export function useBills() {
  const [rawBills, setRawBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getBills();
      setRawBills(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load bills.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const bills = useMemo<Bill[]>(() => {
    const safe = Array.isArray(rawBills) ? rawBills : [];
    return safe
      .filter((bill) => !bill.isPaid)
      .sort(
        (a, b) =>
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      );
  }, [rawBills]);

  const markPaid = useCallback(async (billId: string): Promise<Bill | null> => {
    setError(null);
    try {
      const updated = await createBillMarkPaid(billId, {});
      setRawBills((prev) =>
        prev.map((bill) => (bill.id === billId ? updated : bill)),
      );
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not mark bill as paid.');
      return null;
    }
  }, []);

  return {
    bills,
    isLoading,
    error,
    refetch,
    markPaid,
  };
}

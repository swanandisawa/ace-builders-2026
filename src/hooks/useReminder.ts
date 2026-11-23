'use client';

import { useCallback, useEffect, useState } from 'react';
import { getInvoiceReminder } from '@/lib/api';

type ReminderData = Awaited<ReturnType<typeof getInvoiceReminder>>;

export function useReminder(invoiceId: string | null | undefined) {
  const [reminder, setReminder] = useState<ReminderData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const refetch = useCallback(async () => {
    if (!invoiceId) {
      setReminder(null);
      setError('Missing invoice id.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setCopied(false);
    try {
      const data = await getInvoiceReminder(invoiceId);
      setReminder(data);
    } catch (err) {
      setReminder(null);
      setError(err instanceof Error ? err.message : 'Could not load the reminder.');
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const reminderText = reminder?.reminder_text ?? '';
  const canRemind = Boolean(reminder?.can_remind) && reminderText.trim().length > 0;

  // Copying only writes to the clipboard. It never calls a mutating endpoint,
  // never changes invoice status, and never marks the invoice as reminded.
  const copyReminder = useCallback(async (): Promise<boolean> => {
    setError(null);
    setCopied(false);

    if (!reminder) {
      setError('The reminder is not loaded yet.');
      return false;
    }
    if (!canRemind) {
      setError('There is no outstanding balance to remind about.');
      return false;
    }
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      setError('Clipboard is not available on this device.');
      return false;
    }

    try {
      await navigator.clipboard.writeText(reminderText);
      setCopied(true);
      return true;
    } catch {
      setError('Could not copy the reminder to the clipboard.');
      return false;
    }
  }, [reminder, canRemind, reminderText]);

  return {
    reminder,
    reminderText,
    canRemind,
    isLoading,
    error,
    copied,
    refetch,
    copyReminder,
  };
}

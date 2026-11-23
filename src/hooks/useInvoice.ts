'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ApiError,
  createInvoicePayment,
  createPaymentReceive,
  getInvoiceById,
} from '@/lib/api';
import type { Invoice } from '@/types/invoice';
import type { Payment } from '@/types/payment';

export interface UseInvoiceResult {
  invoice: Invoice | null;
  payments: Payment[];
  remainingBalance: number;
  daysOverdue: number;
  isLoading: boolean;
  isReceiving: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  receivePayment: (paymentId: string) => Promise<void>;
  recordPayment: (input: { amount: number; receivedOn: string }) => Promise<void>;
}

function toNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Please try again.';
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * remaining balance = total fee - advance paid - sum of received payments, never below zero.
 */
function computeRemainingBalance(invoice: Invoice | null, payments: Payment[]): number {
  if (!invoice) return 0;
  const receivedTotal = payments
    .filter((p) => p.status === 'received')
    .reduce((sum, p) => sum + toNumber(p.amount), 0);
  const remaining =
    toNumber(invoice.totalFee) - toNumber(invoice.advancePaid) - receivedTotal;
  return Math.max(0, Math.round(remaining * 100) / 100);
}

/**
 * days overdue are counted from the due date (falling back to the event date)
 * only while a balance remains and that date has passed.
 */
function computeDaysOverdue(invoice: Invoice | null, remaining: number): number {
  if (!invoice || remaining <= 0) return 0;
  const due = invoice.dueDate ?? invoice.eventDate;
  if (!due) return 0;
  const dueDate = new Date(due);
  if (Number.isNaN(dueDate.getTime())) return 0;
  dueDate.setHours(0, 0, 0, 0);
  const diffMs = startOfToday().getTime() - dueDate.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
}

export function useInvoice(invoiceId: string | undefined | null): UseInvoiceResult {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(invoiceId));
  const [isReceiving, setIsReceiving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!invoiceId) {
      setInvoice(null);
      setPayments([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const detail = await getInvoiceById(invoiceId);
      setInvoice(detail?.invoice ?? null);
      setPayments(Array.isArray(detail?.payments) ? detail.payments : []);
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    void load();
  }, [load]);

  const receivePayment = useCallback(
    async (paymentId: string) => {
      setIsReceiving(true);
      setError(null);
      try {
        await createPaymentReceive(paymentId, {});
        await load();
      } catch (err) {
        setError(toMessage(err));
      } finally {
        setIsReceiving(false);
      }
    },
    [load],
  );

  const recordPayment = useCallback(
    async (input: { amount: number; receivedOn: string }) => {
      if (!invoiceId) return;
      setIsReceiving(true);
      setError(null);
      try {
        const created = await createInvoicePayment(invoiceId, { amount: input.amount });
        await createPaymentReceive(created.id, { amount: input.amount, receivedOn: input.receivedOn });
        await load();
      } catch (err) {
        setError(toMessage(err));
        throw err;
      } finally {
        setIsReceiving(false);
      }
    },
    [invoiceId, load],
  );

  const remainingBalance = useMemo(
    () => computeRemainingBalance(invoice, payments),
    [invoice, payments],
  );

  const daysOverdue = useMemo(
    () => computeDaysOverdue(invoice, remainingBalance),
    [invoice, remainingBalance],
  );

  return {
    invoice,
    payments,
    remainingBalance,
    daysOverdue,
    isLoading,
    isReceiving,
    error,
    refetch: load,
    receivePayment,
    recordPayment,
  };
}

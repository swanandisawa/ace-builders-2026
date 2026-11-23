'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getBills } from '@/lib/api';
import type { Bill } from '@/types/bill';

const HORIZON_DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;

const CATEGORY_LABELS: Record<string, string> = {
  rent: 'Rent',
  restock: 'Cosmetic restock',
  other: 'Other',
};

function utcDayOf(value: string | Date): number {
  const d = new Date(value);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function todayUtc(): number {
  const now = new Date();
  return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
}

function formatAmount(amount: unknown): string {
  return Number(amount).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default function BillsList() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const rows = await getBills();
      setBills(Array.isArray(rows) ? rows : []);
    } catch {
      setError('Bills could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = useMemo(() => {
    const safeBills = Array.isArray(bills) ? bills : [];
    const today = todayUtc();
    const limit = today + HORIZON_DAYS * DAY_MS;
    return safeBills
      .filter((b) => !b.isPaid)
      .filter((b) => utcDayOf(b.dueDate) <= limit)
      .sort((a, b) => utcDayOf(a.dueDate) - utcDayOf(b.dueDate));
  }, [bills]);

  const today = todayUtc();

  return (
    <section className="w-full min-w-0 space-y-4" data-nexen-id="nx-3f1208cf-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[hsl(var(--muted-foreground))]" data-nexen-id="nx-3f1208cf-1">
          Upcoming rent and restock costs, soonest first.
        </p>
        <Link
          href="/bills/new"
          className="inline-flex h-10 w-full items-center justify-center rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 text-sm font-medium text-[hsl(var(--primary-foreground))] sm:w-auto"
         data-nexen-id="nx-3f1208cf-2">
          New bill
        </Link>
      </div>

      {isLoading && (
        <p role="status" className="text-sm text-[hsl(var(--muted-foreground))]" data-nexen-id="nx-3f1208cf-3">
          Loading bills…
        </p>
      )}

      {!isLoading && error && (
        <div className="flex flex-col gap-3 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[hsl(var(--destructive))]" data-nexen-id="nx-3f1208cf-4">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex h-9 items-center justify-center rounded-[var(--radius)] border border-[hsl(var(--border))] px-4 text-sm font-medium text-[hsl(var(--foreground))]"
           data-nexen-id="nx-3f1208cf-5">
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && rows.length === 0 && (
        <div className="flex flex-col items-start gap-3 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
          <p className="text-sm text-[hsl(var(--muted-foreground))]" data-nexen-id="nx-3f1208cf-6">
            No bills have been added yet.
          </p>
          <Link
            href="/bills/new"
            className="inline-flex h-10 items-center justify-center rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 text-sm font-medium text-[hsl(var(--primary-foreground))]"
           data-nexen-id="nx-3f1208cf-7">
            New bill
          </Link>
        </div>
      )}

      {!isLoading && !error && rows.length > 0 && (
        <ul className="divide-y divide-[hsl(var(--border))] rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 shadow-sm" data-nexen-id="nx-3f1208cf-8">
          {rows.map((bill) => {
            const isOverdue = utcDayOf(bill.dueDate) < today;
            const categoryLabel = CATEGORY_LABELS[bill.category] ?? 'Other';
            return (
              <li data-nexen-component="nx_components_BillsList"
                key={bill.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
               data-nexen-id="nx-3f1208cf-9">
                <div className="min-w-0 flex-1">
                  <p className="break-words text-[15px] font-medium text-[hsl(var(--foreground))]" data-nexen-id="nx-3f1208cf-10">
                    {bill.name}
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]" data-nexen-id="nx-3f1208cf-11">
                    {categoryLabel}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end sm:text-right">
                  <span className="font-semibold tabular-nums text-[hsl(var(--foreground))]" data-nexen-id="nx-3f1208cf-12">
                    {formatAmount(bill.amount)}
                  </span>
                  <span
                    className={
                      isOverdue
                        ? 'text-xs text-[hsl(var(--destructive))]'
                        : 'text-xs text-[hsl(var(--muted-foreground))]'
                    }
                   data-nexen-id="nx-3f1208cf-13">
                    {isOverdue ? 'Overdue · ' : 'Due '}
                    {formatDate(bill.dueDate)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
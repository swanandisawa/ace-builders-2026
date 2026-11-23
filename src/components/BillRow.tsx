'use client';

import { useEffect, useState } from 'react';
import type { Bill } from '@/types/bill';

export interface BillRowProps {
  bill: Bill;
  onMarkPaid?: (billId: string) => void;
  isMarking?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  rent: 'Rent',
  restock: 'Cosmetic restock',
  other: 'Other',
};

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toDayKey(value: string | Date): string | null {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function formatDueDate(value: string | Date): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
}

function formatAmount(value: number | string): string {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : '0.00';
}

export default function BillRow({ bill, onMarkPaid, isMarking = false }: BillRowProps) {
  const [todayKey, setTodayKey] = useState<string | null>(null);

  // Computed after mount so server and client markup match.
  useEffect(() => {
    setTodayKey(new Date().toISOString().slice(0, 10));
  }, []);

  const dueKey = toDayKey(bill.dueDate as string | Date);
  const isOverdue = !bill.isPaid && todayKey !== null && dueKey !== null && dueKey < todayKey;

  const statusLabel = bill.isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Upcoming';
  const statusClass = bill.isPaid
    ? 'text-[hsl(var(--success,var(--muted-foreground)))]'
    : isOverdue
      ? 'text-destructive'
      : 'text-muted-foreground';

  const categoryLabel = CATEGORY_LABELS[String(bill.category)] ?? 'Other';

  return (
    <li data-nexen-component="nx_components_BillRow" className="flex flex-col gap-3 bg-card text-card-foreground border border-border rounded-[var(--radius)] shadow-sm p-4 sm:flex-row sm:items-center sm:justify-between" data-nexen-id="nx-623cb641-0">
      <div className="min-w-0 flex-1">
        <p className="font-medium break-words" data-nexen-id="nx-623cb641-1">{bill.name}</p>
        <p className="text-sm text-muted-foreground break-words" data-nexen-id="nx-623cb641-2">
          {categoryLabel} · Due {formatDueDate(bill.dueDate as string | Date)}
        </p>
        <p className={`text-xs mt-1 ${statusClass}`} data-nexen-id="nx-623cb641-3">{statusLabel}</p>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <span className="font-semibold tabular-nums" data-nexen-id="nx-623cb641-4">{formatAmount(bill.amount as number | string)}</span>

        {bill.isPaid ? (
          <span className="inline-block rounded-full px-3 py-1 text-xs bg-muted text-muted-foreground" data-nexen-id="nx-623cb641-5">
            Paid
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onMarkPaid?.(bill.id)}
            disabled={isMarking || !onMarkPaid}
            className="inline-flex h-9 items-center justify-center rounded-[var(--radius)] bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
           data-nexen-id="nx-623cb641-6">
            {isMarking ? 'Saving…' : 'Mark paid'}
          </button>
        )}
      </div>
    </li>
  );
}

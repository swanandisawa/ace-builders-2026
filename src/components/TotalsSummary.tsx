'use client';

import { useId } from 'react';

export interface TotalsSummaryProps {
  horizonLabel?: string;
  expectedInflows?: number;
  upcomingBills?: number;
  netCash?: number;
  lateNetCash?: number | null;
}

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

function toNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export default function TotalsSummary({
  horizonLabel = 'selected horizon',
  expectedInflows,
  upcomingBills,
  netCash,
  lateNetCash = null,
}: TotalsSummaryProps) {
  const headingId = useId();

  const inflows = toNumber(expectedInflows);
  const bills = toNumber(upcomingBills);
  const net = netCash === undefined ? inflows - bills : toNumber(netCash);
  const late = typeof lateNetCash === 'number' ? toNumber(lateNetCash) : null;
  const isEmpty = inflows === 0 && bills === 0;

  const metrics = [
    {
      label: 'Total expected inflows',
      value: inflows,
      tone: 'text-foreground',
    },
    {
      label: 'Total upcoming bills',
      value: bills,
      tone: 'text-foreground',
    },
    {
      label: 'Net cash',
      value: net,
      tone: net < 0 ? 'text-destructive' : 'text-foreground',
    },
  ];

  return (
    <section data-nexen-component="nx_components_TotalsSummary"
      aria-labelledby={headingId}
      className="w-full min-w-0 rounded-[var(--radius)] border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-6"
     data-nexen-id="nx-44008655-0">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 id={headingId} className="text-base font-semibold" data-nexen-id="nx-44008655-1">
          Totals
        </h2>
        <p className="min-w-0 text-sm text-muted-foreground" data-nexen-id="nx-44008655-2">
          For the {horizonLabel}
        </p>
      </div>

      {isEmpty ? (
        <p className="text-sm text-muted-foreground" data-nexen-id="nx-44008655-3">
          No client payments or bills fall in the {horizonLabel}.
        </p>
      ) : null}

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3" data-nexen-id="nx-44008655-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="min-w-0 rounded-[var(--radius)] bg-background p-4"
          >
            <dt className="text-sm text-muted-foreground" data-nexen-id="nx-44008655-5">{metric.label}</dt>
            <dd
              className={`mt-1 break-words text-2xl font-semibold tabular-nums ${metric.tone}`}
             data-nexen-id="nx-44008655-6">
              {currency.format(metric.value)}
            </dd>
          </div>
        ))}
      </dl>

      {late !== null ? (
        <div className="mt-4 flex flex-col gap-2 rounded-[var(--radius)] border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium" data-nexen-id="nx-44008655-7">Net cash with late payment</p>
            <p className="text-sm text-muted-foreground" data-nexen-id="nx-44008655-8">
              Includes the bridal client paying 15 days late
            </p>
          </div>
          <span
            className={`text-xl font-semibold tabular-nums ${
              late < 0 ? 'text-destructive' : 'text-foreground'
            }`}
           data-nexen-id="nx-44008655-9">
            {currency.format(late)}
          </span>
        </div>
      ) : null}
    </section>
  );
}

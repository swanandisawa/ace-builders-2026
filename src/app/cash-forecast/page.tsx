'use client';

import { useEffect, useState, type ComponentProps } from 'react';
import ForecastChart from '@/components/ForecastChart';
import HorizonSelector from '@/components/HorizonSelector';
import TotalsSummary from '@/components/TotalsSummary';
import UpcomingItemsList from '@/components/UpcomingItemsList';
import WhatIfToggle from '@/components/WhatIfToggle';
import { getBills, getCashForecast, getInvoices } from '@/lib/api';
import type { Bill } from '@/types/bill';
import type { Invoice } from '@/types/invoice';

const HORIZONS: number[] = [30, 60, 90];
const BRIDAL_DELAY_DAYS = 15;
const HORIZON_ERROR = 'Please choose a 30, 60, or 90 day forecast.';
const LOAD_ERROR = 'The forecast could not be calculated.';

type ForecastResponse = Awaited<ReturnType<typeof getCashForecast>>;

type UpcomingItem = ComponentProps<typeof UpcomingItemsList>['items'][number];

const DAY_MS = 24 * 60 * 60 * 1000;

function toUtcDay(value: string | Date): number {
  const d = new Date(value);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function toIsoDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const shortDate = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export default function CashForecastPage() {
  const [horizon, setHorizon] = useState<number>(30);
  const [horizonError, setHorizonError] = useState<string | null>(null);
  const [lateBridal, setLateBridal] = useState(false);
  const [base, setBase] = useState<ForecastResponse | null>(null);
  const [late, setLate] = useState<ForecastResponse | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [todayMs, setTodayMs] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    Promise.all([
      getCashForecast({ late_bridal_payment: false }),
      getCashForecast({ late_bridal_payment: true }),
      getBills(),
      getInvoices(),
    ])
      .then(([baseRes, lateRes, billList, invoiceList]) => {
        if (cancelled) return;
        setBase(baseRes);
        setLate(lateRes);
        setBills(billList);
        setInvoices(invoiceList);
        setTodayMs(toUtcDay(new Date()));
      })
      .catch(() => {
        if (!cancelled) setError(LOAD_ERROR);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  function handleHorizon(days: number) {
    if (!HORIZONS.includes(days)) {
      setHorizonError(HORIZON_ERROR);
      return;
    }
    setHorizonError(null);
    setHorizon(days);
  }

  const active = lateBridal ? late : base;
  const baseSelected = base?.horizons.find((h) => h.days === horizon) ?? null;
  const lateSelected = late?.horizons.find((h) => h.days === horizon) ?? null;

  const pendingInvoices = invoices.filter((i) => Number(i.pendingBalance) > 0);
  const canSimulate = pendingInvoices.length > 0;
  const bridal = pendingInvoices.reduce<Invoice | null>(
    (top, i) => (!top || Number(i.pendingBalance) > Number(top.pendingBalance) ? i : top),
    null,
  );

  const activeSelected = lateBridal && lateSelected ? lateSelected : baseSelected;
  const summaryInflows = activeSelected?.expected_inflows ?? 0;
  const summaryBills = activeSelected?.upcoming_bills ?? 0;
  const summaryNet = summaryInflows - summaryBills;

  let latePayoutNote: string | null = null;
  if (lateBridal && bridal !== null && todayMs !== null) {
    const name = bridal.clientName;
    const eventMs = toUtcDay(bridal.eventDate);
    const endMs = todayMs + horizon * DAY_MS;
    // Past-due events are excluded from the window, same as the items list.
    const pastDue = eventMs < todayMs;
    const baseInside = !pastDue && Math.max(eventMs, todayMs) <= endMs;
    const lateInside =
      !pastDue && Math.max(eventMs, todayMs) + BRIDAL_DELAY_DAYS * DAY_MS <= endMs;
    const shifted = shortDate.format(new Date(eventMs + BRIDAL_DELAY_DAYS * DAY_MS));
    if (baseInside && lateInside) {
      latePayoutNote = `${name}'s payout moves +15 days to ${shifted} and stays inside the next ${horizon} days.`;
    } else if (baseInside) {
      latePayoutNote = `${name}'s payout moves +15 days to ${shifted}, which is outside the next ${horizon} days, so it drops out of this window.`;
    } else {
      latePayoutNote = `${name}'s payout is outside the next ${horizon} days either way, so the 15-day delay does not change this window.`;
    }
  }

  const impactText =
    lateBridal && baseSelected && lateSelected
      ? `Net cash over ${horizon} days moves from ₹${baseSelected.net_cash} to ₹${lateSelected.net_cash}.`
      : null;

  const items: UpcomingItem[] = [];
  if (todayMs !== null) {
    const endMs = todayMs + horizon * DAY_MS;
    for (const inv of pendingInvoices) {
      const eventMs = toUtcDay(inv.eventDate);
      // Event dates before today are past-due, not upcoming inflows; exclude them.
      if (eventMs < todayMs) continue;
      const isBridal = lateBridal && bridal !== null && inv.id === bridal.id;
      // Each client's own event date is shown; the bridal client's is shifted 15 days.
      const shownMs = isBridal ? eventMs + BRIDAL_DELAY_DAYS * DAY_MS : eventMs;
      // Window check: an overdue inflow counts as due today; the shift is applied after the clamp.
      const windowMs = isBridal
        ? Math.max(eventMs, todayMs) + BRIDAL_DELAY_DAYS * DAY_MS
        : Math.max(eventMs, todayMs);
      if (windowMs <= endMs) {
        items.push({
          id: `inflow-${inv.id}`,
          kind: 'inflow',
          name: inv.clientName,
          dueDate: toIsoDay(shownMs),
          amount: Number(inv.pendingBalance),
        } as UpcomingItem);
      }
    }
    for (const bill of bills) {
      if (bill.isPaid) continue;
      const shownMs = toUtcDay(bill.dueDate);
      if (Math.max(shownMs, todayMs) <= endMs) {
        items.push({
          id: `bill-${bill.id}`,
          kind: 'bill',
          name: bill.name,
          dueDate: toIsoDay(shownMs),
          amount: Number(bill.amount),
        } as UpcomingItem);
      }
    }
    items.sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0));
  }

  return (
    <main data-nexen-component="nx_app_cash_forecast_page" className="mx-auto w-full max-w-3xl min-w-0 space-y-6 bg-background p-4 text-foreground sm:p-6" data-nexen-id="nx-12915e15-0">
      <header className="min-w-0 space-y-1" data-nexen-id="nx-12915e15-1">
        <h1 className="text-2xl font-semibold" data-nexen-id="nx-12915e15-2">Cash Forecast</h1>
        <p className="text-sm text-muted-foreground" data-nexen-id="nx-12915e15-3">
          Expected client inflows against upcoming bills over the next 30, 60 or 90 days.
        </p>
      </header>

      <HorizonSelector
        horizons={HORIZONS}
        value={horizon}
        onChange={handleHorizon}
        disabled={isLoading}
      />
      {horizonError && (
        <p role="alert" className="text-sm text-destructive" data-nexen-id="nx-12915e15-4">
          {horizonError}
        </p>
      )}

      {error ? (
        <div className="space-y-2 rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm">
          <p className="text-sm text-destructive" data-nexen-id="nx-12915e15-5">{error}</p>
          <button
            type="button"
            onClick={() => setAttempt((a) => a + 1)}
            className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm"
           data-nexen-id="nx-12915e15-6">
            Try again
          </button>
        </div>
      ) : (
        <ForecastChart
          horizonDays={horizon}
          inflows={baseSelected?.expected_inflows ?? 0}
          bills={summaryBills}
          whatIfInflows={lateBridal && lateSelected ? lateSelected.expected_inflows : null}
          showWhatIf={lateBridal}
          latePayoutNote={latePayoutNote}
        />
      )}

      <WhatIfToggle
        enabled={lateBridal}
        onToggle={setLateBridal}
        impactText={impactText}
        canSimulate={canSimulate}
      />
      <p className="-mt-4 text-xs text-muted-foreground">
        Simulates the bridal client&apos;s payment arriving 15 days after its due date, shifting that inflow out of the next 30 days.
      </p>

      <TotalsSummary
        horizonLabel={`Next ${horizon} days`}
        expectedInflows={baseSelected?.expected_inflows ?? 0}
        upcomingBills={baseSelected?.upcoming_bills ?? 0}
        netCash={baseSelected?.net_cash ?? 0}
        lateNetCash={lateBridal && lateSelected ? lateSelected.net_cash : null}
      />
      <p className="-mt-4 text-xs text-muted-foreground">
        Net cash = Expected inflows − Upcoming bills within the selected window. Turning on 15-day late shifts the largest upcoming bridal payout +15 days.
      </p>
      <section className="rounded-[var(--radius)] border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">How this is calculated</h2>
        <p className="mt-1 text-xs text-muted-foreground">Next {horizon} days</p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Client payouts due</dt>
            <dd className="font-medium">+ {money.format(summaryInflows)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Bills due</dt>
            <dd className="font-medium">− {money.format(summaryBills)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-border pt-2">
            <dt className="font-semibold">Net cash left</dt>
            <dd className="font-bold">= {money.format(summaryNet)}</dd>
          </div>
        </dl>
        {lateBridal && bridal !== null && (
          <p className="mt-3 text-xs text-muted-foreground">
            With the 15-day delay on, {bridal.clientName}&apos;s payout is counted in the window only if it still falls inside the next {horizon} days.
          </p>
        )}
      </section>

      <UpcomingItemsList items={items} />
    </main>
  );
}
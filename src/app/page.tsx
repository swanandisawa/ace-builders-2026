'use client';

import { useMemo } from 'react';

import ActionAlerts from '@/components/ActionAlerts';
import OverdueTotal from '@/components/OverdueTotal';
import QuickLinks from '@/components/QuickLinks';
import WhoOwesMeList from '@/components/WhoOwesMeList';
import { useWhoOwesMe } from '@/hooks/useWhoOwesMe';

export default function HomePage() {
  const { alerts, overdueClients, isLoading, error, refetch } = useWhoOwesMe();

  const listClients = useMemo(
    () =>
      (overdueClients ?? []).map((client) => ({
        invoiceId: client.invoice_id,
        clientName: client.client_name,
        pendingBalance: client.outstanding_balance,
        daysOverdue: client.days_overdue,
      })),
    [overdueClients],
  );

  const actionAlerts = useMemo(
    () =>
      alerts
        ? alerts.map((a, idx) => ({
            id: String(a.invoice_id ?? a.bill_id ?? idx),
            message: a.sentence,
            invoiceId: a.invoice_id != null ? String(a.invoice_id) : undefined,
          }))
        : null,
    [alerts],
  );

  return (
    <main data-nexen-component="nx_app_page" className="mx-auto w-full max-w-2xl min-w-0 space-y-6 bg-background px-4 py-6 text-foreground" data-nexen-id="nx-3393394e-0">
      <header className="min-w-0 space-y-1" data-nexen-id="nx-3393394e-1">
        <h1 className="text-2xl font-semibold" data-nexen-id="nx-3393394e-2">GlowLedger</h1>
        <p className="text-sm text-muted-foreground" data-nexen-id="nx-3393394e-3">
          See what clients owe you and your cash for the next 90 days.
        </p>
      </header>

      {error ? (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="min-w-0 text-sm text-destructive" data-nexen-id="nx-3393394e-4">
            Could not load your balances. Try again
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex h-10 items-center justify-center rounded-[var(--radius)] bg-primary px-4 text-sm font-medium text-primary-foreground"
           data-nexen-id="nx-3393394e-5">
            Try again
          </button>
        </div>
      ) : null}

      <section className="min-w-0 space-y-3" data-nexen-id="nx-3393394e-6">
        <ActionAlerts alerts={actionAlerts} isLoading={isLoading} />
      </section>

      <section className="min-w-0 space-y-3 rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm" data-nexen-id="nx-3393394e-7">
        <WhoOwesMeList clients={listClients} isLoading={isLoading} />
        <OverdueTotal />
      </section>

      <section className="min-w-0" data-nexen-id="nx-3393394e-8">
        <QuickLinks />
      </section>
    </main>
  );
}

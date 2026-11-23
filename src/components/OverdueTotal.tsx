'use client';

import { useWhoOwesMe } from '@/hooks/useWhoOwesMe';

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

export default function OverdueTotal() {
  const { overdueClients, total, isLoading, error, refetch } = useWhoOwesMe();

  const safeClients = Array.isArray(overdueClients) ? overdueClients : [];
  const count = safeClients.length;
  const amount = Number(total ?? 0);
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  if (isLoading) {
    return (
      <section
        aria-busy="true"
        className="w-full min-w-0 rounded-[var(--radius)] border bg-card p-4 text-card-foreground shadow-sm"
       data-nexen-id="nx-d71cff4b-0">
        <p className="text-sm text-muted-foreground" data-nexen-id="nx-d71cff4b-1">Loading overdue total…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full min-w-0 rounded-[var(--radius)] border bg-card p-4 text-card-foreground shadow-sm" data-nexen-id="nx-d71cff4b-2">
        <p className="text-sm text-destructive" data-nexen-id="nx-d71cff4b-3">
          Could not load the overdue total.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 inline-flex h-10 items-center justify-center rounded-[var(--radius)] border border-border bg-transparent px-4 text-sm font-medium text-foreground"
         data-nexen-id="nx-d71cff4b-4">
          Try again
        </button>
      </section>
    );
  }

  if (count === 0) {
    return (
      <section className="w-full min-w-0 rounded-[var(--radius)] border bg-card p-4 text-card-foreground shadow-sm" data-nexen-id="nx-d71cff4b-5">
        <h2 className="text-base font-semibold" data-nexen-id="nx-d71cff4b-6">Overdue total</h2>
        <p className="mt-1 text-sm text-muted-foreground" data-nexen-id="nx-d71cff4b-7">
          No overdue balances. You are all caught up.
        </p>
      </section>
    );
  }

  const clientLabel = count === 1 ? 'overdue client' : 'overdue clients';

  return (
    <section data-nexen-component="nx_components_OverdueTotal" className="w-full min-w-0 rounded-[var(--radius)] border bg-card p-4 text-card-foreground shadow-sm" data-nexen-id="nx-d71cff4b-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <h2 className="text-base font-semibold" data-nexen-id="nx-d71cff4b-9">Overdue total</h2>
        <p className="text-sm text-muted-foreground" data-nexen-id="nx-d71cff4b-10">
          <span className="font-medium text-foreground" data-nexen-id="nx-d71cff4b-11">{count}</span>{' '}
          {clientLabel}
        </p>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-destructive" data-nexen-id="nx-d71cff4b-12">
        {currency.format(safeAmount)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground" data-nexen-id="nx-d71cff4b-13">
        Total pending balance across all overdue invoices
      </p>
    </section>
  );
}

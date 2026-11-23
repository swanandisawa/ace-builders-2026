import Link from 'next/link';
import type { Invoice } from '@/types/invoice';

interface InvoiceListProps {
  invoices?: Invoice[];
  isLoading?: boolean;
}

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
const dateFmt = new Intl.DateTimeFormat('en-IN', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

function formatDate(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : dateFmt.format(d);
}

function formatMoney(value: unknown): string {
  const n = Number(value);
  return Number.isFinite(n) ? money.format(n) : '—';
}

export default function InvoiceList({ invoices, isLoading = false }: InvoiceListProps) {
  const safeInvoices = Array.isArray(invoices) ? invoices : [];

  return (
    <section className="w-full min-w-0 space-y-4" data-nexen-id="nx-9bf763dd-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-foreground" data-nexen-id="nx-9bf763dd-1">Invoices</h2>
        <Link
          href="/invoices/new"
          className="inline-flex h-10 w-full items-center justify-center rounded-[var(--radius)] bg-primary px-4 text-sm font-medium text-primary-foreground sm:w-auto"
         data-nexen-id="nx-9bf763dd-2">
          New invoice
        </Link>
      </div>

      {isLoading ? (
        <div className="rounded-[var(--radius)] border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
          Loading invoices…
        </div>
      ) : safeInvoices.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-dashed border-border bg-card p-6 text-center shadow-sm">
          <p className="text-base font-medium text-foreground" data-nexen-id="nx-9bf763dd-3">No invoices yet</p>
          <p className="mt-1 text-sm text-muted-foreground" data-nexen-id="nx-9bf763dd-4">
            Create your first invoice in three taps and it will appear here.
          </p>
          <Link
            href="/invoices/new"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-[var(--radius)] bg-primary px-4 text-sm font-medium text-primary-foreground"
           data-nexen-id="nx-9bf763dd-5">
            New invoice
          </Link>
        </div>
      ) : (
        <ul className="space-y-3" data-nexen-id="nx-9bf763dd-6">
          {safeInvoices.map((invoice) => {
            const isOverdue = invoice.status === 'overdue';
            return (
              <li data-nexen-component="nx_components_InvoiceList" key={invoice.id} className="min-w-0" data-nexen-id="nx-9bf763dd-7">
                <Link
                  href={`/invoices/${invoice.id}`}
                  className="block rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted sm:p-5"
                 data-nexen-id="nx-9bf763dd-8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-semibold text-foreground" data-nexen-id="nx-9bf763dd-9">
                        {invoice.clientName}
                      </p>
                      <p className="text-sm text-muted-foreground" data-nexen-id="nx-9bf763dd-10">
                        Event {formatDate(invoice.eventDate)}
                      </p>
                    </div>

                    <dl className="grid grid-cols-3 gap-3 text-sm sm:flex sm:gap-6" data-nexen-id="nx-9bf763dd-11">
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground" data-nexen-id="nx-9bf763dd-12">Total fee</dt>
                        <dd className="font-medium tabular-nums text-foreground" data-nexen-id="nx-9bf763dd-13">
                          {formatMoney(invoice.totalFee)}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground" data-nexen-id="nx-9bf763dd-14">Advance</dt>
                        <dd className="font-medium tabular-nums text-foreground" data-nexen-id="nx-9bf763dd-15">
                          {formatMoney(invoice.advancePaid)}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground" data-nexen-id="nx-9bf763dd-16">Pending</dt>
                        <dd
                          className={`font-semibold tabular-nums ${
                            isOverdue ? 'text-destructive' : 'text-foreground'
                          }`}
                         data-nexen-id="nx-9bf763dd-17">
                          {formatMoney(invoice.pendingBalance)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

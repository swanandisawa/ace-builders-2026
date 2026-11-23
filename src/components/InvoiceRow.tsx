
import Link from 'next/link';
import type { Invoice } from '@/types/invoice';

interface InvoiceRowProps {
  invoice: Invoice;
}

const moneyFormat = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
const dateFormat = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  overdue: 'Overdue',
  paid: 'Paid',
};

function formatMoney(value: unknown): string {
  const n = Number(value);
  return moneyFormat.format(Number.isFinite(n) ? n : 0);
}

function formatEventDate(value: unknown): string {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return '—';
  return dateFormat.format(date);
}

export default function InvoiceRow({ invoice }: InvoiceRowProps) {
  const status = String(invoice.status);
  const isOverdue = status === 'overdue';
  const isPaid = status === 'paid';
  const statusLabel = STATUS_LABEL[status] ?? status;

  const fields = [
    { label: 'Total fee', value: formatMoney(invoice.totalFee), tone: 'text-foreground' },
    { label: 'Advance paid', value: formatMoney(invoice.advancePaid), tone: 'text-foreground' },
    {
      label: 'Pending balance',
      value: formatMoney(invoice.pendingBalance),
      tone: isOverdue ? 'text-destructive' : 'text-foreground',
    },
  ];

  return (
    <Link
      href={`/invoices/${invoice.id}`}
      className="block w-full rounded-[var(--radius)] border border-border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
     data-nexen-id="nx-d25181df-0">
      <div data-nexen-component="nx_components_InvoiceRow" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground" data-nexen-id="nx-d25181df-1">{invoice.clientName}</p>
          <p className="text-sm text-muted-foreground" data-nexen-id="nx-d25181df-2">
            Event: {formatEventDate(invoice.eventDate)}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isOverdue
                ? 'bg-destructive/10 text-destructive'
                : isPaid
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
            }`}
           data-nexen-id="nx-d25181df-3">
            {statusLabel}
          </span>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-3 border-t border-border pt-3 text-sm" data-nexen-id="nx-d25181df-4">
        {fields.map((field) => (
          <div key={field.label} className="min-w-0">
            <dt className="truncate text-xs text-muted-foreground" data-nexen-id="nx-d25181df-5">{field.label}</dt>
            <dd className={`truncate font-semibold tabular-nums ${field.tone}`} data-nexen-id="nx-d25181df-6">{field.value}</dd>
          </div>
        ))}
      </dl>

      {isOverdue ? (
        <p className="mt-2 text-xs text-destructive" data-nexen-id="nx-d25181df-7">Balance is past due</p>
      ) : null}
    </Link>
  );
}

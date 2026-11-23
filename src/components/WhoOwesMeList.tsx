import Link from 'next/link';

export interface OverdueClient {
  invoiceId: string;
  clientName: string;
  pendingBalance: number | string;
  daysOverdue: number;
}

interface WhoOwesMeListProps {
  clients?: OverdueClient[] | null;
  isLoading?: boolean;
}

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

function formatMoney(value: number | string): string {
  const amount = Number(value);
  return currency.format(Number.isFinite(amount) ? amount : 0);
}

function formatDaysOverdue(days: number): string {
  const safeDays = Number.isFinite(days) ? days : 0;
  return safeDays === 1 ? '1 day overdue' : `${safeDays} days overdue`;
}

export default function WhoOwesMeList({ clients, isLoading }: WhoOwesMeListProps) {
  const safeClients = Array.isArray(clients) ? clients : [];
  const sortedClients = [...safeClients].sort(
    (a, b) => b.daysOverdue - a.daysOverdue,
  );

  return (
    <section data-nexen-component="nx_components_WhoOwesMeList" aria-labelledby="who-owes-me-heading" className="space-y-3" data-nexen-id="nx-bfd74c89-0">
      <h2
        id="who-owes-me-heading"
        className="text-lg font-semibold text-foreground"
       data-nexen-id="nx-bfd74c89-1">
        Who Owes Me
      </h2>

      {isLoading ? (
        <div aria-busy="true" className="rounded-[var(--radius)] border border-border bg-card p-6 text-center shadow-sm">
          <p className="text-sm text-muted-foreground" data-nexen-id="nx-bfd74c89-10">Loading…</p>
        </div>
      ) : sortedClients.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-border bg-card p-6 text-center shadow-sm">
          <p className="font-medium text-foreground" data-nexen-id="nx-bfd74c89-2">No overdue balances</p>
          <p className="mt-1 text-sm text-muted-foreground" data-nexen-id="nx-bfd74c89-3">
            Every client is paid up for past events.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-sm" data-nexen-id="nx-bfd74c89-4">
          {sortedClients.map((client) => (
            <li key={client.invoiceId} data-nexen-id="nx-bfd74c89-5">
              <Link
                href={`/invoices/${client.invoiceId}`}
                aria-label={`View invoice for ${client.clientName}`}
                className="flex flex-wrap items-center justify-between gap-2 p-4 transition-colors hover:bg-background"
               data-nexen-id="nx-bfd74c89-6">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground" data-nexen-id="nx-bfd74c89-7">
                    {client.clientName}
                  </p>
                  <p className="text-sm text-destructive" data-nexen-id="nx-bfd74c89-8">
                    {formatDaysOverdue(client.daysOverdue)}
                  </p>
                </div>
                <span className="text-base font-semibold tabular-nums text-destructive" data-nexen-id="nx-bfd74c89-9">
                  {formatMoney(client.pendingBalance)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
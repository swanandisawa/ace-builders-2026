import Link from 'next/link';

export interface UpcomingItem {
  id: string;
  kind: 'inflow' | 'bill';
  name: string;
  dueDate: string;
  amount: number | string;
  overdue?: boolean;
}

interface UpcomingItemsListProps {
  items?: UpcomingItem[];
}

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

function formatAmount(value: number | string): string {
  const n = typeof value === 'number' ? value : Number(value);
  return currency.format(Number.isFinite(n) ? n : 0);
}

function formatDate(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function kindLabel(kind: UpcomingItem['kind']): string {
  return kind === 'inflow' ? 'Client payment' : 'Bill';
}

export default function UpcomingItemsList({ items: itemsProp }: UpcomingItemsListProps) {
  const safeItems = Array.isArray(itemsProp) ? itemsProp : [];
  const sorted = [...safeItems].sort((a, b) =>
    a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0,
  );

  return (
    <section className="w-full min-w-0 rounded-[var(--radius)] border bg-card p-6 text-card-foreground shadow-sm" data-nexen-id="nx-2220d903-0">
      <h2 className="text-lg font-semibold" data-nexen-id="nx-2220d903-1">Upcoming items</h2>
      <p className="mt-1 text-sm text-muted-foreground" data-nexen-id="nx-2220d903-2">
        Client payments and bills in date order.
      </p>

      {sorted.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground" data-nexen-id="nx-2220d903-3">
          Nothing due in this period.
        </p>
      ) : (
        <ul className="mt-4 w-full" data-nexen-id="nx-2220d903-4">
          {sorted.map((item) => {
            const isOverdue = Boolean(item.overdue);
            return (
              <li data-nexen-component="nx_components_UpcomingItemsList"
                key={item.id}
                className="flex flex-col gap-2 border-t py-3 sm:flex-row sm:items-center sm:justify-between"
               data-nexen-id="nx-2220d903-5">
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-medium" data-nexen-id="nx-2220d903-6">{item.name}</p>
                  <p
                    className={
                      isOverdue
                        ? 'text-xs text-destructive'
                        : 'text-xs text-muted-foreground'
                    }
                   data-nexen-id="nx-2220d903-7">
                    {isOverdue ? 'Overdue' : 'Due'} {formatDate(item.dueDate)} ·{' '}
                    {kindLabel(item.kind)}
                  </p>
                </div>
                <span
                  className={
                    isOverdue
                      ? 'text-sm font-semibold tabular-nums text-destructive'
                      : 'text-sm font-semibold tabular-nums'
                  }
                 data-nexen-id="nx-2220d903-8">
                  {formatAmount(item.amount)}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
        <Link
          href="/bills"
          className="inline-flex h-10 items-center justify-center rounded-[var(--radius)] border px-4 text-sm font-medium"
         data-nexen-id="nx-2220d903-9">
          View bills
        </Link>
        <Link
          href="/bills/new"
          className="inline-flex h-10 items-center justify-center rounded-[var(--radius)] bg-primary px-4 text-sm font-medium text-primary-foreground"
         data-nexen-id="nx-2220d903-10">
          Add a bill
        </Link>
      </div>
    </section>
  );
}

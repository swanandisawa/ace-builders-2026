import Link from 'next/link';

export type ActionAlert = {
  id: string;
  message: string;
  invoiceId?: string | null;
};

type ActionAlertsProps = {
  alerts?: ActionAlert[] | null;
  isLoading?: boolean;
};

export function ActionAlerts({ alerts, isLoading }: ActionAlertsProps) {
  const safeAlerts = Array.isArray(alerts) ? alerts : [];

  if (isLoading) {
    return (
      <div aria-busy="true" className="rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm">
        <p className="text-sm text-muted-foreground" data-nexen-id="nx-1042c0bb-5">Loading…</p>
      </div>
    );
  }

  if (safeAlerts.length === 0) {
    return (
      <div className="rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm">
        <p className="text-sm text-muted-foreground" data-nexen-id="nx-1042c0bb-0">
          No action alerts right now. Every balance is on track.
        </p>
      </div>
    );
  }

  return (
    <ul data-nexen-component="nx_components_ActionAlerts" className="flex flex-col gap-3" data-nexen-id="nx-1042c0bb-1">
      {safeAlerts.map((alert, idx) => (
        <li
          key={alert.id || idx}
          className="flex flex-col gap-3 rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between"
         data-nexen-id="nx-1042c0bb-2">
          <div className="flex min-w-0 items-start gap-3">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0 text-primary"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            <p className="min-w-0 break-words text-sm text-card-foreground" data-nexen-id="nx-1042c0bb-3">
              {alert.message}
            </p>
          </div>
          {alert.invoiceId ? (
            <Link
              href={`/invoices/${alert.invoiceId}`}
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-[var(--radius)] bg-primary px-3 text-sm font-medium text-primary-foreground"
             data-nexen-id="nx-1042c0bb-4">
              View invoice
            </Link>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export default ActionAlerts;


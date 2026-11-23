type MoneyValue = number | string | null | undefined;

export interface InvoiceAmountsProps {
  totalFee?: MoneyValue;
  advancePaid?: MoneyValue;
  remainingBalance?: MoneyValue;
  daysOverdue?: number | null;
  isLoading?: boolean;
}

const toAmount = (value: MoneyValue): number => {
  const parsed = typeof value === 'string' ? Number(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : 0;
};

const formatMoney = (value: MoneyValue): string => `₹${toAmount(value).toFixed(2)}`;

interface AmountFigureProps {
  label: string;
  value: string;
  emphasis?: boolean;
  danger?: boolean;
}

function AmountFigure({ label, value, emphasis = false, danger = false }: AmountFigureProps) {
  const valueClass = emphasis
    ? `text-3xl font-semibold tabular-nums ${danger ? 'text-destructive' : 'text-primary'}`
    : 'text-lg font-semibold tabular-nums text-foreground';

  return (
    <div className="min-w-0">
      <p className="text-sm text-muted-foreground" data-nexen-id="nx-1d0f8e54-0">{label}</p>
      <p className={valueClass} data-nexen-id="nx-1d0f8e54-1">{value}</p>
    </div>
  );
}

export default function InvoiceAmounts(props: InvoiceAmountsProps) {
  const {
    totalFee,
    advancePaid,
    remainingBalance,
    daysOverdue = 0,
    isLoading = false,
  } = props;

  if (isLoading) {
    return (
      <section className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm" data-nexen-id="nx-1d0f8e54-2">
        <p className="text-sm text-muted-foreground" data-nexen-id="nx-1d0f8e54-3">Loading amounts…</p>
      </section>
    );
  }

  const hasAmounts = totalFee !== null && totalFee !== undefined && totalFee !== '';

  if (!hasAmounts) {
    return (
      <section className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm" data-nexen-id="nx-1d0f8e54-4">
        <p className="text-sm text-muted-foreground" data-nexen-id="nx-1d0f8e54-5">No amounts recorded for this invoice yet.</p>
      </section>
    );
  }

  const overdueDays = Math.max(0, toAmount(daysOverdue));
  const isOverdue = overdueDays > 0;
  const pending = Math.max(0, toAmount(remainingBalance));

  return (
    <section data-nexen-component="nx_components_InvoiceAmounts"
      aria-label="Invoice amounts"
      className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm"
     data-nexen-id="nx-1d0f8e54-6">
      <div className="mb-6 min-w-0">
        <p className="text-sm text-muted-foreground" data-nexen-id="nx-1d0f8e54-7">Pending balance</p>
        <p
          className={`text-3xl font-semibold tabular-nums ${
            isOverdue ? 'text-destructive' : 'text-primary'
          }`}
         data-nexen-id="nx-1d0f8e54-8">
          {formatMoney(pending)}
        </p>
        {isOverdue ? (
          <p className="mt-1 text-sm text-destructive" data-nexen-id="nx-1d0f8e54-9">
            {overdueDays === 1 ? '1 day overdue' : `${overdueDays} days overdue`}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
        <AmountFigure label="Total fee" value={formatMoney(totalFee)} />
        <AmountFigure label="Advance paid" value={formatMoney(advancePaid)} />
      </div>
    </section>
  );
}

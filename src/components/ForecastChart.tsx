export interface ForecastChartProps {
  horizonDays: number;
  inflows: number;
  bills: number;
  whatIfInflows?: number | null;
  showWhatIf?: boolean;
  latePayoutNote?: string | null;
}

const WIDTH = 480;
const HEIGHT = 260;
const BASE_Y = 210;
const MAX_BAR_H = 150;
const BAR_W = 96;
const HORIZONS = [30, 60, 90];

const num = (v: unknown): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : 0;

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

interface BarSpec {
  key: string;
  lines: string[];
  value: number;
  className: string;
  dashed?: boolean;
}

export default function ForecastChart({
  horizonDays,
  inflows,
  bills,
  whatIfInflows = null,
  showWhatIf = false,
  latePayoutNote = null,
}: ForecastChartProps) {
  if (!HORIZONS.includes(horizonDays)) {
    return (
      <div
        role="alert"
        className="rounded-[var(--radius)] border border-border bg-card p-4 text-sm text-destructive"
      >
        Please choose a 30, 60, or 90 day forecast.
      </div>
    );
  }

  const payouts = num(inflows);
  const billTotal = num(bills);

  if (payouts === 0 && billTotal === 0) {
    return (
      <div className="rounded-[var(--radius)] border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        No cash movements in the next {horizonDays} days.
      </div>
    );
  }

  const showLate = showWhatIf && typeof whatIfInflows === 'number' && Number.isFinite(whatIfInflows);
  const late = showLate ? num(whatIfInflows) : 0;
  const net = payouts - billTotal;
  const scale = Math.max(1, payouts, billTotal, late);

  const bars: BarSpec[] = [
    { key: 'payouts', lines: ['Client Payouts'], value: payouts, className: 'fill-primary' },
  ];
  if (showLate) {
    bars.push({
      key: 'late',
      lines: ['Client Payouts', '(15 days late)'],
      value: late,
      className: 'fill-none stroke-accent',
      dashed: true,
    });
  }
  bars.push({ key: 'bills', lines: ['Upcoming Bills'], value: billTotal, className: 'fill-secondary' });

  const slot = WIDTH / bars.length;
  const laidOut = bars.map((bar, i) => {
    const cx = slot * i + slot / 2;
    const h = (Math.max(0, bar.value) / scale) * MAX_BAR_H;
    return { ...bar, cx, h, top: BASE_Y - h };
  });

  const netLabel =
    net >= 0
      ? `Surplus: +${money.format(net)}`
      : `Shortfall: -${money.format(Math.abs(net))}`;
  const badgeClass =
    net >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700';

  const ariaLabel =
    `Cash forecast for the next ${horizonDays} days: client payouts ${money.format(payouts)}, ` +
    `upcoming bills ${money.format(billTotal)}` +
    (showLate ? `, client payouts if 15 days late ${money.format(late)}` : '') +
    '.';

  const note = typeof latePayoutNote === 'string' ? latePayoutNote.trim() : '';

  return (
    <figure data-nexen-component="nx_components_ForecastChart" className="w-full min-w-0 rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm">
      <div className="flex justify-end">
        <span role="status" className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
          {netLabel}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={ariaLabel}
        className="mt-3 h-auto w-full"
      >
        {laidOut.map((bar) => (
          <rect
            key={`bar-${bar.key}`}
            x={bar.cx - BAR_W / 2}
            y={bar.top}
            width={BAR_W}
            height={bar.h}
            className={bar.className}
            strokeWidth={bar.dashed ? 1.5 : undefined}
            strokeDasharray={bar.dashed ? '4 4' : undefined}
          />
        ))}

        {laidOut.map((bar) => (
          <text
            key={`amount-${bar.key}`}
            x={bar.cx}
            y={bar.top - 6}
            textAnchor="middle"
            fontSize={13}
            fontWeight={600}
            className="fill-foreground"
          >
            {money.format(bar.value)}
          </text>
        ))}

        <line
          x1={0}
          x2={WIDTH}
          y1={BASE_Y}
          y2={BASE_Y}
          className="stroke-border"
          strokeWidth={1}
        />

        {laidOut.map((bar) =>
          bar.lines.map((line, j) => (
            <text
              key={`label-${bar.key}-${j}`}
              x={bar.cx}
              y={BASE_Y + 18 + j * 15}
              textAnchor="middle"
              fontSize={12}
              className="fill-muted-foreground"
            >
              {line}
            </text>
          )),
        )}
      </svg>

      <p className="mt-2 text-sm text-muted-foreground">Next {horizonDays} days</p>
      {note && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}
    </figure>
  );
}

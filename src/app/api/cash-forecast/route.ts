import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const HORIZON_DAYS = [30, 60, 90] as const;
const LATE_SHIFT_DAYS = 15;
const DAY_MS = 24 * 60 * 60 * 1000;

function toNumber(value: { toString(): string }): number {
  const n = Number(value.toString());
  return Number.isFinite(n) ? n : 0;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** UTC midnight timestamp for the calendar day of the given date. */
function toUtcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

interface DatedAmount {
  amount: number;
  date: number;
}

/**
 * GET /api/cash-forecast?late_bridal_payment=boolean
 * Public, read-only. Computes 30/60/90 day cumulative expected inflows,
 * upcoming unpaid bills, and net cash for each horizon.
 */
export async function GET(request: NextRequest) {
  const rawFlag = request.nextUrl.searchParams.get('late_bridal_payment');
  if (rawFlag !== null && rawFlag !== 'true' && rawFlag !== 'false') {
    return NextResponse.json(
      { error: 'late_bridal_payment must be true or false' },
      { status: 400 },
    );
  }
  const lateBridalPayment = rawFlag === 'true';

  try {
    const today = toUtcDay(new Date());

    // Expected inflows: outstanding invoice balances (total fee - advance paid - received payments).
    // Expected payments are part of this outstanding balance, so they are not added again.
    const invoices = await db.invoice.findMany({
      include: {
        payments: {
          where: { status: 'received' },
          select: { amount: true },
        },
      },
    });

    const inflows: (DatedAmount & { key: string; pendingBalance: number })[] = [];
    for (const invoice of invoices) {
      const received = invoice.payments.reduce(
        (sum, payment) => sum + toNumber(payment.amount),
        0,
      );
      const outstanding = round2(
        toNumber(invoice.totalFee) - toNumber(invoice.advancePaid) - received,
      );
      if (outstanding <= 0) continue;

      // An invoice whose event date has passed is an inflow due today.
      const eventDay = toUtcDay(new Date(invoice.eventDate));
      inflows.push({
        key: invoice.id,
        amount: outstanding,
        pendingBalance: toNumber(invoice.pendingBalance),
        date: Math.max(eventDay, today),
      });
    }

    // Late bridal payment: the bridal client is the invoice with the largest
    // pendingBalance (same rule as the page). Its inflow moves 15 days later,
    // applied after the today clamp so the shift is never lost.
    if (lateBridalPayment && inflows.length > 0) {
      let bridal = inflows[0];
      for (const item of inflows) {
        if (item.pendingBalance > bridal.pendingBalance) bridal = item;
      }
      bridal.date += LATE_SHIFT_DAYS * DAY_MS;
    }

    // Upcoming bills: unpaid bills only. Past-due bills count as due now.
    const bills = await db.bill.findMany({
      where: { isPaid: false },
      select: { amount: true, dueDate: true },
    });

    const outflows: DatedAmount[] = bills.map((bill) => ({
      amount: toNumber(bill.amount),
      date: Math.max(toUtcDay(new Date(bill.dueDate)), today),
    }));

    // Cumulative horizons: each window includes every item dated on or before its end.
    const horizons = HORIZON_DAYS.map((days) => {
      const end = today + days * DAY_MS;

      const expectedInflows = round2(
        inflows
          .filter((item) => item.date <= end)
          .reduce((sum, item) => sum + item.amount, 0),
      );
      const upcomingBills = round2(
        outflows
          .filter((item) => item.date <= end)
          .reduce((sum, item) => sum + item.amount, 0),
      );

      return {
        days,
        expected_inflows: expectedInflows,
        upcoming_bills: upcomingBills,
        net_cash: round2(expectedInflows - upcomingBills),
      };
    });

    return NextResponse.json({
      late_bridal_payment: lateBridalPayment,
      horizons,
    });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

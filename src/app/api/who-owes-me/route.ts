import { NextResponse } from 'next/server';
import db from '@/lib/db';

type OverdueClient = {
  invoice_id: string;
  client_name: string;
  outstanding_balance: number;
  days_overdue: number;
};

type Alert = {
  sentence: string;
  invoice_id: string;
  bill_id: string | null;
  outstanding_balance: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function toUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function toMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatMoney(value: number): string {
  return value.toFixed(2);
}

function formatDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const today = startOfTodayUtc();

    const invoices = await db.invoice.findMany({
      orderBy: { eventDate: 'asc' },
      include: {
        payments: { where: { status: 'received' } },
      },
    });

    const overdueRows = invoices
      .map((invoice) => {
        const receivedTotal = invoice.payments.reduce(
          (sum, payment) => sum + payment.amount.toNumber(),
          0,
        );
        const outstanding = toMoney(
          invoice.totalFee.toNumber() - invoice.advancePaid.toNumber() - receivedTotal,
        );
        const eventDay = toUtcDay(invoice.eventDate);
        const daysOverdue = Math.floor((today.getTime() - eventDay.getTime()) / DAY_MS);

        return {
          invoiceId: invoice.id,
          clientName: invoice.clientName,
          outstanding,
          daysOverdue,
        };
      })
      .filter((row) => row.outstanding > 0 && row.daysOverdue > 0)
      .sort((a, b) => b.daysOverdue - a.daysOverdue);

    const upcomingBills = await db.bill.findMany({
      where: {
        isPaid: false,
        dueDate: { gte: today },
      },
      orderBy: { dueDate: 'asc' },
    });

    const overdueClients: OverdueClient[] = overdueRows.map((row) => ({
      invoice_id: row.invoiceId,
      client_name: row.clientName,
      outstanding_balance: row.outstanding,
      days_overdue: row.daysOverdue,
    }));

    const alerts: Alert[] = overdueRows.map((row, index) => {
      const bill = upcomingBills[index] ?? null;

      const sentence = bill
        ? `Chase ${row.clientName}'s balance of ₹${formatMoney(row.outstanding)} today to cover ${bill.name} of ₹${formatMoney(bill.amount.toNumber())} due ${formatDay(bill.dueDate)}.`
        : `Chase ${row.clientName}'s overdue balance of ₹${formatMoney(row.outstanding)}, ${row.daysOverdue} days late.`;

      return {
        sentence,
        invoice_id: row.invoiceId,
        bill_id: bill ? bill.id : null,
        outstanding_balance: row.outstanding,
      };
    });

    return NextResponse.json({ alerts, overdue_clients: overdueClients });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
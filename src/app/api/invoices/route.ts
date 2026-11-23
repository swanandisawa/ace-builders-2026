import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import type { Invoice } from '@/types/invoice';

type InvoiceRow = Prisma.InvoiceGetPayload<{ include: { payments: true } }>;

function startOfToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function toDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

/**
 * Pending balance = total fee minus advance paid minus sum of received payments, floored at 0.
 */
function toInvoiceJson(row: InvoiceRow, today: Date): Invoice {
  let received = new Prisma.Decimal(0);
  for (const payment of row.payments) {
    if (payment.status === 'received') {
      received = received.plus(payment.amount);
    }
  }

  let pending = row.totalFee.minus(row.advancePaid).minus(received);
  if (pending.isNegative()) {
    pending = new Prisma.Decimal(0);
  }

  let balance = row.totalFee.minus(row.advancePaid);
  if (balance.isNegative()) {
    balance = new Prisma.Decimal(0);
  }

  let status: Invoice['status'];
  if (pending.lte(0)) {
    status = 'paid';
  } else if (row.dueDate && row.dueDate.getTime() < today.getTime()) {
    status = 'overdue';
  } else {
    status = 'pending';
  }

  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    clientName: row.clientName,
    eventDate: toDateOnly(row.eventDate),
    dueDate: row.dueDate ? toDateOnly(row.dueDate) : null,
    totalFee: row.totalFee.toNumber(),
    advancePaid: row.advancePaid.toNumber(),
    balanceDue: balance.toNumber(),
    pendingBalance: pending.toNumber(),
    receivedTotal: received.toNumber(),
    status,
  };
}

function parseAmount(raw: unknown): Prisma.Decimal | null {
  let text: string;
  if (typeof raw === 'number') {
    if (!Number.isFinite(raw)) return null;
    text = String(raw);
  } else if (typeof raw === 'string') {
    text = raw.trim();
  } else {
    return null;
  }
  if (!/^-?\d+(\.\d+)?$/.test(text)) return null;
  return new Prisma.Decimal(text);
}

function parseDate(raw: unknown): Date | null {
  if (typeof raw !== 'string') return null;
  const text = raw.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const date = new Date(`${text}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  if (date.toISOString().slice(0, 10) !== text) return null;
  return date;
}

function fail(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export async function GET() {
  try {
    const rows = await db.invoice.findMany({
      include: { payments: { where: { status: 'received' } } },
      orderBy: { eventDate: 'asc' },
    });
    const today = startOfToday();
    return NextResponse.json({ invoices: rows.map((row) => toInvoiceJson(row, today)) });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return fail('Invalid request body');
  }
  const input = body as Record<string, unknown>;

  // Client name
  const clientName = typeof input.clientName === 'string' ? input.clientName.trim() : '';
  if (clientName.length === 0) {
    return fail("Please enter the client's name.");
  }
  if (clientName.length > 100) {
    return fail('Client name must be 100 characters or fewer.');
  }

  // Event date
  if (input.eventDate === undefined || input.eventDate === null || input.eventDate === '') {
    return fail('Please choose the event date.');
  }
  const eventDate = parseDate(input.eventDate);
  if (!eventDate) {
    return fail('Enter a valid date for the event.');
  }

  // Optional due date
  let dueDate: Date | null = null;
  if (input.dueDate !== undefined && input.dueDate !== null && input.dueDate !== '') {
    dueDate = parseDate(input.dueDate);
    if (!dueDate) {
      return fail('Enter a valid due date.');
    }
  }

  // Total fee
  if (input.totalFee === undefined || input.totalFee === null || input.totalFee === '') {
    return fail('Please enter the total fee.');
  }
  const totalFee = parseAmount(input.totalFee);
  if (!totalFee) {
    return fail('Enter the total fee.');
  }
  if (totalFee.lte(0)) {
    return fail('Total fee must be more than zero.');
  }
  if (totalFee.decimalPlaces() > 2) {
    return fail('Enter the amount with no more than two decimal places.');
  }

  // Advance paid
  const advanceRaw = input.advancePaid;
  const advancePaid =
    advanceRaw === undefined || advanceRaw === null || advanceRaw === ''
      ? new Prisma.Decimal(0)
      : parseAmount(advanceRaw);
  if (
    !advancePaid ||
    advancePaid.isNegative() ||
    advancePaid.gt(totalFee) ||
    advancePaid.decimalPlaces() > 2
  ) {
    return fail('Advance paid must be between 0 and the total fee.');
  }

  const balance = totalFee.minus(advancePaid);
  const status: 'paid' | 'pending' = balance.isZero() ? 'paid' : 'pending';
  const today = startOfToday();

  try {
    const created = await db.invoice.create({
      data: {
        clientName,
        eventDate,
        dueDate,
        totalFee,
        advancePaid,
        balanceDue: balance,
        pendingBalance: balance,
        status,
        payments: advancePaid.gt(0)
          ? {
              create: {
                amount: advancePaid,
                status: 'received',
                receivedOn: today,
                receivedAt: new Date(),
              },
            }
          : undefined,
      },
      include: { payments: true },
    });

    return NextResponse.json({ invoice: toInvoiceJson(created, today) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

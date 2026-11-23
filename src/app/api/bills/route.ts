import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Bill } from '@/types/bill';

const BILL_CATEGORIES = ['rent', 'restock', 'other'] as const;
type BillCategoryValue = (typeof BILL_CATEGORIES)[number];

const MAX_NAME_LENGTH = 60;
const MAX_AMOUNT = 1_000_000;
const HORIZON_DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;

type BillRow = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  category: string;
  amount: { toString(): string };
  dueDate: Date;
  status: string;
  isPaid: boolean;
  paidAt: Date | null;
};

type ParsedBillInput =
  | { ok: true; name: string; category: BillCategoryValue; amount: string; dueDate: Date }
  | { ok: false; error: string };

function toBill(row: BillRow): Bill {
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    name: row.name,
    category: row.category as Bill['category'],
    amount: Number(row.amount.toString()),
    dueDate: row.dueDate.toISOString(),
    status: row.status as Bill['status'],
    isPaid: row.isPaid,
    paidAt: row.paidAt ? row.paidAt.toISOString() : null,
  } as Bill;
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function isBillCategory(value: string): value is BillCategoryValue {
  return (BILL_CATEGORIES as readonly string[]).includes(value);
}

function parseDueDate(raw: string): Date | null {
  let year: number;
  let month: number;
  let day: number;

  const ddmmyyyy = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw);
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);

  if (ddmmyyyy) {
    day = Number(ddmmyyyy[1]);
    month = Number(ddmmyyyy[2]);
    year = Number(ddmmyyyy[3]);
  } else if (iso) {
    year = Number(iso[1]);
    month = Number(iso[2]);
    day = Number(iso[3]);
  } else {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

function parseBillInput(input: Record<string, unknown>): ParsedBillInput {
  // Name
  if (input.name === undefined || input.name === null || typeof input.name !== 'string') {
    return { ok: false, error: 'Please enter a name for this bill.' };
  }
  const name = input.name.trim();
  if (name.length === 0) {
    return {
      ok: false,
      error: 'Enter a name for this bill, such as Studio rent or Lash restock.',
    };
  }
  if (name.length > MAX_NAME_LENGTH) {
    return { ok: false, error: 'Keep the bill name to 60 characters or fewer.' };
  }

  // Amount
  if (input.amount === undefined || input.amount === null || input.amount === '') {
    return { ok: false, error: 'Please enter the amount for this bill.' };
  }
  const rawAmount =
    typeof input.amount === 'number'
      ? String(input.amount)
      : typeof input.amount === 'string'
        ? input.amount.trim()
        : '';
  if (!/^\d+(\.\d+)?$/.test(rawAmount)) {
    return { ok: false, error: 'Enter an amount greater than 0 and up to 1,000,000.' };
  }
  const numericAmount = Number(rawAmount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0 || numericAmount > MAX_AMOUNT) {
    return { ok: false, error: 'Enter an amount greater than 0 and up to 1,000,000.' };
  }
  const fraction = rawAmount.split('.')[1] ?? '';
  if (fraction.length > 2) {
    return { ok: false, error: 'Use at most two decimal places for the amount.' };
  }

  // Due date
  if (input.dueDate === undefined || input.dueDate === null || input.dueDate === '') {
    return { ok: false, error: 'Please choose a due date for this bill.' };
  }
  if (typeof input.dueDate !== 'string') {
    return { ok: false, error: 'Please enter a valid due date.' };
  }
  const dueDate = parseDueDate(input.dueDate.trim());
  if (!dueDate) {
    return { ok: false, error: 'Please enter a valid due date.' };
  }

  // Category (defaults to other)
  let category: BillCategoryValue = 'other';
  if (input.category !== undefined && input.category !== null && input.category !== '') {
    if (typeof input.category !== 'string' || !isBillCategory(input.category)) {
      return { ok: false, error: 'Please choose a valid category for this bill.' };
    }
    category = input.category;
  }

  return { ok: true, name, category, amount: rawAmount, dueDate };
}

export async function GET() {
  try {
    const today = startOfUtcDay(new Date());
    const horizon = new Date(today.getTime() + HORIZON_DAYS * DAY_MS);

    const rows = await db.bill.findMany({
      where: {
        isPaid: false,
        dueDate: { lte: horizon },
      },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json({ bills: rows.map(toBill) });
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
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = parseBillInput(body as Record<string, unknown>);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const row = await db.bill.create({
      data: {
        name: parsed.name,
        category: parsed.category,
        amount: parsed.amount,
        dueDate: parsed.dueDate,
        status: 'upcoming',
        isPaid: false,
      },
    });

    return NextResponse.json({ bill: toBill(row) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

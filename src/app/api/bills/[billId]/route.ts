import { NextResponse } from 'next/server';
import { BillCategory, Prisma, type Bill } from '@prisma/client';
import { db } from '@/lib/db';

type RouteContext = { params: { billId: string } };

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NAME_MAX_LENGTH = 60;
const AMOUNT_MAX = 1_000_000;

const MSG = {
  invalidJson: 'Invalid JSON body',
  notObject: 'Request body must be a JSON object',
  nothingToUpdate: 'No changes were provided.',
  notFound: 'Not found',
  internal: 'Internal error',
  alreadyPaid: 'This bill is already paid and can no longer be edited.',
  nameRequired: 'Enter a name for this bill, such as Studio rent or Lash restock.',
  nameTooLong: 'Keep the bill name to 60 characters or fewer.',
  amountRequired: 'Please enter the amount for this bill.',
  amountRange: 'Enter an amount greater than 0 and up to 1,000,000.',
  amountDecimals: 'Use at most two decimal places for the amount.',
  dueDateRequired: 'Choose the date this bill is due.',
  dueDateInvalid: 'Enter a valid date for the due date.',
  categoryInvalid: 'Please choose a valid category for this bill.',
} as const;

function serializeBill(bill: Bill) {
  return {
    id: bill.id,
    createdAt: bill.createdAt.toISOString(),
    updatedAt: bill.updatedAt.toISOString(),
    name: bill.name,
    category: bill.category,
    amount: Number(bill.amount.toString()),
    dueDate: bill.dueDate.toISOString().slice(0, 10),
    status: bill.status,
    isPaid: bill.isPaid,
    paidAt: bill.paidAt ? bill.paidAt.toISOString() : null,
  };
}

function isNotFoundError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
}

function notFoundResponse() {
  return NextResponse.json({ error: MSG.notFound }, { status: 404 });
}

function internalErrorResponse() {
  return NextResponse.json({ error: MSG.internal }, { status: 500 });
}

function isBillCategory(value: unknown): value is BillCategory {
  return typeof value === 'string' && Object.values(BillCategory).some((c) => c === value);
}

function validateName(value: unknown): Result<string> {
  if (typeof value !== 'string') return { ok: false, error: MSG.nameRequired };
  const trimmed = value.trim();
  if (trimmed.length === 0) return { ok: false, error: MSG.nameRequired };
  if (trimmed.length > NAME_MAX_LENGTH) return { ok: false, error: MSG.nameTooLong };
  return { ok: true, value: trimmed };
}

function validateAmount(value: unknown): Result<number> {
  if (value === undefined || value === null || value === '') {
    return { ok: false, error: MSG.amountRequired };
  }
  if (typeof value !== 'number' && typeof value !== 'string') {
    return { ok: false, error: MSG.amountRange };
  }
  const text = String(value).trim();
  const amount = Number(text);
  if (!Number.isFinite(amount) || amount <= 0 || amount > AMOUNT_MAX) {
    return { ok: false, error: MSG.amountRange };
  }
  const dot = text.indexOf('.');
  if (dot !== -1 && text.length - dot - 1 > 2) {
    return { ok: false, error: MSG.amountDecimals };
  }
  return { ok: true, value: amount };
}

function parseDueDate(value: string): Date | null {
  const trimmed = value.trim();

  const dmy = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);

  let year: number;
  let month: number;
  let day: number;

  if (dmy) {
    day = Number(dmy[1]);
    month = Number(dmy[2]);
    year = Number(dmy[3]);
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

function validateDueDate(value: unknown): Result<Date> {
  if (value === undefined || value === null || value === '') {
    return { ok: false, error: MSG.dueDateRequired };
  }
  if (typeof value !== 'string') return { ok: false, error: MSG.dueDateInvalid };
  const parsed = parseDueDate(value);
  if (!parsed) return { ok: false, error: MSG.dueDateInvalid };
  return { ok: true, value: parsed };
}

function validateCategory(value: unknown): Result<BillCategory> {
  if (value === undefined || value === null || value === '') {
    return { ok: true, value: BillCategory.other };
  }
  if (!isBillCategory(value)) return { ok: false, error: MSG.categoryInvalid };
  return { ok: true, value };
}

export async function GET(_request: Request, { params }: RouteContext) {
  const billId = params.billId;
  if (!UUID_RE.test(billId)) return notFoundResponse();

  try {
    const bill = await db.bill.findUnique({ where: { id: billId } });
    if (!bill) return notFoundResponse();
    return NextResponse.json({ bill: serializeBill(bill) });
  } catch {
    return internalErrorResponse();
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const billId = params.billId;
  if (!UUID_RE.test(billId)) return notFoundResponse();

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: MSG.invalidJson }, { status: 400 });
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return NextResponse.json({ error: MSG.notObject }, { status: 400 });
  }
  const body = raw as Record<string, unknown>;

  const data: Prisma.BillUpdateInput = {};

  if (body.name !== undefined) {
    const result = validateName(body.name);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    data.name = result.value;
  }

  if (body.category !== undefined) {
    const result = validateCategory(body.category);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    data.category = result.value;
  }

  if (body.amount !== undefined) {
    const result = validateAmount(body.amount);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    data.amount = result.value;
  }

  if (body.dueDate !== undefined) {
    const result = validateDueDate(body.dueDate);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    data.dueDate = result.value;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: MSG.nothingToUpdate }, { status: 400 });
  }

  try {
    const existing = await db.bill.findUnique({ where: { id: billId } });
    if (!existing) return notFoundResponse();
    if (existing.isPaid) {
      return NextResponse.json({ error: MSG.alreadyPaid }, { status: 409 });
    }

    const bill = await db.bill.update({ where: { id: billId }, data });
    return NextResponse.json({ bill: serializeBill(bill) });
  } catch (error) {
    if (isNotFoundError(error)) return notFoundResponse();
    return internalErrorResponse();
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const billId = params.billId;
  if (!UUID_RE.test(billId)) return notFoundResponse();

  try {
    await db.bill.delete({ where: { id: billId } });
    return NextResponse.json({ deleted: true, id: billId });
  } catch (error) {
    if (isNotFoundError(error)) return notFoundResponse();
    return internalErrorResponse();
  }
}
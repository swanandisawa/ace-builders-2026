import { NextResponse } from 'next/server';
import { Prisma, InvoiceStatus } from '@prisma/client';
import type { Invoice as InvoiceRecord, Payment as PaymentRecord } from '@prisma/client';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;
const NUMBER_RE = /^-?\d+(\.\d+)?$/;
const CLIENT_NAME_MAX = 100;
const DAY_MS = 24 * 60 * 60 * 1000;
const ADVANCE_MESSAGE = 'Advance paid must be between 0 and the total fee.';

interface RouteContext {
  params: { invoiceId: string };
}

interface InvoiceJson {
  id: string;
  createdAt: string;
  updatedAt: string;
  clientName: string;
  eventDate: string;
  dueDate: string | null;
  totalFee: number;
  advancePaid: number;
  balanceDue: number;
  pendingBalance: number;
  status: InvoiceStatus;
}

interface PaymentJson {
  id: string;
  createdAt: string;
  updatedAt: string;
  invoiceId: string;
  amount: number;
  status: string;
  receivedOn: string | null;
  receivedAt: string | null;
}

interface PatchData {
  clientName?: string;
  eventDate?: Date;
  dueDate?: Date | null;
  totalFee?: Prisma.Decimal;
  advancePaid?: Prisma.Decimal;
}

type PatchResult = { ok: true; data: PatchData } | { ok: false; error: string };

type InvoiceWithPayments = InvoiceRecord & { payments: PaymentRecord[] };

type DerivableInvoice = Pick<InvoiceRecord, 'totalFee' | 'advancePaid' | 'eventDate' | 'dueDate'> & {
  payments: PaymentRecord[];
};

interface DerivedState {
  balanceDue: Prisma.Decimal;
  remaining: Prisma.Decimal;
  status: InvoiceStatus;
  daysOverdue: number;
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function isPrismaNotFound(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
}

function isValidId(id: string): boolean {
  return UUID_RE.test(id);
}

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function dateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function parseDateInput(value: unknown): Date | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (DATE_ONLY_RE.test(trimmed)) {
    const parsed = new Date(`${trimmed}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime()) || dateOnly(parsed) !== trimmed) return null;
    return parsed;
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
}

function readMoney(value: unknown): { amount: Prisma.Decimal; decimals: number } | null {
  const raw =
    typeof value === 'number' ? String(value) : typeof value === 'string' ? value.trim() : '';
  if (!NUMBER_RE.test(raw)) return null;
  const decimals = raw.includes('.') ? raw.split('.')[1].length : 0;
  return { amount: new Prisma.Decimal(raw), decimals };
}

function clampZero(value: Prisma.Decimal): Prisma.Decimal {
  return value.isNeg() ? new Prisma.Decimal(0) : value;
}

function sumReceived(payments: PaymentRecord[]): Prisma.Decimal {
  return payments.reduce(
    (total, payment) => (payment.status === 'received' ? total.plus(payment.amount) : total),
    new Prisma.Decimal(0),
  );
}

function deriveState(invoice: DerivableInvoice): DerivedState {
  const balanceDue = clampZero(invoice.totalFee.minus(invoice.advancePaid));
  const remaining = clampZero(invoice.totalFee.minus(invoice.advancePaid).minus(sumReceived(invoice.payments)));

  // Overdue is counted from the due date, falling back to the event date (as in Who Owes Me).
  const dueOn = invoice.dueDate ?? invoice.eventDate;
  const rawDays = Math.floor((startOfTodayUtc().getTime() - dueOn.getTime()) / DAY_MS);
  const daysOverdue = remaining.gt(0) && rawDays > 0 ? rawDays : 0;

  let status: InvoiceStatus = InvoiceStatus.pending;
  if (remaining.lte(0)) {
    status = InvoiceStatus.paid;
  } else if (daysOverdue > 0) {
    status = InvoiceStatus.overdue;
  }

  return { balanceDue, remaining, status, daysOverdue };
}

function serializeInvoice(invoice: InvoiceRecord): InvoiceJson {
  return {
    id: invoice.id,
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString(),
    clientName: invoice.clientName,
    eventDate: dateOnly(invoice.eventDate),
    dueDate: invoice.dueDate ? dateOnly(invoice.dueDate) : null,
    totalFee: invoice.totalFee.toNumber(),
    advancePaid: invoice.advancePaid.toNumber(),
    balanceDue: invoice.balanceDue.toNumber(),
    pendingBalance: invoice.pendingBalance.toNumber(),
    status: invoice.status,
  };
}

function serializePayment(payment: PaymentRecord): PaymentJson {
  return {
    id: payment.id,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
    invoiceId: payment.invoiceId,
    amount: payment.amount.toNumber(),
    status: payment.status,
    receivedOn: payment.receivedOn ? dateOnly(payment.receivedOn) : null,
    receivedAt: payment.receivedAt ? payment.receivedAt.toISOString() : null,
  };
}

function validatePatch(body: Record<string, unknown>, current: InvoiceWithPayments): PatchResult {
  const fail = (error: string): PatchResult => ({ ok: false, error });
  const data: PatchData = {};

  if (body.clientName !== undefined) {
    const name = typeof body.clientName === 'string' ? body.clientName.trim() : '';
    if (!name) return fail("Please enter the client's name.");
    if (name.length > CLIENT_NAME_MAX) return fail('Client name must be 100 characters or fewer.');
    data.clientName = name;
  }

  if (body.eventDate !== undefined) {
    const eventDate = parseDateInput(body.eventDate);
    if (!eventDate) return fail('Please choose a valid event date.');
    data.eventDate = eventDate;
  }

  if (body.dueDate !== undefined) {
    if (body.dueDate === null || body.dueDate === '') {
      data.dueDate = null;
    } else {
      const dueDate = parseDateInput(body.dueDate);
      if (!dueDate) return fail('Enter a valid date for the due date.');
      data.dueDate = dueDate;
    }
  }

  if (body.totalFee !== undefined) {
    const money = readMoney(body.totalFee);
    if (!money) return fail('Enter the total fee.');
    if (money.decimals > 2) return fail('Enter the amount with no more than two decimal places.');
    if (!money.amount.gt(0)) return fail('Total fee must be more than zero.');
    data.totalFee = money.amount;
  }

  if (body.advancePaid !== undefined) {
    const money = readMoney(body.advancePaid);
    if (!money || money.decimals > 2 || money.amount.isNeg()) return fail(ADVANCE_MESSAGE);
    data.advancePaid = money.amount;
  }

  if (Object.keys(data).length === 0) return fail('No changes were provided.');

  const totalFee = data.totalFee ?? current.totalFee;
  const advancePaid = data.advancePaid ?? current.advancePaid;

  // Advance guard: the advance may never exceed the (possibly corrected) total fee.
  if (advancePaid.gt(totalFee)) return fail(ADVANCE_MESSAGE);

  // The fee may not drop below what has already been collected, or the balance would go negative.
  const collected = advancePaid.plus(sumReceived(current.payments));
  if (totalFee.lt(collected)) {
    return fail('Total fee cannot be less than what has already been paid.');
  }

  return { ok: true, data };
}

export async function GET(_request: Request, { params }: RouteContext) {
  const invoiceId = params.invoiceId;
  if (!isValidId(invoiceId)) return errorResponse('Not found', 404);

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: { orderBy: { createdAt: 'asc' } } },
    });
    if (!invoice) return errorResponse('Not found', 404);

    const state = deriveState(invoice);

    return NextResponse.json({
      invoice: serializeInvoice(invoice),
      payments: invoice.payments.map(serializePayment),
      remaining_balance: state.remaining.toNumber(),
      days_overdue: state.daysOverdue,
    });
  } catch {
    return errorResponse('Internal error', 500);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const invoiceId = params.invoiceId;
  if (!isValidId(invoiceId)) return errorResponse('Not found', 404);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return errorResponse('Invalid JSON body', 400);
  }

  try {
    const current = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });
    if (!current) return errorResponse('Not found', 404);

    const validated = validatePatch(body as Record<string, unknown>, current);
    if (!validated.ok) return errorResponse(validated.error, 400);

    const { data } = validated;
    const state = deriveState({
      totalFee: data.totalFee ?? current.totalFee,
      advancePaid: data.advancePaid ?? current.advancePaid,
      eventDate: data.eventDate ?? current.eventDate,
      dueDate: data.dueDate !== undefined ? data.dueDate : current.dueDate,
      payments: current.payments,
    });

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        ...data,
        balanceDue: state.balanceDue,
        pendingBalance: state.remaining,
        status: state.status,
      },
      include: { payments: true },
    });

    return NextResponse.json({ invoice: serializeInvoice(updated) });
  } catch (error) {
    if (isPrismaNotFound(error)) return errorResponse('Not found', 404);
    return errorResponse('Internal error', 500);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const invoiceId = params.invoiceId;
  if (!isValidId(invoiceId)) return errorResponse('Not found', 404);

  try {
    // Payments are removed by the database cascade defined on Payment.invoice.
    await prisma.invoice.delete({ where: { id: invoiceId } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    if (isPrismaNotFound(error)) return errorResponse('Not found', 404);
    return errorResponse('Internal error', 500);
  }
}
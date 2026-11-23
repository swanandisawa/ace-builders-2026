import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import type { Payment as PrismaPayment } from '@prisma/client';
import { prisma } from '@/lib/db';
import type { Payment } from '@/types/payment';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type RouteContext = {
  params: { invoiceId: string } | Promise<{ invoiceId: string }>;
};

const MSG_AMOUNT_REQUIRED = 'Enter the amount received.';
const MSG_AMOUNT_RANGE = 'Enter an amount greater than 0 and no more than the balance due.';
const MSG_AMOUNT_DECIMALS = 'Enter the amount with no more than two decimal places.';
const MSG_STATUS = 'Payments are recorded as expected.';

async function getInvoiceId(context: RouteContext): Promise<string> {
  const { invoiceId } = await context.params;
  return invoiceId;
}

function toPayment(row: PrismaPayment): Payment {
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    invoiceId: row.invoiceId,
    amount: Number(row.amount),
    status: row.status,
    receivedOn: row.receivedOn ? row.receivedOn.toISOString() : null,
    receivedAt: row.receivedAt ? row.receivedAt.toISOString() : null,
  };
}

function handleError(error: unknown): NextResponse {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (error.code === 'P2034') {
      return NextResponse.json(
        { error: 'The balance changed while saving. Please try again.' },
        { status: 409 },
      );
    }
  }
  return NextResponse.json({ error: 'Internal error' }, { status: 500 });
}

export async function GET(_request: Request, context: RouteContext) {
  const invoiceId = await getInvoiceId(context);

  if (!UUID_PATTERN.test(invoiceId)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { id: true },
    });
    if (!invoice) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const rows = await prisma.payment.findMany({
      where: { invoiceId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ payments: rows.map(toPayment) });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  const invoiceId = await getInvoiceId(context);

  if (!UUID_PATTERN.test(invoiceId)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let body: { amount?: unknown; status?: unknown };
  try {
    body = (await request.json()) as { amount?: unknown; status?: unknown };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (body === null || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (body.status !== undefined && body.status !== 'expected') {
    return NextResponse.json({ error: MSG_STATUS }, { status: 400 });
  }

  if (body.amount === undefined || body.amount === null || body.amount === '') {
    return NextResponse.json({ error: MSG_AMOUNT_REQUIRED }, { status: 400 });
  }

  if (typeof body.amount !== 'number' && typeof body.amount !== 'string') {
    return NextResponse.json({ error: MSG_AMOUNT_RANGE }, { status: 400 });
  }

  let amount: Prisma.Decimal;
  try {
    amount = new Prisma.Decimal(body.amount);
  } catch {
    return NextResponse.json({ error: MSG_AMOUNT_RANGE }, { status: 400 });
  }

  if (!amount.isFinite() || amount.lte(0)) {
    return NextResponse.json({ error: MSG_AMOUNT_RANGE }, { status: 400 });
  }

  if (amount.decimalPlaces() > 2) {
    return NextResponse.json({ error: MSG_AMOUNT_DECIMALS }, { status: 400 });
  }

  try {
    const outcome = await prisma.$transaction(
      async (tx) => {
        const invoice = await tx.invoice.findUnique({
          where: { id: invoiceId },
          select: { id: true, totalFee: true, advancePaid: true },
        });
        if (!invoice) {
          return { kind: 'not-found' as const };
        }

        const received = await tx.payment.aggregate({
          where: { invoiceId, status: 'received' },
          _sum: { amount: true },
        });
        const receivedSum = received._sum.amount ?? new Prisma.Decimal(0);

        let remaining = invoice.totalFee.minus(invoice.advancePaid).minus(receivedSum);
        if (remaining.lt(0)) {
          remaining = new Prisma.Decimal(0);
        }

        if (amount.gt(remaining)) {
          return { kind: 'out-of-range' as const };
        }

        const payment = await tx.payment.create({
          data: {
            invoiceId,
            amount,
            status: 'expected',
          },
        });

        return { kind: 'ok' as const, payment };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    if (outcome.kind === 'not-found') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (outcome.kind === 'out-of-range') {
      return NextResponse.json({ error: MSG_AMOUNT_RANGE }, { status: 400 });
    }

    return NextResponse.json({ payment: toPayment(outcome.payment) }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
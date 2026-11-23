import { NextResponse } from 'next/server';
import { Prisma, type InvoiceStatus } from '@prisma/client';
import { prisma } from '@/lib/db';

type ReceiveOutcome =
  | { kind: 'ok'; payment: Prisma.PaymentGetPayload<object> }
  | { kind: 'missing' }
  | { kind: 'already' }
  | { kind: 'invalid' };

export async function POST(
  _request: Request,
  { params }: { params: { paymentId: string } },
) {
  const paymentId = params.paymentId;

  try {
    const outcome: ReceiveOutcome = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { id: paymentId } });
      if (!payment) {
        return { kind: 'missing' };
      }
      if (payment.status === 'received') {
        return { kind: 'already' };
      }

      const invoice = await tx.invoice.findUnique({ where: { id: payment.invoiceId } });
      if (!invoice) {
        return { kind: 'missing' };
      }

      const receivedAgg = await tx.payment.aggregate({
        where: { invoiceId: invoice.id, status: 'received' },
        _sum: { amount: true },
      });
      const alreadyReceived = receivedAgg._sum.amount ?? new Prisma.Decimal(0);

      // Pending balance before this payment is marked received.
      const pendingBefore = invoice.totalFee
        .minus(invoice.advancePaid)
        .minus(alreadyReceived);

      // Amount must be greater than zero and no more than the current pending balance.
      if (payment.amount.lte(0) || payment.amount.gt(pendingBefore)) {
        return { kind: 'invalid' };
      }

      const now = new Date();
      const today = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
      );

      // Conditional update guards against a concurrent receive of the same payment.
      const claimed = await tx.payment.updateMany({
        where: { id: payment.id, status: 'expected' },
        data: { status: 'received', receivedOn: today, receivedAt: now },
      });
      if (claimed.count === 0) {
        return { kind: 'already' };
      }

      let pendingAfter = pendingBefore.minus(payment.amount);
      if (pendingAfter.isNeg()) {
        pendingAfter = new Prisma.Decimal(0);
      }

      const isPaid = pendingAfter.lte(0);
      const isOverdue = !isPaid && invoice.eventDate.getTime() < today.getTime();

      let status: InvoiceStatus = 'pending';
      if (isPaid) {
        status = 'paid';
      } else if (isOverdue) {
        status = 'overdue';
      }

      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          balanceDue: pendingAfter,
          pendingBalance: pendingAfter,
          status,
        },
      });

      const updatedPayment = await tx.payment.findUnique({ where: { id: payment.id } });
      if (!updatedPayment) {
        return { kind: 'missing' };
      }

      return { kind: 'ok', payment: updatedPayment };
    });

    if (outcome.kind === 'missing') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (outcome.kind === 'already') {
      return NextResponse.json(
        { error: 'Payment is already received' },
        { status: 409 },
      );
    }
    if (outcome.kind === 'invalid') {
      return NextResponse.json(
        { error: 'Enter an amount greater than 0 and no more than the balance due.' },
        { status: 400 },
      );
    }

    return NextResponse.json({ payment: outcome.payment });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function formatMoney(value: number): string {
  return value.toFixed(2);
}

function buildReminderText(clientName: string, outstandingBalance: number): string {
  return (
    `Hi ${clientName}, hope you are doing well! ` +
    `Friendly reminder that the remaining balance of ₹${formatMoney(outstandingBalance)} ` +
    `for your booking is still outstanding. Please let me know if you have any questions, ` +
    `and thank you so much.`
  );
}

export async function GET(
  _request: Request,
  { params }: { params: { invoiceId: string } }
) {
  const invoiceId = params.invoiceId;

  if (!UUID_PATTERN.test(invoiceId)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      select: {
        clientName: true,
        totalFee: true,
        advancePaid: true,
        payments: {
          where: { status: 'received' },
          select: { amount: true },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const receivedTotal = invoice.payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );

    const outstandingBalance =
      Math.round(
        (Number(invoice.totalFee) - Number(invoice.advancePaid) - receivedTotal) * 100
      ) / 100;

    const canRemind = outstandingBalance > 0;

    return NextResponse.json({
      client_name: invoice.clientName,
      outstanding_balance: canRemind ? outstandingBalance : 0,
      can_remind: canRemind,
      reminder_text: canRemind
        ? buildReminderText(invoice.clientName, outstandingBalance)
        : '',
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
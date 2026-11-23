import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(
  _request: Request,
  { params }: { params: { billId: string } }
) {
  const billId = params.billId;

  if (!UUID_PATTERN.test(billId)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const existing = await db.bill.findUnique({ where: { id: billId } });

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (existing.isPaid) {
      return NextResponse.json(
        { error: 'Bill is already marked as paid' },
        { status: 409 }
      );
    }

    const bill = await db.bill.update({
      where: { id: billId },
      data: {
        isPaid: true,
        status: 'paid',
        paidAt: new Date(),
      },
    });

    return NextResponse.json({ bill });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
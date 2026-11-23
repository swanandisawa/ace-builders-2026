import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DEFAULT_ADVANCE_PAID = 0;

function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function GET() {
  return NextResponse.json({
    event_date: todayIsoDate(),
    advance_paid: DEFAULT_ADVANCE_PAID,
  });
}

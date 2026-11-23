// Demo data — rendered by the pipeline from prisma/schema.prisma. One account per
// role (<role>@example.com, password DEMO_PASSWORD from .env) plus demo@example.com, then every table,
// parents first. Every insert is non-fatal; safe to run again.
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
const ids: Record<string, Array<string | number>> = {};
const users: Record<string, string | number> = {};
function pick(model: string, i: number): string | number | undefined {
  const list = ids[model] || [];
  return list.length ? list[i % list.length] : undefined;
}
function why(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  return m.split('\n').filter(Boolean).slice(-1)[0]?.slice(0, 200) ?? m;
}

async function main() {
  console.log('[seed] demo-user: MISSING — this app has no user model');
  try {
    if ((await db.bill.count()) === 0) {
      const rows: Array<() => Record<string, unknown>> = [
        () => ({ name: "Studio rent - Andheri West", category: "rent", amount: 28000, dueDate: new Date("2026-11-25T00:00:00.000Z"), status: "upcoming", isPaid: false }),
        () => ({ name: "Studio rent - Andheri West", category: "rent", amount: 28000, dueDate: new Date("2025-03-01T00:00:00.000Z"), status: "paid", isPaid: true, paidAt: new Date("2025-02-28T11:20:00.000Z") }),
        () => ({ name: "Foundation and brush restock", category: "restock", amount: 6500, dueDate: new Date("2026-12-01T00:00:00.000Z"), status: "upcoming", isPaid: false }),
        () => ({ name: "Lash and adhesive restock", category: "restock", amount: 3200, dueDate: new Date("2025-03-15T00:00:00.000Z"), status: "paid", isPaid: true, paidAt: new Date("2025-03-12T09:45:00.000Z") }),
        () => ({ name: "Assistant day rate - Rhea", category: "other", amount: 4500, dueDate: new Date("2026-12-05T00:00:00.000Z"), status: "upcoming", isPaid: false }),
        () => ({ name: "Fuel and bridal parking", category: "other", amount: 1800, dueDate: new Date("2026-12-12T00:00:00.000Z"), status: "upcoming", isPaid: false }),
      ];
      let ok = 0;
      for (const row of rows) {
        try {
          const r = await db.bill.create({ data: row() as never });
          (ids["Bill"] ??= []).push((r as { id: string | number }).id);
          ok++;
        } catch (e) {
          console.log('[seed] Bill row skipped: ' + why(e));
        }
      }
      console.log(`[seed] Bill: ${ok}/${rows.length} rows`);
    } else {
      ids["Bill"] = (await db.bill.findMany({ take: 50, select: { id: true } } as never) as Array<{ id: string | number }>).map((r) => r.id);
    }
  } catch (e) {
    console.log('[seed] Bill skipped: ' + why(e));
  }
  try {
    if ((await db.invoice.count()) === 0) {
      const rows: Array<() => Record<string, unknown>> = [
        () => ({ clientName: "Priya Raman", eventDate: new Date("2025-03-08T00:00:00.000Z"), dueDate: new Date("2025-02-20T00:00:00.000Z"), totalFee: 48000, advancePaid: 15000, balanceDue: 33000, pendingBalance: 33000, status: "overdue" }),
        () => ({ clientName: "Ananya Desai", eventDate: new Date("2026-12-02T00:00:00.000Z"), dueDate: new Date("2026-11-26T00:00:00.000Z"), totalFee: 22000, advancePaid: 8000, balanceDue: 14000, pendingBalance: 14000, status: "pending" }),
        () => ({ clientName: "Meera Kapoor (Bridal)", eventDate: new Date("2026-12-08T00:00:00.000Z"), dueDate: new Date("2026-11-28T00:00:00.000Z"), totalFee: 75000, advancePaid: 30000, balanceDue: 45000, pendingBalance: 45000, status: "pending" }),
        () => ({ clientName: "Ritika Shah", eventDate: new Date("2025-02-14T00:00:00.000Z"), totalFee: 12500, advancePaid: 12500, balanceDue: 0, pendingBalance: 0, status: "paid" }),
        () => ({ clientName: "Sneha Iyer", eventDate: new Date("2025-01-30T00:00:00.000Z"), dueDate: new Date("2025-02-05T00:00:00.000Z"), totalFee: 18000, advancePaid: 0, balanceDue: 18000, pendingBalance: 18000, status: "overdue" }),
        () => ({ clientName: "Kavya Menon", eventDate: new Date("2026-12-18T00:00:00.000Z"), dueDate: new Date("2026-12-10T00:00:00.000Z"), totalFee: 36000, advancePaid: 10000, balanceDue: 26000, pendingBalance: 26000, status: "pending" }),
        () => ({ clientName: "Divya Nair", eventDate: new Date("2025-03-01T00:00:00.000Z"), totalFee: 9000, advancePaid: 9000, balanceDue: 0, pendingBalance: 0, status: "paid" }),
      ];
      let ok = 0;
      for (const row of rows) {
        try {
          const r = await db.invoice.create({ data: row() as never });
          (ids["Invoice"] ??= []).push((r as { id: string | number }).id);
          ok++;
        } catch (e) {
          console.log('[seed] Invoice row skipped: ' + why(e));
        }
      }
      console.log(`[seed] Invoice: ${ok}/${rows.length} rows`);
    } else {
      ids["Invoice"] = (await db.invoice.findMany({ take: 50, select: { id: true } } as never) as Array<{ id: string | number }>).map((r) => r.id);
    }
  } catch (e) {
    console.log('[seed] Invoice skipped: ' + why(e));
  }
  try {
    if ((await db.payment.count()) === 0) {
      const rows: Array<() => Record<string, unknown>> = [
        () => ({ invoiceId: pick("Invoice", 0), amount: 15000, status: "received", receivedOn: new Date("2025-02-18T00:00:00.000Z"), receivedAt: new Date("2025-02-18T10:30:00.000Z") }),
        () => ({ invoiceId: pick("Invoice", 1), amount: 14000, status: "expected" }),
        () => ({ invoiceId: pick("Invoice", 2), amount: 45000, status: "expected" }),
        () => ({ invoiceId: pick("Invoice", 3), amount: 12500, status: "received", receivedOn: new Date("2025-02-12T00:00:00.000Z"), receivedAt: new Date("2025-02-12T16:05:00.000Z") }),
        () => ({ invoiceId: pick("Invoice", 5), amount: 26000, status: "expected" }),
      ];
      let ok = 0;
      for (const row of rows) {
        try {
          const r = await db.payment.create({ data: row() as never });
          (ids["Payment"] ??= []).push((r as { id: string | number }).id);
          ok++;
        } catch (e) {
          console.log('[seed] Payment row skipped: ' + why(e));
        }
      }
      console.log(`[seed] Payment: ${ok}/${rows.length} rows`);
    } else {
      ids["Payment"] = (await db.payment.findMany({ take: 50, select: { id: true } } as never) as Array<{ id: string | number }>).map((r) => r.id);
    }
  } catch (e) {
    console.log('[seed] Payment skipped: ' + why(e));
  }
}

main()
  .then(async () => { await db.$disconnect(); })
  .catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(0); });

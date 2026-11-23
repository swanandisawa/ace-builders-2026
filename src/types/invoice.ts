// Auto-generated from prisma/schema.prisma — canonical Invoice shape.
// The API serializes these exact field names; UI components read them.
// Do not hand-edit — regenerate from the schema instead.

export const INVOICESTATUS_VALUES = ['pending', 'overdue', 'paid'] as const;
export type InvoiceStatus = 'pending' | 'overdue' | 'paid';
export type InvoiceStatusValue = InvoiceStatus;

export interface Invoice {
  id: string;
  createdAt: string;
  updatedAt: string;
  clientName: string;
  eventDate: string;
  dueDate?: string | null;
  totalFee: string;
  advancePaid: string;
  balanceDue: string;
  pendingBalance: string;
  receivedTotal: number;
  status: InvoiceStatus;
}


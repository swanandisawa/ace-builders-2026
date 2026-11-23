// Auto-generated from prisma/schema.prisma — canonical Payment shape.
// The API serializes these exact field names; UI components read them.
// Do not hand-edit — regenerate from the schema instead.

export const PAYMENTSTATUS_VALUES = ['expected', 'received'] as const;
export type PaymentStatus = 'expected' | 'received';
export type PaymentStatusValue = PaymentStatus;

export interface Payment {
  id: string;
  createdAt: string;
  updatedAt: string;
  invoiceId: string;
  amount: string;
  status: PaymentStatus;
  receivedOn?: string | null;
  receivedAt?: string | null;
}


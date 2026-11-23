// Auto-generated from prisma/schema.prisma — canonical Bill shape.
// The API serializes these exact field names; UI components read them.
// Do not hand-edit — regenerate from the schema instead.

export const BILLCATEGORY_VALUES = ['rent', 'restock', 'other'] as const;
export type BillCategory = 'rent' | 'restock' | 'other';
export type BillCategoryValue = BillCategory;

export const BILLSTATUS_VALUES = ['upcoming', 'paid'] as const;
export type BillStatus = 'upcoming' | 'paid';
export type BillStatusValue = BillStatus;

export interface Bill {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  category: BillCategory;
  amount: string;
  dueDate: string;
  status: BillStatus;
  isPaid: boolean;
  paidAt?: string | null;
}


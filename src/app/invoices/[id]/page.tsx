'use client';

import Link from 'next/link';
import InvoiceAmounts from '@/components/InvoiceAmounts';
import PaymentsReceived from '@/components/PaymentsReceived';
import PaymentReminderCard from '@/components/PaymentReminderCard';
import { useInvoice } from '@/hooks/useInvoice';
import { useReminder } from '@/hooks/useReminder';

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const invoiceId = params.id;
  const {
    invoice,
    payments,
    remainingBalance,
    daysOverdue,
    isLoading,
    isReceiving,
    error,
    receivePayment,
    recordPayment,
  } = useInvoice(invoiceId);
  const {
    reminderText,
    canRemind,
    isLoading: isReminderLoading,
    error: reminderError,
    copied,
    copyReminder,
  } = useReminder(invoiceId);

  if (error && !invoice) {
    return (
      <div className="mx-auto w-full max-w-2xl min-w-0 space-y-4 px-4 py-6">
        <p className="text-sm text-[hsl(var(--destructive))]" data-nexen-id="nx-4eca7f76-0">
          This invoice could not be loaded.
        </p>
        <Link
          href="/invoices"
          className="inline-flex h-10 items-center rounded-[var(--radius)] border border-border px-4 text-sm font-medium"
         data-nexen-id="nx-4eca7f76-1">
          Back to invoices
        </Link>
      </div>
    );
  }

  return (
    <div data-nexen-component="nx_app_invoices__id__page" className="mx-auto w-full max-w-2xl min-w-0 space-y-6 px-4 py-6">
      <header className="min-w-0 space-y-2" data-nexen-id="nx-4eca7f76-2">
        <Link
          href="/invoices"
          className="inline-flex text-sm text-muted-foreground hover:text-foreground"
         data-nexen-id="nx-4eca7f76-3">
          ← Back
        </Link>
        {isLoading && !invoice ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-7 w-48 max-w-full rounded-[var(--radius)] bg-muted" />
            <div className="h-4 w-32 rounded-[var(--radius)] bg-muted" />
          </div>
        ) : (
          <>
            <h1 className="break-words text-2xl font-semibold" data-nexen-id="nx-4eca7f76-4">
              {invoice?.clientName ?? 'Invoice'}
            </h1>
            <p className="text-sm text-muted-foreground" data-nexen-id="nx-4eca7f76-5">
              Event date: {invoice ? String(invoice.eventDate).slice(0, 10) : '—'}
            </p>
          </>
        )}
      </header>

      <InvoiceAmounts
        totalFee={invoice?.totalFee ?? 0}
        advancePaid={invoice?.advancePaid ?? 0}
        remainingBalance={remainingBalance}
        daysOverdue={daysOverdue}
        isLoading={isLoading}
      />

      <PaymentsReceived
        payments={payments}
        pendingBalance={remainingBalance}
        isReceiving={isReceiving}
        onReceive={(paymentId) => receivePayment(paymentId)}
        onRecord={recordPayment}
      />

      <PaymentReminderCard
        reminderText={reminderText ?? ''}
        canRemind={canRemind}
        isLoading={isReminderLoading}
        error={reminderError ? 'Could not load the payment reminder.' : null}
        copied={copied}
        onCopy={copyReminder}
      />
    </div>
  );
}
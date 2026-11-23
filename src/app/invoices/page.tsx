'use client';

import { useEffect, useState } from 'react';
import InvoiceList from '@/components/InvoiceList';
import { useInvoices } from '@/hooks/useInvoices';
import type { Invoice } from '@/types/invoice';

export default function InvoicesPage() {
  const { invoices, isLoading, error, refetch } = useInvoices();
  const safeInvoices: Invoice[] = Array.isArray(invoices) ? invoices : [];
  const [origin, setOrigin] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const bookingMessage = `Hi! You can book your bridal makeup here: ${origin ?? ''}/book`;

  return (
    <div data-nexen-component="nx_app_invoices_page" className="mx-auto w-full max-w-3xl min-w-0 px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {origin ? (
          <a
            href={`https://wa.me/?text=${encodeURIComponent(bookingMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center cursor-pointer relative z-10 rounded-[var(--radius)] border border-border bg-transparent px-4 text-sm font-medium text-foreground"
          >
            Send Booking Form on WhatsApp
          </a>
        ) : null}
      </div>

      {error ? (
        <section className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm" data-nexen-id="nx-a5b56746-0">
          <h1 className="text-xl font-semibold text-foreground" data-nexen-id="nx-a5b56746-1">Invoices</h1>
          <p className="mt-2 text-sm text-muted-foreground" data-nexen-id="nx-a5b56746-2">
            Invoices could not be loaded.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-[var(--radius)] border border-border bg-transparent px-4 text-sm font-medium text-foreground"
           data-nexen-id="nx-a5b56746-3">
            Try again
          </button>
        </section>
      ) : (
        <InvoiceList invoices={safeInvoices} isLoading={isLoading} />
      )}
    </div>
  );
}

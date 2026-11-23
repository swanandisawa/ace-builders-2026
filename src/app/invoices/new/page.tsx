
import Link from 'next/link';
import InvoiceForm from '@/components/InvoiceForm';

export default function NewInvoicePage() {
  return (
    <main data-nexen-component="nx_app_invoices_new_page" className="mx-auto w-full max-w-xl min-w-0 px-4 py-6 sm:py-8" data-nexen-id="nx-06b2cddf-0">
      <header className="mb-6 flex items-center gap-3" data-nexen-id="nx-06b2cddf-1">
        <Link
          href="/invoices"
          aria-label="Back to invoices"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius)] border border-border bg-card text-foreground hover:bg-muted"
         data-nexen-id="nx-06b2cddf-2">
          <span aria-hidden="true" data-nexen-id="nx-06b2cddf-3">←</span>
        </Link>
        <h1 className="min-w-0 text-2xl font-semibold tracking-tight text-foreground" data-nexen-id="nx-06b2cddf-4">New Invoice</h1>
      </header>
      <section className="min-w-0 rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm sm:p-6" data-nexen-id="nx-06b2cddf-5">
        <InvoiceForm />
      </section>
    </main>
  );
}

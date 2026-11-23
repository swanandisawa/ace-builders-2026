import Link from 'next/link';
import BillForm from '@/components/BillForm';

export default function NewBillPage() {
  return (
    <main data-nexen-component="nx_app_bills_new_page" className="mx-auto w-full max-w-xl min-w-0 px-4 py-6 sm:py-8" data-nexen-id="nx-e226df7a-0">
      <header className="mb-6 flex items-center gap-3" data-nexen-id="nx-e226df7a-1">
        <Link
          href="/bills"
          aria-label="Back to bills"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius)] border border-border bg-card text-foreground shadow-sm"
         data-nexen-id="nx-e226df7a-2">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="min-w-0 text-2xl font-semibold tracking-tight text-foreground" data-nexen-id="nx-e226df7a-3">
          New bill
        </h1>
      </header>

      <section className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm" data-nexen-id="nx-e226df7a-4">
        <p className="mb-6 text-sm text-muted-foreground" data-nexen-id="nx-e226df7a-5">
          Add an upcoming bill such as studio rent or a cosmetic restock. It will appear in your bills list and count toward your 30, 60 and 90 day cash forecast.
        </p>
        <BillForm />
      </section>
    </main>
  );
}

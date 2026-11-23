
import BillsList from '@/components/BillsList';

export default function BillsPage() {
  return (
    <main data-nexen-component="nx_app_bills_page" className="mx-auto w-full max-w-3xl min-w-0 space-y-6 px-4 py-8 sm:px-6" data-nexen-id="nx-34067a5e-0">
      <header className="min-w-0" data-nexen-id="nx-34067a5e-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground" data-nexen-id="nx-34067a5e-2">Bills</h1>
        <p className="mt-1 text-sm text-muted-foreground" data-nexen-id="nx-34067a5e-3">
          Rent and restock costs coming up, soonest first.
        </p>
      </header>
      <BillsList />
    </main>
  );
}

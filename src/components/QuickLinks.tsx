
import Link from 'next/link';

type QuickLinkItem = {
  label: string;
  href: string;
  variant: 'primary' | 'outline';
};

const QUICK_LINKS: QuickLinkItem[] = [
  { label: 'New invoice', href: '/invoices/new', variant: 'primary' },
  { label: 'View all invoices', href: '/invoices', variant: 'outline' },
  { label: 'Cash forecast', href: '/cash-forecast', variant: 'outline' },
  { label: 'Bills', href: '/bills', variant: 'outline' },
  { label: 'New bill', href: '/bills/new', variant: 'outline' },
];

const BASE_CLASS =
  'inline-flex min-h-10 w-full items-center justify-center rounded-[var(--radius)] px-4 text-sm font-medium transition-colors sm:w-auto';

const VARIANT_CLASS: Record<QuickLinkItem['variant'], string> = {
  primary: 'bg-primary text-primary-foreground hover:opacity-90',
  outline: 'border border-border bg-transparent text-foreground hover:bg-muted',
};

export default function QuickLinks() {
  const safeLinks = Array.isArray(QUICK_LINKS) ? QUICK_LINKS : [];

  return (
    <section data-nexen-component="nx_components_QuickLinks"
      aria-labelledby="quick-links-heading"
      className="rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm sm:p-6"
     data-nexen-id="nx-2e86f28f-0">
      <h2
        id="quick-links-heading"
        className="text-base font-semibold text-foreground"
       data-nexen-id="nx-2e86f28f-1">
        Quick links
      </h2>

      <nav aria-label="Quick links" className="mt-3 min-w-0" data-nexen-id="nx-2e86f28f-2">
        <ul className="flex flex-wrap gap-2" data-nexen-id="nx-2e86f28f-3">
          {safeLinks.map((link) => (
            <li key={link.href} className="min-w-0" data-nexen-id="nx-2e86f28f-4">
              <Link
                href={link.href}
                className={`${BASE_CLASS} ${VARIANT_CLASS[link.variant]}`}
               data-nexen-id="nx-2e86f28f-5">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}

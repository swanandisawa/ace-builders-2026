'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';

const NAV_ITEMS = [
  { label: 'Who Owes Me', href: '/' },
  { label: 'Invoices', href: '/invoices' },
  { label: 'Cash Forecast', href: '/cash-forecast' },
  { label: 'Bills', href: '/bills' },
];

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname() ?? '/';
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname === '/book') {
    return <>{children}</>;
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <div className="ui-shell min-w-0 max-w-full overflow-x-hidden">
      <aside className="ui-sidebar min-w-0" data-nexen-id="nx-2bffa68a-0">
        <div className="ui-brand flex min-w-0 items-center gap-2">
          <img src="/nexen-logo.svg" alt="" className="h-6 w-6 shrink-0"  data-nexen-id="nx-2bffa68a-1"/>
          <span className="truncate font-semibold" data-nexen-id="nx-2bffa68a-2">GlowLedger</span>
        </div>

        <button
          type="button"
          className="ui-menu-toggle mt-2 rounded-[var(--radius)] border border-border bg-card px-3 py-2 text-sm font-medium text-foreground sm:hidden"
          aria-expanded={menuOpen}
          aria-controls="ui-nav"
          onClick={() => setMenuOpen((open) => !open)}
         data-nexen-id="nx-2bffa68a-3">
          {menuOpen ? 'Close menu' : 'Menu'}
        </button>

        <nav
          id="ui-nav"
          className={`ui-nav min-w-0 flex-col gap-1 pt-2 ${
            menuOpen ? 'flex' : 'hidden'
          } sm:flex sm:flex-col`}
         data-nexen-id="nx-2bffa68a-4">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
                className={`block min-w-0 truncate rounded-[var(--radius)] px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-muted font-semibold text-[var(--ui-primary)]'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
               data-nexen-id="nx-2bffa68a-5">
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <header data-nexen-component="nx_components_AppShell" className="ui-topbar flex min-w-0 items-center justify-between gap-2 border-b border-border bg-card px-4 py-3" data-nexen-id="nx-2bffa68a-6">
        <div className="ui-user flex min-w-0 items-baseline gap-2">
          <strong className="truncate text-foreground" data-nexen-id="nx-2bffa68a-7">GlowLedger</strong>
          <span className="truncate text-xs text-muted-foreground" data-nexen-id="nx-2bffa68a-8">
            Solo Freelance Makeup Artist
          </span>
        </div>
      </header>

      <main className="ui-content min-w-0 max-w-full overflow-x-hidden p-4 sm:p-6" data-nexen-id="nx-2bffa68a-9">
        {children}
      </main>
    </div>
  );
}

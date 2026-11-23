
'use client';

import { useState } from 'react';

type PaymentReminderCardProps = {
  reminderText?: string;
  canRemind?: boolean;
  isLoading?: boolean;
  error?: string | null;
  copied?: boolean;
  onCopy?: () => void;
  phone?: string;
};

export default function PaymentReminderCard(props: PaymentReminderCardProps) {
  const {
    reminderText,
    canRemind = false,
    isLoading = false,
    error = null,
    copied: copiedProp = false,
    onCopy,
    phone,
  } = props;

  const [localCopied, setLocalCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  const text = typeof reminderText === 'string' ? reminderText : '';
  const isCopied = copiedProp || localCopied;
  const canCopy = canRemind && text.length > 0 && !isLoading;
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  const message = text.trim().length > 0 ? text : 'Hi! Just checking in about your bridal makeup booking.';
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  async function handleCopy() {
    if (!canCopy) return;
    setCopyError(null);

    if (onCopy) {
      onCopy();
      setLocalCopied(true);
      return;
    }

    try {
      await navigator.clipboard?.writeText(text);
      setLocalCopied(true);
    } catch {
      setCopyError('Could not copy. Select the text and copy it manually.');
    }
  }

  return (
    <section data-nexen-component="nx_components_PaymentReminderCard" className="min-w-0 space-y-4 rounded-[var(--radius)] border border-border bg-card p-6 text-card-foreground shadow-sm" data-nexen-id="nx-60bc6c09-0">
      <header className="space-y-1" data-nexen-id="nx-60bc6c09-1">
        <h2 className="text-base font-semibold" data-nexen-id="nx-60bc6c09-2">Payment reminder</h2>
        <p className="text-sm text-muted-foreground" data-nexen-id="nx-60bc6c09-3">
          A polite WhatsApp message about the balance. Copying it changes nothing on this invoice.
        </p>
      </header>

      {isLoading ? (
        <p className="text-sm text-muted-foreground" data-nexen-id="nx-60bc6c09-4">Loading reminder…</p>
      ) : error ? (
        <p role="alert" className="text-sm text-destructive" data-nexen-id="nx-60bc6c09-5">
          {error}
        </p>
      ) : !canRemind ? (
        <p className="text-sm text-muted-foreground" data-nexen-id="nx-60bc6c09-6">
          No balance is due, so there is no reminder to send.
        </p>
      ) : (
        <div className="whitespace-pre-wrap break-words rounded-[var(--radius)] bg-muted p-4 text-sm text-foreground">
          {text}
        </div>
      )}

      {copyError ? (
        <p role="alert" className="text-sm text-destructive" data-nexen-id="nx-60bc6c09-7">
          {copyError}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCopy}
          disabled={!canCopy}
          className="inline-flex h-10 w-full items-center justify-center rounded-[var(--radius)] bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
         data-nexen-id="nx-60bc6c09-8">
          {isCopied ? 'Copied' : 'Copy reminder'}
        </button>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center justify-center cursor-pointer relative z-10 rounded-[var(--radius)] border border-border px-4 text-sm font-medium text-foreground"
        >
          Send on WhatsApp
        </a>
      </div>
    </section>
  );
}

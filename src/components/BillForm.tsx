'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBill, ApiError } from '@/lib/api';

type FieldErrors = {
  name?: string;
  amount?: string;
  dueDate?: string;
};

const NAME_MAX = 60;
const AMOUNT_MAX = 1000000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const AMOUNT_RE = /^\d+(\.\d+)?$/;

const inputClass =
  'w-full min-w-0 rounded-[var(--radius)] border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring';
const labelClass = 'text-sm font-medium text-foreground';
const errorClass = 'text-sm text-destructive';

function isValidDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function validate(name: string, amount: string, dueDate: string): FieldErrors {
  const errors: FieldErrors = {};

  const trimmedName = name.trim();
  if (!trimmedName) {
    errors.name = 'Enter a name for this bill, such as Studio rent or Lash restock.';
  } else if (trimmedName.length > NAME_MAX) {
    errors.name = 'Keep the bill name to 60 characters or fewer.';
  }

  const trimmedAmount = amount.trim();
  if (!trimmedAmount) {
    errors.amount = 'Enter the amount this bill costs.';
  } else {
    const numeric = Number(trimmedAmount);
    if (!AMOUNT_RE.test(trimmedAmount) || numeric <= 0 || numeric > AMOUNT_MAX) {
      errors.amount = 'Enter an amount greater than 0 and up to 1,000,000.';
    } else if (trimmedAmount.includes('.') && trimmedAmount.split('.')[1].length > 2) {
      errors.amount = 'Use at most two decimal places for the amount.';
    }
  }

  if (!dueDate) {
    errors.dueDate = 'Choose the date this bill is due.';
  } else if (!isValidDate(dueDate)) {
    errors.dueDate = 'Enter a valid date for the due date.';
  }

  return errors;
}

export default function BillForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    const fieldErrors = validate(name, amount, dueDate);
    setErrors(fieldErrors);
    setFormError(null);
    if (Object.keys(fieldErrors).length > 0) return;

    setIsSaving(true);
    try {
      await createBill({
        name: name.trim(),
        amount: Number(amount.trim()),
        dueDate,
      });
      router.push('/bills');
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : "We couldn't save this bill. Your entries are still here, so try again."
      );
      setIsSaving(false);
    }
  }

  return (
    <form data-nexen-component="nx_components_BillForm"
      onSubmit={handleSubmit}
      noValidate
      className="w-full max-w-md space-y-5 rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm"
     data-nexen-id="nx-e63f4bbc-0">
      <div className="space-y-1.5">
        <label htmlFor="bill-name" className={labelClass} data-nexen-id="nx-e63f4bbc-1">
          Bill name
        </label>
        <input
          id="bill-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Studio rent, Cosmetic restock"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'bill-name-error' : undefined}
          className={inputClass}
          disabled={isSaving}
         data-nexen-id="nx-e63f4bbc-2"/>
        {errors.name && (
          <p id="bill-name-error" className={errorClass} data-nexen-id="nx-e63f4bbc-3">
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="bill-amount" className={labelClass} data-nexen-id="nx-e63f4bbc-4">
          Amount
        </label>
        <input
          id="bill-amount"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          aria-invalid={Boolean(errors.amount)}
          aria-describedby={errors.amount ? 'bill-amount-error' : undefined}
          className={inputClass}
          disabled={isSaving}
         data-nexen-id="nx-e63f4bbc-5"/>
        {errors.amount && (
          <p id="bill-amount-error" className={errorClass} data-nexen-id="nx-e63f4bbc-6">
            {errors.amount}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="bill-due-date" className={labelClass} data-nexen-id="nx-e63f4bbc-7">
          Due date
        </label>
        <input
          id="bill-due-date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          aria-invalid={Boolean(errors.dueDate)}
          aria-describedby={errors.dueDate ? 'bill-due-date-error' : undefined}
          className={inputClass}
          disabled={isSaving}
         data-nexen-id="nx-e63f4bbc-8"/>
        {errors.dueDate && (
          <p id="bill-due-date-error" className={errorClass} data-nexen-id="nx-e63f4bbc-9">
            {errors.dueDate}
          </p>
        )}
      </div>

      {formError && (
        <div
          role="alert"
          className="rounded-[var(--radius)] border border-destructive/30 bg-muted p-3 text-sm text-destructive"
        >
          {formError}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.push('/bills')}
          disabled={isSaving}
          className="inline-flex h-10 w-full items-center justify-center rounded-[var(--radius)] border border-border bg-transparent px-4 text-sm font-medium text-foreground disabled:opacity-60 sm:w-auto"
         data-nexen-id="nx-e63f4bbc-10">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          aria-busy={isSaving}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[var(--radius)] bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60 sm:w-auto"
         data-nexen-id="nx-e63f4bbc-11">
          {isSaving && (
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"
             data-nexen-id="nx-e63f4bbc-12"/>
          )}
          {isSaving ? 'Saving…' : 'Save bill'}
        </button>
      </div>
    </form>
  );
}


'use client';

import { useRouter } from 'next/navigation';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { createInvoice } from '@/lib/api';

type Values = {
  clientName: string;
  eventDate: string;
  totalFee: string;
  advancePaid: string;
};

type Errors = Partial<Record<keyof Values, string>>;

const EMPTY_VALUES: Values = {
  clientName: '',
  eventDate: '',
  totalFee: '',
  advancePaid: '',
};

const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const inputClass =
  'w-full min-w-0 rounded-[var(--radius)] border border-border bg-card px-3 py-2 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60';
const labelClass = 'block text-sm font-medium text-foreground mb-1';
const errorClass = 'mt-1 text-sm text-destructive';

function validate(values: Values): Errors {
  const errors: Errors = {};

  const name = values.clientName.trim();
  if (!name) {
    errors.clientName = "Enter the client's name.";
  } else if (name.length > 100) {
    errors.clientName = 'Client name must be 100 characters or fewer.';
  }

  if (!values.eventDate) {
    errors.eventDate = 'Pick the event date.';
  } else if (!DATE_PATTERN.test(values.eventDate) || Number.isNaN(Date.parse(values.eventDate))) {
    errors.eventDate = 'Enter a valid date for the event.';
  }

  const fee = values.totalFee.trim();
  let feeNumber = 0;
  if (!fee) {
    errors.totalFee = 'Enter the total fee.';
  } else if (!MONEY_PATTERN.test(fee)) {
    errors.totalFee = 'Enter the amount with no more than two decimal places.';
  } else {
    feeNumber = Number(fee);
    if (feeNumber <= 0) {
      errors.totalFee = 'Total fee must be more than zero.';
    }
  }

  const advance = values.advancePaid.trim() || '0';
  if (!MONEY_PATTERN.test(advance) || Number(advance) < 0 || Number(advance) > feeNumber) {
    errors.advancePaid = 'Advance paid must be between 0 and the total fee.';
  }

  return errors;
}

export default function InvoiceForm() {
  const router = useRouter();
  const [values, setValues] = useState<Values>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const setField =
    (key: keyof Values) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      setValues((prev) => ({ ...prev, [key]: next }));
    };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveError(null);

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      const invoice = await createInvoice({
        clientName: values.clientName.trim(),
        eventDate: values.eventDate,
        totalFee: Number(values.totalFee),
        advancePaid: Number(values.advancePaid.trim() || '0'),
      });
      router.push(`/invoices/${invoice.id}`);
    } catch {
      setSaveError('The invoice was not saved. Your entries are still here, so please try again.');
      setSaving(false);
    }
  }

  return (
    <form data-nexen-component="nx_components_InvoiceForm" onSubmit={handleSubmit} noValidate className="w-full max-w-xl space-y-5" data-nexen-id="nx-8fd556bd-0">
      <fieldset disabled={saving} className="space-y-5 min-w-0" data-nexen-id="nx-8fd556bd-1">
        <div>
          <label htmlFor="clientName" className={labelClass} data-nexen-id="nx-8fd556bd-2">
            Client name
          </label>
          <input
            id="clientName"
            name="clientName"
            type="text"
            autoComplete="off"
            maxLength={100}
            value={values.clientName}
            onChange={setField('clientName')}
            aria-invalid={Boolean(errors.clientName)}
            className={inputClass}
           data-nexen-id="nx-8fd556bd-3"/>
          {errors.clientName && <p className={errorClass} data-nexen-id="nx-8fd556bd-4">{errors.clientName}</p>}
        </div>

        <div>
          <label htmlFor="eventDate" className={labelClass} data-nexen-id="nx-8fd556bd-5">
            Event date
          </label>
          <input
            id="eventDate"
            name="eventDate"
            type="date"
            value={values.eventDate}
            onChange={setField('eventDate')}
            aria-invalid={Boolean(errors.eventDate)}
            className={inputClass}
           data-nexen-id="nx-8fd556bd-6"/>
          {errors.eventDate && <p className={errorClass} data-nexen-id="nx-8fd556bd-7">{errors.eventDate}</p>}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="totalFee" className={labelClass} data-nexen-id="nx-8fd556bd-8">
              Total fee
            </label>
            <input
              id="totalFee"
              name="totalFee"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={values.totalFee}
              onChange={setField('totalFee')}
              aria-invalid={Boolean(errors.totalFee)}
              className={inputClass}
             data-nexen-id="nx-8fd556bd-9"/>
            {errors.totalFee && <p className={errorClass} data-nexen-id="nx-8fd556bd-10">{errors.totalFee}</p>}
          </div>

          <div>
            <label htmlFor="advancePaid" className={labelClass} data-nexen-id="nx-8fd556bd-11">
              Advance paid
            </label>
            <input
              id="advancePaid"
              name="advancePaid"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={values.advancePaid}
              onChange={setField('advancePaid')}
              aria-invalid={Boolean(errors.advancePaid)}
              className={inputClass}
             data-nexen-id="nx-8fd556bd-12"/>
            {errors.advancePaid && <p className={errorClass} data-nexen-id="nx-8fd556bd-13">{errors.advancePaid}</p>}
          </div>
        </div>

        {saveError && (
          <p role="alert" className="rounded-[var(--radius)] bg-muted p-3 text-sm text-destructive" data-nexen-id="nx-8fd556bd-14">
            {saveError}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.push('/invoices')}
            disabled={saving}
            className="inline-flex h-10 w-full items-center justify-center rounded-[var(--radius)] border border-border bg-transparent px-4 text-sm font-medium text-foreground sm:w-auto"
           data-nexen-id="nx-8fd556bd-15">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            aria-busy={saving}
            className="inline-flex h-10 w-full items-center justify-center rounded-[var(--radius)] bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-70 sm:w-auto"
           data-nexen-id="nx-8fd556bd-16">
            {saving ? 'Saving invoice…' : 'Save invoice'}
          </button>
        </div>
      </fieldset>
    </form>
  );
}

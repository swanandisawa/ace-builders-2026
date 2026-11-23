'use client';

import { useState, type FormEvent } from 'react';

// Prices and the 30% advance are computed in the browser. The server currently trusts the posted totalFee and advancePaid; no server-side calculation was added.
const MAKEUP_PACKAGES = [
  { id: 'none', label: 'None', price: 0 },
  { id: 'party', label: 'Party / Engagement Makeup', price: 8000 },
  { id: 'hd-bridal', label: 'HD Bridal Makeup', price: 18000 },
  { id: 'airbrush-bridal', label: 'Airbrush Luxury Bridal', price: 25000 },
];

const HAIRSTYLES = [
  { id: 'none', label: 'None', price: 0 },
  { id: 'soft-curls', label: 'Soft Curls / Blowout', price: 1500 },
  { id: 'bun-floral', label: 'Bridal Bun with Floral Pinning', price: 3000 },
  { id: 'juda-ext', label: 'Traditional Juda + Extensions', price: 4500 },
];

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const GENERIC_ERROR = 'Something went wrong. Please try again.';

type Step = 'details' | 'payment' | 'done';
type PaymentMethod = 'upi' | 'card';

type Receipt = {
  invoiceId: string;
  clientName: string;
  eventDate: string;
  totalFee: number;
  advanceAmount: number;
};

const inputClass =
  'mt-1 block w-full rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary';

const labelClass = 'block text-sm font-medium text-foreground';

const primaryButtonClass =
  'inline-flex h-10 w-full items-center justify-center rounded-[var(--radius)] bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60';

const secondaryButtonClass =
  'inline-flex h-10 w-full items-center justify-center rounded-[var(--radius)] border border-border bg-background px-4 text-sm font-medium text-foreground';

export default function BookPage() {
  const [step, setStep] = useState<Step>('details');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [makeupId, setMakeupId] = useState('none');
  const [hairstyleId, setHairstyleId] = useState('none');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const makeupPrice = (MAKEUP_PACKAGES.find((p) => p.id === makeupId) ?? MAKEUP_PACKAGES[0]).price;
  const hairstylePrice = (HAIRSTYLES.find((h) => h.id === hairstyleId) ?? HAIRSTYLES[0]).price;
  const totalFee = makeupPrice + hairstylePrice;
  const advanceAmount = Math.round((totalFee * 0.3) / 100) * 100;
  const balanceAfterAdvance = totalFee - advanceAmount;

  function handleContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length === 0) {
      setError("Please enter the bride's full name.");
      return;
    }
    if (date === '') {
      setError('Please choose the wedding or event date.');
      return;
    }
    if (totalFee <= 0) {
      setError('Choose a package to continue.');
      return;
    }
    setError(null);
    setStep('payment');
  }

  function handleBack() {
    setError(null);
    setStep('details');
  }

  async function handlePay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: name.trim(),
          eventDate: date,
          totalFee,
          advancePaid: advanceAmount,
        }),
      });
      if (!response.ok) {
        let message = GENERIC_ERROR;
        try {
          const data = (await response.json()) as { error?: unknown };
          if (typeof data.error === 'string' && data.error.length > 0) {
            message = data.error;
          }
        } catch {
          // Keep the generic message when the body is not JSON.
        }
        setError(message);
        return;
      }
      const data = (await response.json()) as { invoice?: { id?: unknown } };
      const invoiceId = data.invoice?.id;
      if (invoiceId === undefined || invoiceId === null || String(invoiceId) === '') {
        throw new Error('Missing invoice id');
      }
      setReceipt({
        invoiceId: String(invoiceId),
        clientName: name.trim(),
        eventDate: date,
        totalFee,
        advanceAmount,
      });
      setStep('done');
    } catch {
      setError(GENERIC_ERROR);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8 sm:py-12">
      <section className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm">
        {step === 'done' && receipt ? (
          <div>
            <h1 className="text-xl font-semibold text-foreground">Booking confirmed</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Booking reference: {receipt.invoiceId}
            </p>

            <dl className="mt-6 space-y-2 rounded-[var(--radius)] border border-border bg-background p-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Bride</dt>
                <dd className="text-right text-foreground">{receipt.clientName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Event date</dt>
                <dd className="text-right text-foreground">{receipt.eventDate}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Package total</dt>
                <dd className="text-right text-foreground">{money.format(receipt.totalFee)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Advance paid</dt>
                <dd className="text-right text-foreground">{money.format(receipt.advanceAmount)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Balance remaining</dt>
                <dd className="text-right text-foreground">
                  {money.format(receipt.totalFee - receipt.advanceAmount)}
                </dd>
              </div>
            </dl>

            <p className="mt-6 text-sm text-muted-foreground">
              Your makeup artist will confirm your details on WhatsApp.
            </p>
          </div>
        ) : step === 'payment' ? (
          <>
            <h1 className="text-xl font-semibold text-foreground">Book your bridal makeup</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pay the booking advance to confirm your date.
            </p>

            <form onSubmit={handlePay} noValidate className="mt-6 space-y-4">
              <fieldset className="space-y-2">
                <legend className={labelClass}>Payment method</legend>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="radio"
                    name="payment-method"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                  />
                  UPI (GPay / PhonePe / Paytm)
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="radio"
                    name="payment-method"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                  Card
                </label>
              </fieldset>

              {paymentMethod === 'upi' ? (
                <div className="flex flex-col items-center gap-2 rounded-[var(--radius)] border border-border bg-background p-4">
                  <div className="flex h-40 w-40 items-center justify-center rounded-[var(--radius)] border-2 border-dashed border-border text-sm text-muted-foreground">
                    QR
                  </div>
                  <p className="text-sm text-foreground">glowledger@upi</p>
                </div>
              ) : (
                <p className="rounded-[var(--radius)] border border-border bg-background p-4 text-sm text-muted-foreground">
                  Card payment is simulated in this preview.
                </p>
              )}

              <p className="text-sm font-medium text-foreground">
                Advance to pay: {money.format(advanceAmount)}
              </p>

              {error ? (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}

              <button type="submit" disabled={submitting} className={primaryButtonClass}>
                {submitting
                  ? 'Confirming…'
                  : `Pay ${money.format(advanceAmount)} Advance & Confirm Booking`}
              </button>

              <button type="button" onClick={handleBack} disabled={submitting} className={secondaryButtonClass}>
                Back
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-foreground">Book your bridal makeup</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Fill in your details below and your makeup artist will confirm your booking.
            </p>

            <form onSubmit={handleContinue} noValidate className="mt-6 space-y-4">
              <div>
                <label htmlFor="book-name" className={labelClass}>
                  Bride&apos;s full name
                </label>
                <input
                  id="book-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="book-phone" className={labelClass}>
                  Phone / WhatsApp number
                </label>
                <input
                  id="book-phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="book-date" className={labelClass}>
                  Wedding / event date
                </label>
                <input
                  id="book-date"
                  type="date"
                  required
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="book-notes" className={labelClass}>
                  Package / service notes
                </label>
                <textarea
                  id="book-notes"
                  rows={3}
                  placeholder="e.g. Bridal HD makeup + hair"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="book-makeup" className={labelClass}>
                  Makeup package
                </label>
                <select
                  id="book-makeup"
                  value={makeupId}
                  onChange={(event) => setMakeupId(event.target.value)}
                  className={inputClass}
                >
                  {MAKEUP_PACKAGES.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {`${pkg.label} (₹${pkg.price})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="book-hairstyle" className={labelClass}>
                  Hairstyle
                </label>
                <select
                  id="book-hairstyle"
                  value={hairstyleId}
                  onChange={(event) => setHairstyleId(event.target.value)}
                  className={inputClass}
                >
                  {HAIRSTYLES.map((style) => (
                    <option key={style.id} value={style.id}>
                      {`${style.label} (₹${style.price})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 rounded-[var(--radius)] border border-border bg-background p-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Total package fee</span>
                  <span className="text-foreground">{money.format(totalFee)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">
                    Booking advance (30%, rounded to nearest ₹100)
                  </span>
                  <span className="text-foreground">{money.format(advanceAmount)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Balance after advance</span>
                  <span className="text-foreground">{money.format(balanceAfterAdvance)}</span>
                </div>
                {totalFee === 0 ? (
                  <p className="pt-1 text-muted-foreground">Choose a package to continue.</p>
                ) : null}
              </div>

              {error ? (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}

              <button type="submit" disabled={totalFee === 0} className={primaryButtonClass}>
                Continue to advance payment
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

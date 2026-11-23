
'use client';

import { useState, type FormEvent } from 'react';
import type { Payment } from '@/types/payment';

type ReceiveInput = { amount: number; receivedOn: string };

type Props = {
  payments?: Payment[];
  pendingBalance: number;
  isReceiving?: boolean;
  onReceive: (paymentId: string, input: ReceiveInput) => Promise<void> | void;
  onRecord?: (input: ReceiveInput) => Promise<void> | void;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
const dateFmt = new Intl.DateTimeFormat('en-IN', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return dateFmt.format(d);
}

export default function PaymentsReceived({
  payments,
  pendingBalance,
  isReceiving = false,
  onReceive,
  onRecord,
}: Props) {
  const safePayments = Array.isArray(payments) ? payments : [];
  const [activeId, setActiveId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [receivedOn, setReceivedOn] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recordAmount, setRecordAmount] = useState('');
  const [recordDate, setRecordDate] = useState<string>(todayIso());
  const [recordError, setRecordError] = useState<string | null>(null);

  const open = (payment: Payment) => {
    setActiveId(payment.id);
    setAmount(String(Number(payment.amount)));
    setReceivedOn(new Date().toISOString().slice(0, 10));
    setError(null);
  };

  const cancel = () => {
    setActiveId(null);
    setError(null);
  };

  const submit = async (paymentId: string) => {
    if (amount.trim() === '') {
      setError('Enter the amount received.');
      return;
    }
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0 || value > Number(pendingBalance)) {
      setError('Enter an amount greater than 0 and no more than the balance due.');
      return;
    }
    if (!receivedOn) {
      setError('Choose the date the payment was received.');
      return;
    }
    setError(null);
    try {
      await onReceive(paymentId, { amount: value, receivedOn });
      setActiveId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not mark this payment as received.');
    }
  };

  const submitRecord = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!onRecord) return;
    if (recordAmount.trim() === '') {
      setRecordError('Enter the amount received.');
      return;
    }
    const value = Number(recordAmount);
    if (!Number.isFinite(value) || value <= 0 || value > Number(pendingBalance)) {
      setRecordError('Enter an amount greater than 0 and no more than the balance due.');
      return;
    }
    if (!recordDate) {
      setRecordError('Choose the date the payment was received.');
      return;
    }
    setRecordError(null);
    try {
      await onRecord({ amount: value, receivedOn: recordDate });
      setRecordAmount('');
      setRecordDate(todayIso());
    } catch (err) {
      setRecordError(err instanceof Error ? err.message : 'Could not record this payment.');
    }
  };

  return (
    <section className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm" data-nexen-id="nx-9c4106fa-0">
      <h2 className="text-lg font-semibold text-foreground" data-nexen-id="nx-9c4106fa-1">Payments</h2>

      {safePayments.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground" data-nexen-id="nx-9c4106fa-2">
          No payments on this invoice yet. Payments you record will appear here.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border" data-nexen-id="nx-9c4106fa-3">
          {safePayments.map((payment) => {
            const isReceived = payment.status === 'received';
            const isActive = activeId === payment.id;
            return (
              <li data-nexen-component="nx_components_PaymentsReceived" key={payment.id} className="min-w-0 py-3" data-nexen-id="nx-9c4106fa-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold tabular-nums text-foreground" data-nexen-id="nx-9c4106fa-5">
                      {money.format(Number(payment.amount))}
                    </p>
                    {isReceived && (
                      <p className="text-xs text-muted-foreground" data-nexen-id="nx-9c4106fa-6">
                        Received {formatDate(payment.receivedOn)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs ${
                        isReceived
                          ? 'bg-secondary text-secondary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                     data-nexen-id="nx-9c4106fa-7">
                      {isReceived ? 'Received' : 'Expected'}
                    </span>
                    {!isReceived && !isActive && (
                      <button
                        type="button"
                        onClick={() => open(payment)}
                        className="h-9 rounded-[var(--radius)] bg-primary px-4 text-sm font-medium text-primary-foreground"
                       data-nexen-id="nx-9c4106fa-8">
                        Mark received
                      </button>
                    )}
                  </div>
                </div>

                {isActive && (
                  <div className="mt-3 space-y-3 rounded-[var(--radius)] border border-border bg-background p-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="min-w-0 text-sm text-muted-foreground" data-nexen-id="nx-9c4106fa-9">
                        Amount received
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          min="0"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="mt-1 h-10 w-full rounded-[var(--radius)] border border-input bg-card px-3 text-sm text-foreground"
                         data-nexen-id="nx-9c4106fa-10"/>
                      </label>
                      <label className="min-w-0 text-sm text-muted-foreground" data-nexen-id="nx-9c4106fa-11">
                        Date received
                        <input
                          type="date"
                          value={receivedOn}
                          onChange={(e) => setReceivedOn(e.target.value)}
                          className="mt-1 h-10 w-full rounded-[var(--radius)] border border-input bg-card px-3 text-sm text-foreground"
                         data-nexen-id="nx-9c4106fa-12"/>
                      </label>
                    </div>

                    {error && (
                      <p role="alert" className="text-sm text-destructive" data-nexen-id="nx-9c4106fa-13">
                        {error}
                      </p>
                    )}

                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={cancel}
                        disabled={isReceiving}
                        className="h-10 rounded-[var(--radius)] border border-border px-4 text-sm font-medium text-foreground disabled:opacity-60"
                       data-nexen-id="nx-9c4106fa-14">
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => submit(payment.id)}
                        disabled={isReceiving}
                        className="h-10 rounded-[var(--radius)] bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
                       data-nexen-id="nx-9c4106fa-15">
                        {isReceiving ? 'Saving…' : 'Confirm payment'}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {onRecord && (
        <form onSubmit={submitRecord} noValidate className="mt-6 space-y-3 border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-foreground">Record payment</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="min-w-0 text-sm text-muted-foreground">
              Amount (₹)
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={recordAmount}
                onChange={(e) => setRecordAmount(e.target.value)}
                className="mt-1 h-10 w-full rounded-[var(--radius)] border border-input bg-card px-3 text-sm text-foreground"
              />
            </label>
            <label className="min-w-0 text-sm text-muted-foreground">
              Date received
              <input
                type="date"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                className="mt-1 h-10 w-full rounded-[var(--radius)] border border-input bg-card px-3 text-sm text-foreground"
              />
            </label>
          </div>

          {recordError && (
            <p role="alert" className="text-sm text-destructive">
              {recordError}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isReceiving || !onRecord}
              className="h-10 rounded-[var(--radius)] bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {isReceiving ? 'Saving…' : 'Record payment'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

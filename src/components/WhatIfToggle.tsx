
'use client';

import { useId, useState } from 'react';

interface WhatIfToggleProps {
  enabled?: boolean;
  onToggle?: (next: boolean) => void;
  impactText?: string | null;
  canSimulate?: boolean;
}

export default function WhatIfToggle(props: WhatIfToggleProps) {
  const enabled = props.enabled ?? false;
  const canSimulate = props.canSimulate ?? true;
  const impact = props.impactText ?? '';
  const labelId = useId();
  const noteId = useId();
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);

  const handleClick = () => {
    const next = !enabled;
    if (next && !canSimulate) {
      setBlockedMessage('No unpaid invoices to shift. Add a balance before simulating a late payment.');
      return;
    }
    setBlockedMessage(null);
    props.onToggle?.(next);
  };

  return (
    <div data-nexen-component="nx_components_WhatIfToggle" className="flex min-w-0 flex-col gap-3 rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <p id={labelId} className="text-sm font-medium text-foreground" data-nexen-id="nx-295685d3-0">
          What if my biggest bride pays 2 weeks late?
        </p>
        <p id={noteId} className="mt-1 text-xs text-muted-foreground" data-nexen-id="nx-295685d3-1">
          Tests whether you still cover bills if your largest bridal payout is delayed 15 days.
        </p>
        {impact ? <p className="mt-2 text-sm text-foreground" data-nexen-id="nx-295685d3-2">{impact}</p> : null}
        {blockedMessage ? (
          <p role="alert" className="mt-2 text-sm text-destructive" data-nexen-id="nx-295685d3-3">
            {blockedMessage}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-labelledby={labelId}
        aria-describedby={noteId}
        onClick={handleClick}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
          enabled ? 'bg-primary' : 'bg-muted'
        }`}
       data-nexen-id="nx-295685d3-4">
        <span
          aria-hidden="true"
          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-primary-foreground transition-transform ${
            enabled ? 'translate-x-4' : 'translate-x-0'
          }`}
         data-nexen-id="nx-295685d3-5"/>
      </button>
    </div>
  );
}
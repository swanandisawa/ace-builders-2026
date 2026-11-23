export type OnboardingStepId =
  | 'welcome'
  | 'review-sample-data'
  | 'create-invoice'
  | 'record-advance'
  | 'send-reminder'
  | 'review-who-owes-me'
  | 'add-bill'
  | 'check-forecast'
  | 'try-what-if';

export type OnboardingStep = {
  id: OnboardingStepId;
  order: number;
  title: string;
  description: string;
  tip: string;
  optional: boolean;
};

export type OnboardingProgress = {
  completedStepIds: OnboardingStepId[];
  dismissedAt: string | null;
};

export type OnboardingSummary = {
  totalSteps: number;
  completedSteps: number;
  remainingSteps: number;
  percentComplete: number;
  nextStep: OnboardingStep | null;
  isComplete: boolean;
};

export const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  {
    id: 'welcome',
    order: 1,
    title: 'Welcome to GlowLedger',
    description:
      'Your client balances, bills, and upcoming cash live in one place, built for the makeup chair.',
    tip: 'Sample clients are already loaded so you can explore right away.',
    optional: false,
  },
  {
    id: 'review-sample-data',
    order: 2,
    title: 'Look over the sample clients',
    description:
      'Open the Who Owes Me view to see overdue balances, exact amounts, and days late for the sample clients.',
    tip: 'Sample data is only for practice. Delete any invoice you do not need.',
    optional: false,
  },
  {
    id: 'create-invoice',
    order: 3,
    title: 'Create your first invoice',
    description:
      'Enter the client name, event date, total fee, and advance paid. It takes three taps.',
    tip: 'The event date and advance paid are pre-filled for you.',
    optional: false,
  },
  {
    id: 'record-advance',
    order: 4,
    title: 'Confirm the advance is recorded',
    description:
      'An advance greater than zero is saved as a received payment dated today.',
    tip: 'Mark later payments as received from the invoice detail screen.',
    optional: false,
  },
  {
    id: 'send-reminder',
    order: 5,
    title: 'Send a polite WhatsApp reminder',
    description:
      'Generate a ready-to-copy reminder with the exact outstanding balance, then copy and send it.',
    tip: 'Copying a reminder does not change any record.',
    optional: true,
  },
  {
    id: 'review-who-owes-me',
    order: 6,
    title: 'Check who owes you today',
    description:
      'Review overdue clients sorted by days overdue and follow the action alerts.',
    tip: 'Alerts tie overdue balances to upcoming bills such as rent.',
    optional: false,
  },
  {
    id: 'add-bill',
    order: 7,
    title: 'Add an upcoming bill',
    description:
      'Add rent or a cosmetic restock with its amount and due date so it appears in your forecast.',
    tip: 'Mark a bill as paid once it is settled to remove it from upcoming costs.',
    optional: true,
  },
  {
    id: 'check-forecast',
    order: 8,
    title: 'Read your 30, 60, and 90 day forecast',
    description:
      'Compare expected client inflows against upcoming bills to see your net cash.',
    tip: 'Switch horizons to plan ahead for the next month or quarter.',
    optional: false,
  },
  {
    id: 'try-what-if',
    order: 9,
    title: 'Try a what-if scenario',
    description:
      'Simulate a key bridal client paying 15 days late and see how it changes your cash.',
    tip: 'What-if results are a preview only and do not change your invoices.',
    optional: true,
  },
];

export function getOnboardingSteps(): OnboardingStep[] {
  return [...ONBOARDING_STEPS].sort((a, b) => a.order - b.order);
}

export function createEmptyOnboardingProgress(): OnboardingProgress {
  return { completedStepIds: [], dismissedAt: null };
}

export function markOnboardingStepComplete(
  progress: OnboardingProgress,
  stepId: OnboardingStepId,
): OnboardingProgress {
  const current = Array.isArray(progress?.completedStepIds)
    ? progress.completedStepIds
    : [];
  if (current.includes(stepId)) {
    return progress;
  }
  return {
    ...progress,
    completedStepIds: [...current, stepId],
  };
}

export function markOnboardingStepIncomplete(
  progress: OnboardingProgress,
  stepId: OnboardingStepId,
): OnboardingProgress {
  const current = Array.isArray(progress?.completedStepIds)
    ? progress.completedStepIds
    : [];
  return {
    ...progress,
    completedStepIds: current.filter((id) => id !== stepId),
  };
}

export function dismissOnboarding(
  progress: OnboardingProgress,
  dismissedAt: string,
): OnboardingProgress {
  return { ...progress, dismissedAt };
}

export function getNextOnboardingStep(
  progress: OnboardingProgress,
): OnboardingStep | null {
  const completed = new Set<OnboardingStepId>(
    Array.isArray(progress?.completedStepIds) ? progress.completedStepIds : [],
  );
  const steps = getOnboardingSteps();
  const nextRequired = steps.find((s) => !s.optional && !completed.has(s.id));
  if (nextRequired) {
    return nextRequired;
  }
  return steps.find((s) => !completed.has(s.id)) ?? null;
}

export function isOnboardingStepComplete(
  progress: OnboardingProgress,
  stepId: OnboardingStepId,
): boolean {
  return Array.isArray(progress?.completedStepIds)
    ? progress.completedStepIds.includes(stepId)
    : false;
}

export function areRequiredOnboardingStepsComplete(
  progress: OnboardingProgress,
): boolean {
  return getOnboardingSteps()
    .filter((s) => !s.optional)
    .every((s) => isOnboardingStepComplete(progress, s.id));
}

export function summarizeOnboarding(
  progress: OnboardingProgress,
): OnboardingSummary {
  const steps = getOnboardingSteps();
  const totalSteps = steps.length;
  const completedSteps = steps.filter((s) =>
    isOnboardingStepComplete(progress, s.id),
  ).length;
  const remainingSteps = totalSteps - completedSteps;
  const percentComplete =
    totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);

  return {
    totalSteps,
    completedSteps,
    remainingSteps,
    percentComplete,
    nextStep: getNextOnboardingStep(progress),
    isComplete: remainingSteps === 0,
  };
}

export function shouldShowOnboarding(progress: OnboardingProgress): boolean {
  if (progress?.dismissedAt) {
    return false;
  }
  return !summarizeOnboarding(progress).isComplete;
}

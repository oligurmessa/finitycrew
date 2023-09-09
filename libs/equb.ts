// Rules of an Equb that don't need the database.

export const FREQUENCIES = ['weekly', 'biweekly', 'monthly'] as const;
export type Frequency = typeof FREQUENCIES[number];

export const isFrequency = (value: unknown): value is Frequency => {
  return FREQUENCIES.includes(value as Frequency);
};

// The pot one member takes home in a round: everyone's contribution.
export const potSize = (contributionAmount: number, memberCount: number) => {
  return contributionAmount * memberCount;
};

export const nextDueDate = (from: Date, frequency: string) => {
  const due = new Date(from);

  if (frequency === 'weekly') {
    due.setDate(due.getDate() + 7);
  } else if (frequency === 'biweekly') {
    due.setDate(due.getDate() + 14);
  } else {
    // Jan 31 + 1 month should be the last day of February, not March 3.
    const day = due.getDate();
    due.setDate(1);
    due.setMonth(due.getMonth() + 1);
    const lastDay = new Date(due.getFullYear(), due.getMonth() + 1, 0).getDate();
    due.setDate(Math.min(day, lastDay));
  }

  return due;
};

// Traditionally the payout order is drawn by lot. Fisher-Yates shuffle.
export const drawPayoutOrder = <T>(members: T[]): T[] => {
  const order = [...members];

  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  return order;
};

export const formatMoney = (amount: number) => {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

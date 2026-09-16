import { PeriodChoice } from '@interfaces/financial-assistance';
import { swedishMonthName } from '@utils/swedish-month';

/** The month (1–12) a month period choice refers to, relative to today; null for "Annat bistånd". */
const monthForPeriodChoice = (choice: PeriodChoice, now: Date): number | null => {
  const currentMonth = now.getMonth() + 1;
  if (choice === 'CURRENT_MONTH') return currentMonth;
  if (choice === 'NEXT_MONTH') return currentMonth === 12 ? 1 : currentMonth + 1;
  return null;
};

/**
 * Label for a "Vad avser ansökan?" choice: the month choices carry the month's name in lower case,
 * e.g. "Denna månad (september)". Shared by the form, the PDF summary and the form snapshot.
 */
export const formatPeriodChoiceLabel = (choice: PeriodChoice, baseLabel: string, now: Date = new Date()): string => {
  const month = monthForPeriodChoice(choice, now);
  return month ? `${baseLabel} (${swedishMonthName(month).toLowerCase()})` : baseLabel;
};

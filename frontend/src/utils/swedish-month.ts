const SWEDISH_MONTHS = [
  'Januari',
  'Februari',
  'Mars',
  'April',
  'Maj',
  'Juni',
  'Juli',
  'Augusti',
  'September',
  'Oktober',
  'November',
  'December',
];

/** Returns the Swedish month name (capitalised) for a 1–12 month number, or '' when out of range. */
export const swedishMonthName = (month: number | null | undefined): string =>
  month && month >= 1 && month <= 12 ? SWEDISH_MONTHS[month - 1] : '';

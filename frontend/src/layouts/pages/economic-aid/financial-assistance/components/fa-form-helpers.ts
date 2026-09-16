/** RHF register options that store a number input as number | null (empty → null). */
export const numberFieldOptions = {
  setValueAs: (value: string | number | null): number | null =>
    value === '' || value === null ? null : Number(value),
};

/**
 * Smalare bredd för ett input-/select-fält i kryssrutekorten. Sätts på själva fältet (inte på
 * FormControl) så att etiketten ovanför går full bredd och bryter först vid kortets marginal.
 */
export const compactFieldClass = 'max-w-[12rem] w-full';

/**
 * `max` for date inputs. Without it the browser accepts a five- or six-digit year; capping the
 * date at 9999-12-31 limits the year segment to four digits.
 */
export const DATE_INPUT_MAX = '9999-12-31';

/** Klassen för en valbar ruta (checkbox-kort) — markerad ruta får blå ram + ljus bakgrund. */
export const selectableBoxClass = (checked: boolean): string =>
  [
    'rounded-12 border-2 p-16 transition',
    checked ? 'border-vattjom-surface-primary bg-vattjom-background-100' : 'border-divider bg-background-content',
  ].join(' ');

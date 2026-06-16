/** RHF register options that store a number input as number | null (empty → null). */
export const numberFieldOptions = {
  setValueAs: (value: string | number | null): number | null =>
    value === '' || value === null ? null : Number(value),
};

/** Klassen för en valbar ruta (checkbox-kort) — markerad ruta får blå ram + ljus bakgrund. */
export const selectableBoxClass = (checked: boolean): string =>
  [
    'rounded-12 border-2 p-16 transition',
    checked ? 'border-vattjom-surface-primary bg-vattjom-background-100' : 'border-divider bg-background-content',
  ].join(' ');

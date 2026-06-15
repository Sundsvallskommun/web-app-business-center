/** RHF register options that store a number input as number | null (empty → null). */
export const numberFieldOptions = {
  setValueAs: (value: string | number | null): number | null =>
    value === '' || value === null ? null : Number(value),
};

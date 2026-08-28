import { TFunction } from 'i18next';
import { FieldPath, FieldValues } from 'react-hook-form';
import { getApiErrorResponse } from './api-service';

interface FormErrorTarget<TFieldValues extends FieldValues> {
  getValues: () => TFieldValues;
  setError: (field: FieldPath<TFieldValues>, error: { message: string; type: string }) => void;
}

interface ApiFormErrorOptions<TFieldValues extends FieldValues> {
  fallbackMessage: string;
  inlineFields: readonly FieldPath<TFieldValues>[];
  onFormError: (message: string) => void;
  translate: TFunction;
}

export const applyApiErrorToForm = <TFieldValues extends FieldValues>(
  error: unknown,
  form: FormErrorTarget<TFieldValues>,
  { fallbackMessage, inlineFields, onFormError, translate }: ApiFormErrorOptions<TFieldValues>
): void => {
  const response = getApiErrorResponse(error);
  const message = response?.code?.startsWith('UPLOAD_')
    ? translate(`common:uploadErrors.${response.code}`, {
        ...response.params,
        defaultValue: response.message ?? fallbackMessage,
      })
    : (response?.message ?? fallbackMessage);
  const field = response?.field;

  if (field && Object.hasOwn(form.getValues(), field) && inlineFields.includes(field as FieldPath<TFieldValues>)) {
    form.setError(field as FieldPath<TFieldValues>, { message, type: 'server' });
    return;
  }

  onFormError(message);
};

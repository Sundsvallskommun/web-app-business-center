import { describe, expect, it, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TFunction } from 'i18next';
import { apiService, getApiErrorResponse, useApi } from './api-service';
import { applyApiErrorToForm } from './form-api-error';

jest.mock('@sk-web-gui/react', () => ({ __DEV__: false }));

const createApiError = (data: unknown) =>
  Object.assign(new Error('Request failed'), {
    isAxiosError: true,
    response: { data, status: 400 },
  });

describe('API error handling', () => {
  it('parses the typed error response returned by the backend', () => {
    const error = createApiError({
      code: 'UPLOAD_TOO_MANY_FILES',
      field: 'files',
      params: { max: 10 },
    });

    expect(getApiErrorResponse(error)).toEqual({
      code: 'UPLOAD_TOO_MANY_FILES',
      field: 'files',
      params: { max: 10 },
    });
  });

  it('translates a coded API error and places it on the matching form field', () => {
    const setError = jest.fn();
    const onFormError = jest.fn();
    const translate = jest.fn(() => 'localized upload error') as unknown as TFunction;
    const error = createApiError({ code: 'UPLOAD_TOO_MANY_FILES', field: 'files', params: { max: 10 } });

    applyApiErrorToForm<{ files: never[] }>(
      error,
      { getValues: () => ({ files: [] }), setError },
      { fallbackMessage: 'fallback error', inlineFields: ['files'], onFormError, translate }
    );

    expect(setError).toHaveBeenCalledWith('files', {
      message: 'localized upload error',
      type: 'server',
    });
    expect(translate).toHaveBeenCalledWith('common:uploadErrors.UPLOAD_TOO_MANY_FILES', {
      defaultValue: 'fallback error',
      max: 10,
    });
    expect(onFormError).not.toHaveBeenCalled();
  });

  it('places errors at form level when the field has no inline error surface', () => {
    const setError = jest.fn();
    const onFormError = jest.fn();
    const translate = jest.fn(() => 'localized field error') as unknown as TFunction;
    const error = createApiError({
      code: 'UPLOAD_FIELD_TOO_LARGE',
      field: 'reason',
      params: { max: 1 },
    });

    applyApiErrorToForm<{ files: never[]; reason: string }>(
      error,
      { getValues: () => ({ files: [], reason: '' }), setError },
      { fallbackMessage: 'fallback error', inlineFields: ['files'], onFormError, translate }
    );

    expect(setError).not.toHaveBeenCalled();
    expect(onFormError).toHaveBeenCalledWith('localized field error');
  });

  it("keeps failed mutations in TanStack Query's error path", async () => {
    const error = createApiError({ message: 'Uppladdningen kunde inte behandlas.' });
    jest.spyOn(apiService, 'post').mockRejectedValueOnce(error);
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const { result } = renderHook(() => useApi({ method: 'post', url: '/upload' }, queryClient));

    await act(async () => {
      await expect(result.current.mutateAsync({})).rejects.toBe(error);
    });
  });
});

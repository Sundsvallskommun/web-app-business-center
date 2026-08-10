import { describe, expect, it, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
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
      message: 'Du kan bifoga högst 10 filer.',
    });

    expect(getApiErrorResponse(error)).toEqual({
      code: 'UPLOAD_TOO_MANY_FILES',
      field: 'files',
      message: 'Du kan bifoga högst 10 filer.',
    });
  });

  it('places a field-specific API error on the matching form field', () => {
    const setError = jest.fn();
    const onFormError = jest.fn();
    const error = createApiError({ field: 'files', message: 'Du kan bifoga högst 10 filer.' });

    applyApiErrorToForm<{ files: never[] }>(
      error,
      { getValues: () => ({ files: [] }), setError },
      { fallbackMessage: 'Ett oväntat fel inträffade.', inlineFields: ['files'], onFormError }
    );

    expect(setError).toHaveBeenCalledWith('files', {
      message: 'Du kan bifoga högst 10 filer.',
      type: 'server',
    });
    expect(onFormError).not.toHaveBeenCalled();
  });

  it('places errors at form level when the field has no inline error surface', () => {
    const setError = jest.fn();
    const onFormError = jest.fn();
    const error = createApiError({
      field: 'reason',
      message: 'Ett textfält får innehålla högst 1 MB.',
    });

    applyApiErrorToForm<{ files: never[]; reason: string }>(
      error,
      { getValues: () => ({ files: [], reason: '' }), setError },
      { fallbackMessage: 'Ett oväntat fel inträffade.', inlineFields: ['files'], onFormError }
    );

    expect(setError).not.toHaveBeenCalled();
    expect(onFormError).toHaveBeenCalledWith('Ett textfält får innehålla högst 1 MB.');
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

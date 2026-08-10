import { NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';
import { HttpException } from '@exceptions/HttpException';
import errorMiddleware from './error.middleware';

const createMocks = () => {
  const req = { method: 'POST', path: '/api/cases/1/messages' } as Request;
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  const next = vi.fn() as unknown as NextFunction;
  return { req, res, next };
};

describe('errorMiddleware', () => {
  it.each([
    ['LIMIT_FILE_COUNT', undefined, 'files', 'UPLOAD_TOO_MANY_FILES', 'Du kan bifoga högst 10 filer.'],
    ['LIMIT_FILE_SIZE', 'files', 'files', 'UPLOAD_FILE_TOO_LARGE', 'En bifogad fil får vara högst 50 MB.'],
    ['LIMIT_FIELD_COUNT', undefined, undefined, 'UPLOAD_TOO_MANY_FIELDS', 'Formuläret innehåller fler än 50 textfält.'],
    ['LIMIT_FIELD_KEY', undefined, undefined, 'UPLOAD_FIELD_NAME_TOO_LONG', 'Ett formulärfält har ett för långt namn.'],
    ['LIMIT_FIELD_VALUE', 'message', 'message', 'UPLOAD_FIELD_TOO_LARGE', 'Ett textfält får innehålla högst 1 MB.'],
    [
      'LIMIT_PART_COUNT',
      undefined,
      undefined,
      'UPLOAD_TOO_MANY_PARTS',
      'Formuläret får innehålla högst 60 textfält och filer sammanlagt.',
    ],
    ['LIMIT_UNEXPECTED_FILE', 'files', 'files', 'UPLOAD_UNEXPECTED_FILE', 'Den valda filen kan inte bifogas i det här fältet.'],
  ] as const)('maps %s to a typed 400 response', (multerCode, errorField, responseField, code, message) => {
    const { req, res, next } = createMocks();
    const error = new MulterError(multerCode, errorField);

    errorMiddleware(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ code, ...(responseField ? { field: responseField } : {}), message });
  });

  it('keeps the status and message of an HttpException', () => {
    const { req, res, next } = createMocks();

    errorMiddleware(new HttpException(404, 'Case not found'), req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Case not found' });
  });

  it('falls back to 500 for unknown errors', () => {
    const { req, res, next } = createMocks();

    errorMiddleware(new Error('boom') as HttpException, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'boom' });
  });
});

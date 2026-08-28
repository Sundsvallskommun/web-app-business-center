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
    {
      multerCode: 'LIMIT_FILE_COUNT',
      errorField: undefined,
      response: { code: 'UPLOAD_TOO_MANY_FILES', field: 'files', params: { max: 10 } },
    },
    {
      multerCode: 'LIMIT_FILE_SIZE',
      errorField: 'files',
      response: { code: 'UPLOAD_FILE_TOO_LARGE', field: 'files', params: { max: 50 } },
    },
    {
      multerCode: 'LIMIT_FIELD_COUNT',
      errorField: undefined,
      response: { code: 'UPLOAD_TOO_MANY_FIELDS', params: { max: 50 } },
    },
    {
      multerCode: 'LIMIT_FIELD_KEY',
      errorField: undefined,
      response: { code: 'UPLOAD_FIELD_NAME_TOO_LONG', params: { max: 255 } },
    },
    {
      multerCode: 'LIMIT_FIELD_VALUE',
      errorField: 'message',
      response: { code: 'UPLOAD_FIELD_TOO_LARGE', field: 'message', params: { max: 1 } },
    },
    {
      multerCode: 'LIMIT_PART_COUNT',
      errorField: undefined,
      response: { code: 'UPLOAD_TOO_MANY_PARTS', params: { max: 60 } },
    },
    {
      multerCode: 'LIMIT_UNEXPECTED_FILE',
      errorField: 'files',
      response: { code: 'UPLOAD_UNEXPECTED_FILE', field: 'files' },
    },
  ] as const)('maps $multerCode to a typed 400 response', ({ multerCode, errorField, response }) => {
    const { req, res, next } = createMocks();
    const error = new MulterError(multerCode, errorField);

    errorMiddleware(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(response);
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

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
  it('maps multer upload limit violations to 400', () => {
    const { req, res, next } = createMocks();

    errorMiddleware(new MulterError('LIMIT_FILE_COUNT', 'files'), req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Too many files' });
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

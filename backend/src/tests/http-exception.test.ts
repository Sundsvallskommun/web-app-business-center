import { HttpException } from '@/exceptions/HttpException';
import { HttpError } from 'routing-controllers';

describe('HttpException', () => {
  // routing-controllers' HttpError calls Object.setPrototypeOf(this, HttpError.prototype) in
  // its constructor. Without the prototype being restored, every `error instanceof
  // HttpException` check in the codebase silently evaluates to false and 404 handling falls
  // through to a generic 500.
  it('is an instance of itself', () => {
    expect(new HttpException(404, 'Not found')).toBeInstanceOf(HttpException);
  });

  it('is still an instance of HttpError, so routing-controllers keeps handling it', () => {
    expect(new HttpException(404, 'Not found')).toBeInstanceOf(HttpError);
  });

  it('is still an Error', () => {
    expect(new HttpException(500, 'Boom')).toBeInstanceOf(Error);
  });

  it('keeps status and message readable', () => {
    const error = new HttpException(404, 'Asset not found');

    expect(error.status).toBe(404);
    expect(error.message).toBe('Asset not found');
  });

  it('survives being caught and narrowed by instanceof', () => {
    const narrow = (error: unknown): string => (error instanceof HttpException && error.status === 404 ? 'handled' : 'fell through');

    expect(narrow(new HttpException(404, 'Not found'))).toBe('handled');
    expect(narrow(new HttpException(500, 'Boom'))).toBe('fell through');
    expect(narrow(new Error('plain'))).toBe('fell through');
  });

  it('keeps instanceof working for a further subclass', () => {
    class NotFoundException extends HttpException {
      constructor(message: string) {
        super(404, message);
      }
    }
    const error = new NotFoundException('Asset not found');

    expect(error).toBeInstanceOf(NotFoundException);
    expect(error).toBeInstanceOf(HttpException);
    expect(error).toBeInstanceOf(HttpError);
  });
});

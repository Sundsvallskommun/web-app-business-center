import { ValidationError } from 'class-validator';
import { HttpError } from 'routing-controllers';

export class HttpException extends HttpError {
  public status: number;
  public message: string;
  public errors!: ValidationError[];

  constructor(status: number, message: string) {
    super(status, message);
    // routing-controllers' HttpError pins the prototype to HttpError.prototype inside its own
    // constructor, which leaves `instanceof HttpException` false for every instance and quietly
    // defeats catch blocks that test for it (a 404 would fall through to a generic 500).
    // Restoring the prototype makes those checks work; new.target keeps it correct for any
    // further subclass.
    Object.setPrototypeOf(this, new.target.prototype);
    this.status = status;
    this.message = message;
  }
}

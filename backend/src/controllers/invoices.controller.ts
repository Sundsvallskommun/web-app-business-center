import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { fetchInvoices } from '@/services/invoices.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Controller, Get, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { getRepresentedPartyId } from '../utils/getRepresentedPartyId';

@Controller()
export class InvoicesController {
  /**
   * Resolve the party id of the currently represented entity from the session.
   * Every invoice request is scoped to this party so a user can only ever reach
   * invoices belonging to whoever they are currently representing.
   */
  private resolveRepresentedPartyId(req: RequestWithUser): string {
    const partyId = getRepresentedPartyId(req.session?.representing, req.user);

    if (!partyId) {
      throw new HttpException(400, 'Bad Request');
    }

    return partyId;
  }

  @Get('/invoices')
  @OpenAPI({ summary: 'Return a list of invoices for current represented organization' })
  @UseBefore(authMiddleware)
  async getInvoices(@Req() req: RequestWithUser) {
    const partyId = this.resolveRepresentedPartyId(req);

    const data = await fetchInvoices(partyId, req.user);
    return { data, message: 'success' };
  }
}

import { PdfInvoice } from '@/data-contracts/invoices/data-contracts';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { fetchInvoicePdf, fetchInvoices } from '@/services/invoices.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Controller, Get, Param, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { ApiResponse } from '../interfaces/service';
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

  @Get('/invoicepdf/:id')
  @OpenAPI({ summary: 'Return the base64 encoded pdf by invoice id' })
  @UseBefore(authMiddleware)
  async getInvoicePdf(@Req() req: RequestWithUser, @Param('id') id: string): Promise<ApiResponse<PdfInvoice>> {
    if (!id) {
      throw new HttpException(400, 'Bad Request');
    }

    const partyId = this.resolveRepresentedPartyId(req);

    // Verify the invoice belongs to the represented party before returning its PDF.
    const data = await fetchInvoicePdf(partyId, id, req.user);

    return { data, message: 'success' };
  }
}

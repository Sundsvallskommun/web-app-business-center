import { MUNICIPALITY_ID, MUNICIPALITY_ORG_NR } from '@/config';
import { getApiBase } from '@/config/api-config';
import { InvoicesResponse, PdfInvoice } from '@/data-contracts/invoices/data-contracts';
import { HttpException } from '@/exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import ApiService from './api.service';

const defaultApi = new ApiService();
const apiBase = getApiBase('invoices');

export const emptyInvoice: InvoicesResponse = {
  invoices: [],
  _meta: undefined,
};

export const getInvoiceDateFrom = (): string => {
  const date = new Date();
  date.setMonth(date.getMonth() - 12);
  return date.toISOString().split('T')[0];
};

export const fetchInvoices = async (partyId: string, user: User, api: Pick<ApiService, 'get'> = defaultApi): Promise<InvoicesResponse> => {
  const params = {
    partyId,
    organizationNumber: MUNICIPALITY_ORG_NR,
    invoiceDateFrom: getInvoiceDateFrom(),
  };

  try {
    const url = `${apiBase}/${MUNICIPALITY_ID}/PUBLIC_ADMINISTRATION`;
    const res = await api.get<InvoicesResponse>({ url, params }, user);

    if (res.data && Array.isArray(res.data?.invoices) && res.data.invoices.length < 1) {
      return emptyInvoice;
    }

    return res.data;
  } catch {
    // Any failure (including 404) falls back to an empty invoice list
    return emptyInvoice;
  }
};

/**
 * Fetch the PDF for a single invoice, but only after verifying that the invoice
 * belongs to the represented party.
 *
 * The invoice id is supplied by the client and is otherwise trusted blindly by the
 * downstream API. Without this ownership check a logged-in user could reuse their own
 * session and swap the id in the request to download another party's invoice (IDOR).
 * We therefore load the party's own invoices first and only proceed when the requested
 * id is actually among them.
 */
export const fetchInvoicePdf = async (
  partyId: string,
  invoiceId: string,
  user: User,
  api: Pick<ApiService, 'get'> = defaultApi,
): Promise<PdfInvoice> => {
  const { invoices } = await fetchInvoices(partyId, user, api);

  const ownsInvoice = invoices?.some(invoice => invoice.invoiceNumber === invoiceId) ?? false;
  if (!ownsInvoice) {
    throw new HttpException(404, 'Invoice not found');
  }

  const url = `${apiBase}/${MUNICIPALITY_ID}/PUBLIC_ADMINISTRATION/${MUNICIPALITY_ORG_NR}/${invoiceId}/pdf`;
  const res = await api.get<PdfInvoice>({ url }, user);

  return res.data;
};

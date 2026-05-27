import { MUNICIPALITY_ID, MUNICIPALITY_ORG_NR } from '@/config';
import { getApiBase } from '@/config/api-config';
import { InvoicesResponse } from '@/data-contracts/invoices/data-contracts';
import { User } from '@interfaces/users.interface';
import ApiService from './api.service';

const apiService = new ApiService();
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

export const fetchInvoices = async (partyId: string, user: User): Promise<InvoicesResponse> => {
  const params = {
    partyId,
    organizationNumber: MUNICIPALITY_ORG_NR,
    invoiceDateFrom: getInvoiceDateFrom(),
  };

  try {
    const url = `${apiBase}/${MUNICIPALITY_ID}/PUBLIC_ADMINISTRATION`;
    const res = await apiService.get<InvoicesResponse>({ url, params }, user);

    if (res.data && Array.isArray(res.data?.invoices) && res.data.invoices.length < 1) {
      return emptyInvoice;
    }

    return res.data;
  } catch {
    // Any failure (including 404) falls back to an empty invoice list
    return emptyInvoice;
  }
};

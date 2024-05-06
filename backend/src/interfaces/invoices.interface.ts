import { ApiResponseMeta } from './service';

export interface InvoicePdf {
  externalCaseId: string;
  base64: string;
}

export interface InvoicesResponse {
  invoices: InvoicesResponseData[];
  _meta: ApiResponseMeta;
}

export interface InvoicesResponseData {
  dueDate: string;
  totalAmount: number;
  amountVatIncluded: number;
  amountVatExcluded: number;
  vatEligibleAmount: number;
  rounding: number;
  vat: number;
  reversedVat: boolean;
  pdfAvailable: boolean;
  currency: string;
  invoiceDate: string;
  fromDate: string;
  toDate: string;
  invoiceNumber: string;
  invoiceStatus: string;
  ocrNumber: string;
  organizationNumber: string;
  invoiceName: string;
  invoiceType: string;
  invoiceDescription: string;
  invoiceAddress: InvoiceAddress;
  facilityId: string;
  invoiceOrigin: string;
}

export interface InvoiceAddress {
  street: string;
  postcode: string;
  city: string;
  careOf: string;
}

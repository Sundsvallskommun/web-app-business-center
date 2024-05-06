import { Data } from '@services/api-service';
import { ApiResponseMeta } from './service';

export interface IInvoice {
  invoiceNumber: string;
  dueDate: string;
  invoiceDescription: string;
  totalAmount: number;
  pdfAvailable: boolean;
  invoiceStatus: { code: InvoiceStatus; color: string; label: string };
  ocrNumber: string;
}

export interface InvoicesData extends Data {
  invoices: IInvoice[];
  labels: { label: string; screenReaderOnly: boolean; sortable: boolean }[];
}

export interface InvoicesResponse {
  invoices: InvoicesResponseData[];
  _meta: ApiResponseMeta;
}

export type InvoiceStatus =
  | 'PAID'
  | 'SENT'
  | 'PARTIALLY_PAID'
  | 'DEBT_COLLECTION'
  | 'PAID_TOO_MUCH'
  | 'REMINDER'
  | 'VOID'
  | 'CREDITED'
  | 'WRITTEN_OFF'
  | 'UNKNOWN';

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
  invoiceStatus: InvoiceStatus;
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

export interface InvoicePdf {
  fileName: string;
  file: string;
}

export interface InvoicePdfData extends Data {
  pdf: InvoicePdf;
}

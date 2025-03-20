import { RepresentingMode } from '@interfaces/app';
import { InvoiceStatus } from '@interfaces/invoice';
import { statusMapInvoices } from '@services/invoice-service';
import { representingModeDefault } from 'cypress/support/e2e';

const baseInvoice = {
  dueDate: '2024-08-30',
  totalAmount: 814,
  amountVatIncluded: 813.5,
  amountVatExcluded: 651.2,
  vatEligibleAmount: 651.2,
  rounding: 0.5,
  vat: 162.8,
  reversedVat: false,
  pdfAvailable: false,
  currency: 'SEK',
  invoiceDate: '2024-08-30',
  fromDate: '2024-08-30',
  toDate: '2024-08-30',
  invoiceNumber: '999',
  invoiceStatus: 'PAID',
  ocrNumber: '96758235',
  organizationNumber: '5565027223',
  invoiceName: 'faktura-999.pdf',
  invoiceType: 'INVOICE',
  invoiceDescription: 'Fjärrvärme',
  invoiceAddress: {
    street: 'Storgatan 1',
    postcode: '11122',
    city: 'Sundsvall',
    careOf: 'Kalle',
  },
  facilityId: 'string',
  invoiceOrigin: 'COMMERCIAL',
};

export const getGeneratedInvoices = (representingMode: RepresentingMode = representingModeDefault) =>
  Object.keys(statusMapInvoices).map((status) => ({
    ...baseInvoice,
    invoiceStatus: status as InvoiceStatus,
    invoiceDescription: `${status}-${RepresentingMode[representingMode]}`,
    invoiceName: `faktura-999-${status.toLowerCase()}.pdf`,
  }));

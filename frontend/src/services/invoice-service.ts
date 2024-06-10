import {
  IInvoice,
  InvoicePdf,
  InvoicePdfData,
  InvoiceStatus,
  InvoicesData,
  InvoicesResponse,
  InvoicesResponseData,
} from '@interfaces/invoice';
import { apiService, ApiResponse } from './api-service';

export const emptyInvoicesList: InvoicesData = {
  invoices: [],
  labels: [],
};

export const invoicesLabels = [
  { label: 'Förfallodatum', screenReaderOnly: false, sortable: true },
  { label: 'Faktura', screenReaderOnly: false, sortable: true },
  { label: 'Status', screenReaderOnly: false, sortable: true },
  { label: 'Summa', screenReaderOnly: false, sortable: true },
  { label: 'OCR-nummer', screenReaderOnly: false, sortable: false },
  { label: 'Visa faktura', screenReaderOnly: true, sortable: false },
];

const statusMap = {
  PAID: { label: 'Betald', color: 'info' },
  PAID_TOO_MUCH: { label: 'För mycket betalt', color: 'info' },

  CREDITED: { label: 'Krediterad', color: 'neutral' },
  WRITTEN_OFF: { label: 'Avskriven', color: 'neutral' },
  UNKNOWN: { label: 'Okänd', color: 'neutral' },
  VOID: { label: 'Makulerad', color: 'neutral' },

  UNPAID: { label: 'Ej betald', color: 'warning' },
  SENT: { label: 'Ej betald', color: 'warning' },
  PARTIALLY_PAID: { label: 'Delvis betald', color: 'warning' },

  REMINDER: { label: 'Påminnelse', color: 'error' },
  DEBT_COLLECTION: { label: 'Gått till inkasso', color: 'error' },
};

export const mapStatus = (s: InvoiceStatus) => {
  return Object.keys(statusMap).includes(s as unknown as string)
    ? { code: s, color: statusMap[s].color, label: statusMap[s].label }
    : {
        code: 'UNKNOWN' as InvoiceStatus,
        color: statusMap['UNKNOWN'].color,
        label: statusMap['UNKNOWN'].label,
      };
};

export const handleInvoiceResponse: (data: InvoicesResponse) => IInvoice[] = (data) =>
  data.invoices.map((n: InvoicesResponseData) => ({
    invoiceNumber: n.invoiceNumber,
    dueDate: n.dueDate,
    invoiceDescription: n.invoiceDescription,
    totalAmount: n.totalAmount,
    pdfAvailable: n.pdfAvailable,
    invoiceStatus: mapStatus(n.invoiceStatus),
    ocrNumber: n.ocrNumber,
  }));

// export const getInvoices: () => Promise<InvoicesData> = () =>
//   apiService
//     .get<ApiResponse<InvoicesResponse>>('invoices')
//     .then((res) => ({ invoices: handleInvoiceResponse(res.data), labels: invoicesLabels } as InvoicesData))
//     .catch((e) => ({ ...emptyInvoicesList, error: e.response?.status ?? 'UNKNOWN ERROR' } as InvoicesData));

export const invoicesHandler = (data: InvoicesResponse): InvoicesData => ({
  invoices: handleInvoiceResponse(data),
  labels: invoicesLabels,
});

export const getNotPaidInvoices: (invoicesData: InvoicesData) => InvoicesData = (invoicesData) => ({
  ...invoicesData,
  labels: invoicesLabels,
  invoices: invoicesData?.invoices.filter((x) =>
    ['UNPAID', 'SENT', 'PARTIALLY_PAID', 'REMINDER', 'DEBT_COLLECTION'].includes(x.invoiceStatus.code)
  ),
});

export const getPaidInvoices: (invoicesData: InvoicesData) => InvoicesData = (invoicesData) => ({
  ...invoicesData,
  labels: invoicesLabels,
  invoices: invoicesData?.invoices.filter((x) => ['PAID', 'PAID_TOO_MUCH'].includes(x.invoiceStatus.code)),
});

export const getOtherInvoices: (invoicesData: InvoicesData) => InvoicesData = (invoicesData) => ({
  ...invoicesData,
  labels: invoicesLabels,
  invoices: invoicesData?.invoices.filter((x) =>
    ['CREDITED', 'WRITTEN_OFF', 'UNKNOWN', 'VOID'].includes(x.invoiceStatus.code)
  ),
});

export const getInvoicePdf: (invoiceNumber: string) => Promise<InvoicePdfData> = (invoiceNumber) =>
  apiService
    .get<ApiResponse<InvoicePdf>>(`invoicepdf/${invoiceNumber}`)
    .then((res) => ({ pdf: res.data.data }))
    .catch(
      (e) => ({ pdf: { fileName: '', file: '' }, error: e.response?.status ?? 'UNKNOWN ERROR' }) as InvoicePdfData
    );

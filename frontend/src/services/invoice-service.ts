import { IInvoice, InvoiceStatus, InvoicesData, InvoicesResponse, InvoicesResponseData } from '@interfaces/invoice';

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

export const statusMapInvoices = {
  PAID: { label: 'Betald', color: 'success' },
  PAID_TOO_MUCH: { label: 'För mycket betalt', color: 'success' },

  CREDITED: { label: 'Krediterad', color: 'neutral' },
  WRITTEN_OFF: { label: 'Avskriven', color: 'neutral' },
  UNKNOWN: { label: 'Okänd', color: 'neutral' },
  VOID: { label: 'Makulerad', color: 'neutral' },

  UNPAID: { label: 'Obetald', color: 'warning' },
  SENT: { label: 'Obetald', color: 'warning' },
  PARTIALLY_PAID: { label: 'Delvis betald', color: 'warning' },

  REMINDER: { label: 'Påminnelse', color: 'error' },
  DEBT_COLLECTION: { label: 'Förfallen', color: 'error' },
};

const mapStatus = (s: InvoiceStatus) => {
  return Object.keys(statusMapInvoices).includes(s as unknown as string)
    ? { code: s, color: statusMapInvoices[s].color, label: statusMapInvoices[s].label }
    : {
        code: 'UNKNOWN' as InvoiceStatus,
        color: statusMapInvoices['UNKNOWN'].color,
        label: statusMapInvoices['UNKNOWN'].label,
      };
};

const handleInvoiceResponse: (data: InvoicesResponse) => IInvoice[] = (data) =>
  data.invoices.map((n: InvoicesResponseData) => ({
    invoiceNumber: n.invoiceNumber,
    dueDate: n.dueDate,
    invoiceDescription: n.invoiceDescription,
    totalAmount: n.totalAmount,
    pdfAvailable: n.pdfAvailable,
    invoiceStatus: mapStatus(n.invoiceStatus),
    ocrNumber: n.ocrNumber,
  }));

export const invoicesHandler = (data: InvoicesResponse): InvoicesData => ({
  invoices: handleInvoiceResponse(data),
  labels: invoicesLabels,
});

export const sortInvoices = (a: IInvoice, b: IInvoice, order: number = -1) => {
  // if invoiceStatus color is same sort by dueDate
  if (a.invoiceStatus.color === b.invoiceStatus.color) {
    return order === -1
      ? new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      : new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  }
  // sort by invoiceStatus color
  const colorOrder = ['success', 'neutral', 'warning', 'error'];
  return order === -1
    ? colorOrder.indexOf(b.invoiceStatus.color) - colorOrder.indexOf(a.invoiceStatus.color)
    : colorOrder.indexOf(a.invoiceStatus.color) - colorOrder.indexOf(b.invoiceStatus.color);
};

export const handledInvoices = ['CREDITED', 'WRITTEN_OFF', 'UNKNOWN', 'VOID', 'PAID', 'PAID_TOO_MUCH'];
export const getHandledInvoices: (invoicesData: InvoicesData) => InvoicesData = (invoicesData) => ({
  ...invoicesData,
  labels: invoicesLabels,
  invoices: invoicesData?.invoices.filter((x) => handledInvoices.includes(x.invoiceStatus.code)).sort(sortInvoices),
});

export const notHandledInvoices = ['UNPAID', 'SENT', 'PARTIALLY_PAID', 'REMINDER', 'DEBT_COLLECTION'];
export const getNotHandledInvoices: (invoicesData: InvoicesData) => InvoicesData = (invoicesData) => ({
  ...invoicesData,
  labels: invoicesLabels,
  invoices: invoicesData?.invoices.filter((x) => notHandledInvoices.includes(x.invoiceStatus.code)).sort(sortInvoices),
});

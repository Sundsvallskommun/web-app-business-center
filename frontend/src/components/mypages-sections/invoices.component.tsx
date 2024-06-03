import { InvoicesTable } from '@components/invoices/invoices-table.component';
import { InvoicesData, InvoicesResponse } from '@interfaces/invoice';
import {
  emptyInvoicesList,
  getNotPaidInvoices,
  getOtherInvoices,
  getPaidInvoices,
  invoicesHandler,
} from '@services/invoice-service';
import { useEffect, useMemo, useState } from 'react';
import { useApi } from '../../services/api-service';

export default function Invoices() {
  const { data: invoices = emptyInvoicesList, isLoading: invoicesIsLoading } = useApi<
    InvoicesResponse,
    Error,
    InvoicesData
  >({
    url: '/invoices',
    method: 'get',
    dataHandler: invoicesHandler,
  });

  const [paidInvoices, setPaidInvoices] = useState<InvoicesData>();
  const [notPaidInvoices, setNotPaidInvoices] = useState<InvoicesData>();
  const [otherInvoices, setOtherInvoices] = useState<InvoicesData>();

  const invoiceMemo = useMemo(() => invoices, [invoices]);

  useEffect(() => {
    if (invoiceMemo) {
      setPaidInvoices(getPaidInvoices(invoiceMemo));
      setNotPaidInvoices(getNotPaidInvoices(invoiceMemo));
      setOtherInvoices(getOtherInvoices(invoiceMemo));
    }
  }, [invoiceMemo]);

  return (
    <div>
      <h1>Fakturor</h1>
      <InvoicesTable
        data={notPaidInvoices}
        heading={'Ej betalda fakturor'}
        helpText={''}
        isLoadingData={invoicesIsLoading}
      />
      <InvoicesTable data={paidInvoices} heading={'Betalda fakturor'} helpText={''} isLoadingData={invoicesIsLoading} />
      <InvoicesTable data={otherInvoices} heading={'Övriga fakturor'} helpText={''} isLoadingData={invoicesIsLoading} />
    </div>
  );
}

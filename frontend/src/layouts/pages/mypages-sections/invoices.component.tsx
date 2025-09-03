'use client';

import { InvoicesData, InvoicesResponse } from '@interfaces/invoice';
import { useApi } from '@services/api-service';
import {
  emptyInvoicesList,
  getHandledInvoices,
  getNotHandledInvoices,
  invoicesHandler,
} from '@services/invoice-service';
import { useEffect, useMemo, useState } from 'react';
import { InvoicesTable } from './invoices/invoices-table.component';

export default function Invoices() {
  const {
    data: invoices = emptyInvoicesList,
    isLoading: invoicesIsLoading,
    isFetching: invoicesIsFetching,
  } = useApi<InvoicesResponse, Error, InvoicesData>({
    url: '/invoices',
    method: 'get',
    dataHandler: invoicesHandler,
  });

  const [notHandledInvoices, setNotHandledInvoices] = useState<InvoicesData>();
  const [handledInvoices, setHandledInvoices] = useState<InvoicesData>();

  const invoiceMemo = useMemo(() => invoices, [invoices]);

  useEffect(() => {
    if (invoiceMemo) {
      setNotHandledInvoices(getNotHandledInvoices(invoiceMemo));
      setHandledInvoices(getHandledInvoices(invoiceMemo));
    }
  }, [invoiceMemo]);

  if (!invoicesIsLoading && invoices.invoices.length < 1) {
    return (
      <div>
        <h1>Dina fakturor</h1>
        <p>Du har inga fakturor än, men så fort det finns något att betala kan du se det här.</p>
      </div>
    );
  } else if (!invoicesIsLoading) {
    return (
      <div className="flex flex-col gap-[6.4rem]">
        <div>
          <div className="text-content">
            <h1>Dina fakturor</h1>
          </div>
        </div>
        <InvoicesTable
          data={notHandledInvoices}
          heading={<h2 className="text-h3-sm desktop:text-h3-lg">Ohanterade</h2>}
          isFetchingData={invoicesIsFetching}
        />
        <InvoicesTable
          data={handledInvoices}
          heading={<h2 className="text-h3-sm desktop:text-h3-lg">Hanterade</h2>}
          isFetchingData={invoicesIsFetching}
        />
      </div>
    );
  } else return <></>;
}

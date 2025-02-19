import { InvoicesTable } from './invoices/invoices-table.component';
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
import { Divider } from '@sk-web-gui/react';
import dayjs from 'dayjs';

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

  const [amountToPay, setAmountToPay] = useState(0);
  const [amountOverdue, setAmountOverdue] = useState(0);

  const [paidInvoices, setPaidInvoices] = useState<InvoicesData>();
  const [notPaidInvoices, setNotPaidInvoices] = useState<InvoicesData>();
  const [otherInvoices, setOtherInvoices] = useState<InvoicesData>();

  const invoiceMemo = useMemo(() => invoices, [invoices]);

  useEffect(() => {
    if (invoiceMemo) {
      const notPaidInvoices = getNotPaidInvoices(invoiceMemo);
      const { amountToPay, amountOverdue } = notPaidInvoices.invoices.reduce(
        (amount, invoice) => {
          amount.amountToPay += invoice.totalAmount;
          if (dayjs(invoice.dueDate).isAfter(dayjs())) {
            amount.amountOverdue = +invoice.totalAmount;
          }
          return amount;
        },
        { amountToPay: 0, amountOverdue: 0 }
      );
      setNotPaidInvoices(notPaidInvoices);
      setAmountToPay(amountToPay);
      setAmountOverdue(amountOverdue);

      setPaidInvoices(getPaidInvoices(invoiceMemo));
      setOtherInvoices(getOtherInvoices(invoiceMemo));
    }
  }, [invoiceMemo]);

  if (!invoicesIsLoading && invoices.invoices.length < 1) {
    return (
      <div>
        <h1>Fakturor</h1>
        <p>Du har inga fakturor än, men så fort det finns något att betala kan du se det här.</p>
      </div>
    );
  } else if (!invoicesIsLoading) {
    return (
      <div className="flex flex-col gap-[6.4rem]">
        <div>
          <div className="text-content">
            <h1>Fakturor</h1>
          </div>
          <div className="mt-32">
            <div className="flex flex-col gap-4">
              <span>Att betala</span>
              <strong className="text-lead">{`${amountToPay} kr`}</strong>
            </div>
            <Divider className="my-md" />
            <div className="flex flex-col gap-4">
              <span>Varav förfallet belopp</span>
              <strong className="text-lead">{`${amountOverdue} kr`}</strong>
            </div>
          </div>
        </div>
        <InvoicesTable
          data={notPaidInvoices}
          heading={<h2 className="text-h3">Obetalda</h2>}
          isFetchingData={invoicesIsFetching}
        />
        <InvoicesTable
          data={paidInvoices}
          heading={<h2 className="text-h3">Betalda</h2>}
          isFetchingData={invoicesIsFetching}
        />
        <InvoicesTable
          data={otherInvoices}
          heading={<h2 className="text-h3">Övriga</h2>}
          isFetchingData={invoicesIsFetching}
        />
      </div>
    );
  } else return <></>;
}

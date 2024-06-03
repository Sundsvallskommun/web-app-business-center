import { ClosedCases } from '@components/closed-cases/closed-cases.component';
import { InvoicesTable } from '@components/invoices/invoices-table.component';
import { OngoingCases } from '@components/ongoing-cases/ongoing-cases.component';
import { InvoicesData, InvoicesResponse } from '@interfaces/invoice';
import { useApi } from '../../services/api-service';
import { emptyInvoicesList, invoicesHandler } from '../../services/invoice-service';
import { useEffect, useMemo, useState } from 'react';

export const MyOverviewSection: React.FC = () => {
  const { data: invoices = emptyInvoicesList, isLoading: invoicesIsLoading } = useApi<
    InvoicesResponse,
    Error,
    InvoicesData
  >({
    url: '/invoices',
    method: 'get',
    dataHandler: invoicesHandler,
  });

  const [flagInvoices, setFlagInvoices] = useState(false);
  const invoicesMemo = useMemo(() => invoices, [invoices]);
  useEffect(() => {
    if (invoicesMemo) {
      setFlagInvoices(
        invoicesMemo?.invoices?.filter((x) => ['REMINDER', 'DEBT_COLLECTION'].includes(x.invoiceStatus.code)).length > 0
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoicesMemo]);

  return (
    <>
      <div className="container px-0 m-auto">
        {flagInvoices && (
          <InvoicesTable data={invoices} heading={'Fakturor'} helpText={''} isLoadingData={invoicesIsLoading} />
        )}
        <OngoingCases />
        <ClosedCases />
        {!flagInvoices && (
          <InvoicesTable data={invoices} heading={'Fakturor'} helpText={''} isLoadingData={invoicesIsLoading} />
        )}
        {/* <Feedback /> */}
      </div>
    </>
  );
};

export default MyOverviewSection;

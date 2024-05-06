import Wrapper from '@components/wrapper/wrapper';
import { useEffect, useMemo, useState } from 'react';
import Layout from '@components/layout/layout.component';
import { useAppContext } from '@contexts/app.context';
import TabMenu from '@components/tabs/tab-menu.component';
import { InvoicesTable } from '@components/invoices/invoices-table.component';
import { getNotPaidInvoices, getOtherInvoices, getPaidInvoices } from '@services/invoice-service';
import { InvoicesData } from '@interfaces/invoice';

export const Fakturor: React.FC = () => {
  const { invoices } = useAppContext();
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
    <Wrapper>
      <Layout title={`Företagscenter Mina Sidor - Företagsuppgifter`}>
        <main className="flex-grow bg-gray-lighter pb-20 lg:pt-20 lg:px-lg">
          <div className="container m-auto">
            <TabMenu />
          </div>
          <div className={`block mt-10 lg:mt-20`}>
            <div className="container m-auto px-0">
              <div className="max-w-[720px] flex flex-col justify-around">
                <header className="mx-md mb-md lg:mx-0 lg:mb-0">
                  <div className="flex justify-between">
                    <h1 className="text-lg lg:text-xl">Mina fakturor</h1>
                  </div>
                </header>
                <div className="flex-grow w-full flex flex-col">
                  <div className="flex-shrink">
                    <div className="mx-md mb-md lg:mx-0">
                      <p>
                        Översikten visar dina fakturor hos Sundsvalls kommun för de senaste 12 månaderna. Har du frågor
                        så hittar du våra kontaktuppgifter genom att klicka upp den aktuella fakturan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <InvoicesTable data={notPaidInvoices} heading={'Ej betalda fakturor'} helpText={''} />
              <InvoicesTable data={paidInvoices} heading={'Betalda fakturor'} helpText={''} />
              <InvoicesTable data={otherInvoices} heading={'Övriga fakturor'} helpText={''} />
            </div>
          </div>
        </main>
      </Layout>
    </Wrapper>
  );
};

export default Fakturor;

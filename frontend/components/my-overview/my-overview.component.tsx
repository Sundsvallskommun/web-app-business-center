import { ClosedCases } from '@components/closed-cases/closed-cases.component';
import { Feedback } from '@components/feedback/feedback.component';
import { InvoicesTable } from '@components/invoices/invoices-table.component';
import { OngoingCases } from '@components/ongoing-cases/ongoing-cases.component';
import { CasesData } from '@interfaces/case';
import { InvoicesData } from '@interfaces/invoice';
import { OrganisationInfo } from '@interfaces/organisation-info';
import { User } from '@interfaces/user';

export const MyOverviewSection: React.FC<{
  orgInfo: OrganisationInfo;
  user: User;
  ongoing: CasesData;
  closed: CasesData;
  invoices: InvoicesData;
  flagInvoices: boolean;
}> = ({ ongoing, closed, invoices, flagInvoices }) => {
  return (
    <>
      <div className="container px-0 m-auto">
        {flagInvoices && <InvoicesTable data={invoices} heading={'Fakturor'} helpText={''} />}
        <OngoingCases ongoing={ongoing} />
        <ClosedCases closed={closed} />
        {!flagInvoices && <InvoicesTable data={invoices} heading={'Fakturor'} helpText={''} />}
        <Feedback />
      </div>
    </>
  );
};

export default MyOverviewSection;

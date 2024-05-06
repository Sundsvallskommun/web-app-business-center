import { User } from '@interfaces/user';
import { CasesData } from '@interfaces/case';
import { OrganisationInfo } from '@interfaces/organisation-info';
import { NotesData } from '@services/notes-service';
import { RemindersData } from '@services/reminder-service';
import { ActionPlan } from '@components/action-plan/action-plan.component';
import { ClosedCases } from '@components/closed-cases/closed-cases.component';
import { OngoingCases } from '@components/ongoing-cases/ongoing-cases.component';
import { Feedback } from '@components/feedback/feedback.component';
import { InvoicesData } from '@interfaces/invoice';
import { InvoicesTable } from '@components/invoices/invoices-table.component';

export const MyOverviewSection: React.FC<{
  orgInfo: OrganisationInfo;
  user: User;
  ongoing: CasesData;
  closed: CasesData;
  reminders: RemindersData;
  notes: NotesData;
  invoices: InvoicesData;
  flagInvoices: boolean;
}> = ({ ongoing, closed, reminders, notes, invoices, flagInvoices }) => {
  return (
    <>
      <div className="container px-0 m-auto">
        {flagInvoices && <InvoicesTable data={invoices} heading={'Fakturor'} helpText={''} />}
        <OngoingCases ongoing={ongoing} />
        <ClosedCases closed={closed} />
        <ActionPlan reminders={reminders} notes={notes} />
        {!flagInvoices && <InvoicesTable data={invoices} heading={'Fakturor'} helpText={''} />}
        <Feedback />
      </div>
    </>
  );
};

export default MyOverviewSection;

import { CasesData, ICase } from '@interfaces/case';
import { InvoicesData } from '@interfaces/invoice';
import { OrganisationInfo } from '@interfaces/organisation-info';
import { User } from '@interfaces/user';
import { emptyCaseList } from '@services/case-service';
import { emptyInvoicesList } from '@services/invoice-service';
import { emptyOrganisationInfo } from '@services/organisation-service';
import { emptyUser } from '@services/user-service';
import { createContext, useContext, useState } from 'react';

export interface AppContextInterface {
  isLoadingInvoices: boolean;
  setIsLoadingInvoices: (isLoadingInvoices: boolean) => void;

  isLoadingCases: boolean;
  setIsLoadingCases: (isLoadingCases: boolean) => void;

  representingEntity: OrganisationInfo;
  setRepresentingEntity: (entity: any) => void;

  user: User;
  setUser: (user: User) => void;

  invoices: InvoicesData;
  setInvoices: (invoices: InvoicesData) => void;

  cases: CasesData;
  setCases: (cases: CasesData) => void;

  changedCases: ICase[];
  setChangedCases: (changedCases: ICase[]) => void;

  highlightedTableRow: any;
  setHighlightedTableRow: (highlightedTableRow: any) => void;

  notificationAlerts: ICase[];
  setNotificationAlerts: (notificationAlerts: ICase[]) => void;
}

const AppContext = createContext<AppContextInterface>(null);

export function AppWrapper({ children }) {
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);
  const [isLoadingCases, setIsLoadingCases] = useState(true);
  const [changedCases, setChangedCases] = useState<ICase[]>([]);
  const [user, setUser] = useState<User>(emptyUser);
  const [representingEntity, setRepresentingEntity] = useState<OrganisationInfo>(emptyOrganisationInfo);
  const [invoices, setInvoices] = useState<InvoicesData>(emptyInvoicesList);
  const [cases, setCases] = useState<CasesData>(emptyCaseList);
  const [highlightedTableRow, setHighlightedTableRow] = useState<any>({});
  const [notifications, setNotifications] = useState<ICase[]>([]);

  return (
    <AppContext.Provider
      value={{
        isLoadingInvoices,
        setIsLoadingInvoices: (isLoadingInvoices: boolean) => setIsLoadingInvoices(isLoadingInvoices),

        isLoadingCases,
        setIsLoadingCases: (isLoadingCases: boolean) => setIsLoadingCases(isLoadingCases),

        representingEntity,
        setRepresentingEntity: (entity: any) => setRepresentingEntity(entity),

        user,
        setUser: (user: User) => setUser(user),

        invoices,
        setInvoices: (invoices: InvoicesData) => setInvoices(invoices),

        cases,
        setCases: (cases: CasesData) => setCases(cases),

        changedCases,
        setChangedCases: (changedCases: ICase[]) => setChangedCases(changedCases),

        highlightedTableRow,
        setHighlightedTableRow: (highlightedTableRow: any) => setHighlightedTableRow(highlightedTableRow),

        notificationAlerts: notifications,
        setNotificationAlerts: (notificationAlerts: ICase[]) => setNotifications(notificationAlerts),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}

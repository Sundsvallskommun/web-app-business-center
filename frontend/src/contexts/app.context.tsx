'use client';

import { CasesData, ICase } from '@interfaces/case';
import { InvoicesData } from '@interfaces/invoice';
import { BusinessEngagement, OrganisationInfo } from '@interfaces/organisation-info';
import { User } from '@interfaces/user';
import { emptyCaseList } from '@services/case-service';
import { emptyInvoicesList } from '@services/invoice-service';
import { emptyOrganisationInfo } from '@services/organisation-service';
import { emptyUser } from '@services/user-service';
import { createContext, useContext, useState } from 'react';
import { MyPagesMode } from '../interfaces/app';

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

  myPagesMode: MyPagesMode;
  isMyPagesModeBusiness: boolean;
  isMyPagesModePrivate: boolean;
  setMyPagesMode: (myPagsMode: MyPagesMode) => void;

  businessEngagements: BusinessEngagement[];
  setBusinessEngagements: (businessEngagements: BusinessEngagement[]) => void;
}

// @ts-expect-error
const AppContext = createContext<AppContextInterface>(null);

const defaults = {
  isLoadingInvoices: true,
  isLoadingCases: true,
  changedCases: [],
  user: emptyUser,
  representingEntity: emptyOrganisationInfo,
  invoices: emptyInvoicesList,
  cases: emptyCaseList,
  highlightedTableRow: {},
  notificationAlerts: [],
  myPagesMode: MyPagesMode.BUSINESS,
  businessEngagements: [],
};

export function AppWrapper({ children }) {
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(defaults.isLoadingInvoices);
  const [isLoadingCases, setIsLoadingCases] = useState(defaults.isLoadingCases);
  const [changedCases, setChangedCases] = useState<ICase[]>(defaults.changedCases);
  const [user, setUser] = useState<User>(defaults.user);
  const [representingEntity, setRepresentingEntity] = useState<OrganisationInfo>(defaults.representingEntity);
  const [invoices, setInvoices] = useState<InvoicesData>(defaults.invoices);
  const [cases, setCases] = useState<CasesData>(defaults.cases);
  const [highlightedTableRow, setHighlightedTableRow] = useState<any>(defaults.highlightedTableRow);
  const [notificationAlerts, setNotificationAlerts] = useState<ICase[]>(defaults.notificationAlerts);
  const [myPagesMode, setMyPagesMode] = useState<MyPagesMode>(defaults.myPagesMode);
  const [businessEngagements, setBusinessEngagements] = useState<BusinessEngagement[]>(defaults.businessEngagements);

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

        notificationAlerts,
        setNotificationAlerts: (notificationAlerts: ICase[]) => setNotificationAlerts(notificationAlerts),

        myPagesMode,
        isMyPagesModeBusiness: myPagesMode === MyPagesMode.BUSINESS,
        isMyPagesModePrivate: myPagesMode === MyPagesMode.PRIVATE,
        setMyPagesMode: (myPagesMode: MyPagesMode) => {
          setMyPagesMode(myPagesMode);
        },

        businessEngagements,
        setBusinessEngagements: (businessEngagements: BusinessEngagement[]) =>
          setBusinessEngagements(businessEngagements),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}

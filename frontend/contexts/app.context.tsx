import { User } from '@interfaces/user';
import { createContext, useContext, useState } from 'react';
import { CasesData, ICase } from '@interfaces/case';
import { OrganisationInfo } from '@interfaces/organisation-info';
import { emptyCaseList } from '@services/case-service';
import { emptyNotesList, NotesData } from '@services/notes-service';
import { emptyOrganisationInfo } from '@services/organisation-service';
import { emptyReminderList, RemindersData } from '@services/reminder-service';
import { defaultContactSettings, ContactFormModel } from '@services/settings-service';
import { emptyUser } from '@services/user-service';
import { InvoicesData } from '@interfaces/invoice';
import { emptyInvoicesList } from '@services/invoice-service';

export interface AppContextInterface {
  isLoadingNotes: boolean;
  setIsLoadingNotes: (isLoadingNotes: boolean) => void;

  isLoadingReminders: boolean;
  setIsLoadingReminders: (isLoadingReminders: boolean) => void;

  isLoadingInvoices: boolean;
  setIsLoadingInvoices: (isLoadingInvoices: boolean) => void;

  isLoadingCases: boolean;
  setIsLoadingCases: (isLoadingCases: boolean) => void;

  representingEntity: OrganisationInfo;
  setRepresentingEntity: (entity: any) => void;

  user: User;
  setUser: (user: User) => void;

  contactSettings: ContactFormModel;
  setContactSettings: (s: ContactFormModel) => void;

  invoices: InvoicesData;
  setInvoices: (invoices: InvoicesData) => void;

  cases: CasesData;
  setCases: (cases: CasesData) => void;

  changedCases: ICase[];
  setChangedCases: (changedCases: ICase[]) => void;

  highlightedTableRow: any;
  setHighlightedTableRow: (highlightedTableRow: any) => void;

  notes: NotesData;
  setNotes: (notes: NotesData) => void;

  reminders: RemindersData;
  setReminders: (reminders: RemindersData) => void;

  notificationAlerts: ICase[];
  setNotificationAlerts: (notificationAlerts: ICase[]) => void;
}

const AppContext = createContext<AppContextInterface>(null);

export function AppWrapper({ children }) {
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [isLoadingReminders, setIsLoadingReminders] = useState(true);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);
  const [isLoadingCases, setIsLoadingCases] = useState(true);
  const [changedCases, setChangedCases] = useState<ICase[]>([]);
  const [contactSettings, setContactSettings] = useState<ContactFormModel>(defaultContactSettings);
  const [user, setUser] = useState<User>(emptyUser);
  const [representingEntity, setRepresentingEntity] = useState<OrganisationInfo>(emptyOrganisationInfo);
  const [invoices, setInvoices] = useState<InvoicesData>(emptyInvoicesList);
  const [cases, setCases] = useState<CasesData>(emptyCaseList);
  const [highlightedTableRow, setHighlightedTableRow] = useState<any>({});
  const [reminders, setReminders] = useState<RemindersData>(emptyReminderList);
  const [notifications, setNotifications] = useState<ICase[]>([]);
  const [notes, setNotes] = useState<NotesData>(emptyNotesList);

  return (
    <AppContext.Provider
      value={{
        isLoadingNotes,
        setIsLoadingNotes: (isLoadingNotes: boolean) => setIsLoadingNotes(isLoadingNotes),

        isLoadingReminders,
        setIsLoadingReminders: (isLoadingReminders: boolean) => setIsLoadingReminders(isLoadingReminders),

        isLoadingInvoices,
        setIsLoadingInvoices: (isLoadingInvoices: boolean) => setIsLoadingInvoices(isLoadingInvoices),

        isLoadingCases,
        setIsLoadingCases: (isLoadingCases: boolean) => setIsLoadingCases(isLoadingCases),

        representingEntity,
        setRepresentingEntity: (entity: any) => setRepresentingEntity(entity),

        contactSettings: contactSettings,
        setContactSettings: (s: ContactFormModel) => setContactSettings(s),

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

        notes,
        setNotes: (notes: NotesData) => setNotes(notes),

        reminders,
        setReminders: (reminders: RemindersData) => setReminders(reminders),

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

import dayjs from 'dayjs';
import { statusCodes } from '../interfaces/status-codes';
import { ApiResponse, apiService, Data } from './api-service';

interface ReminderResponse {
  reminderId: string;
  personId: string;
  action: string;
  note: string;
  caseId: string;
  caseLink: string;
  reminderDate: string;
  caseType: string;
  externalCaseId: string;
  created: string;
  createdBy: string;
  modified: string;
  modifiedBy: string;
}

export type SendNoteOmittedTypes = 'reminderId' | 'personId' | 'created' | 'createdBy' | 'modified' | 'modifiedBy';
export type SendReminder = Omit<ReminderResponse, SendNoteOmittedTypes>;

export interface ReminderLabel {
  label: string;
  sortable: boolean;
  shownForStatus: statusCodes;
  screenReaderOnly: boolean;
}

export interface RemindersData extends Data {
  reminders: ReminderFormModel[];
  labels: ReminderLabel[];
}

export interface ReminderFormModel {
  heading: string;
  note: string;
  caseId: string;
  caseLink: string;
  reminderDate: string;
  caseType: string;
  externalCaseId: string;
  isReminder?: boolean;
  id?: string;
  created?: string;
  createdBy?: string;
  modified?: string;
  modifiedBy?: string;
}

export const defaultReminder = {
  heading: '',
  note: '',
  caseId: '',
  caseLink: '',
  reminderDate: '',
  caseType: '',
  externalCaseId: '',
  isReminder: false,
};

export interface ReminderEditFormModel extends ReminderFormModel {
  reminderId: string;
}

export const remindersLabels = [
  { label: 'Ärende', screenReaderOnly: false, sortable: true, shownForStatus: statusCodes.Any },
  { label: 'Senast ändrat', screenReaderOnly: false, sortable: true, shownForStatus: statusCodes.Any },
  { label: 'Skapad av', screenReaderOnly: false, sortable: true, shownForStatus: statusCodes.Any },
  { label: 'Anteckning', screenReaderOnly: false, sortable: true, shownForStatus: statusCodes.Any },
  { label: 'Ärendeknapp', screenReaderOnly: true, sortable: false, shownForStatus: statusCodes.Any },
];

export const emptyReminderList: RemindersData = { reminders: [], labels: remindersLabels };

export const handleReminderResponse: (res: ApiResponse<ReminderResponse[]>) => ReminderFormModel[] = (res) =>
  res.data.map((n: ReminderResponse, idx) => ({
    heading: n.action,
    note: n.note,
    caseId: n.caseId,
    caseLink: n.caseLink,
    reminderDate: n.reminderDate,
    caseType: n.caseType,
    externalCaseId: n.externalCaseId,
    isReminder: true,
    id: n.reminderId,
    created: dayjs(n.created).format('YYYY-MM-DD HH:MM'),
    createdBy: n.createdBy,
    modified: dayjs(n.modified).format('YYYY-MM-DD HH:MM'),
    modifiedBy: n.modifiedBy,
  }));

export interface Action {
  id: number;
  label: string;
  enabled: boolean;
}

export const actions: Action[] = [
  { id: 1, label: 'Följa upp', enabled: true },
  { id: 2, label: 'Komplettera', enabled: true },
  { id: 3, label: 'Förnya tillstånd', enabled: true },
  { id: 4, label: 'Skicka nytt ärende', enabled: true },
  { id: 5, label: 'Övrigt', enabled: true },
];

export const ongoingCasesActions: Action[] = [
  { id: 1, label: 'Följa upp', enabled: true },
  { id: 2, label: 'Komplettera', enabled: true },
  { id: 3, label: 'Övrigt', enabled: true },
];

export const closedCasesActions: Action[] = [
  { id: 1, label: 'Följa upp', enabled: true },
  { id: 2, label: 'Förnya tillstånd', enabled: true },
  { id: 3, label: 'Skicka nytt ärende', enabled: true },
  { id: 4, label: 'Övrigt', enabled: true },
];

export const getReminders: () => Promise<RemindersData> = () =>
  apiService
    .get<ApiResponse<ReminderResponse[]>>('reminders')
    .then((res) => ({ reminders: handleReminderResponse(res.data), labels: remindersLabels } as RemindersData))
    .catch((e) => ({ ...emptyReminderList, error: e.response?.status ?? 'UNKNOWN ERROR' } as RemindersData));

export const handleSendReminder: (reminder: ReminderFormModel) => SendReminder = (reminder) => ({
  action: reminder.heading,
  note: reminder.note,
  caseId: reminder.caseId,
  caseLink: reminder.caseLink,
  caseType: reminder.caseType,
  externalCaseId: reminder.externalCaseId ? reminder.externalCaseId.toString() : reminder.externalCaseId,
  reminderDate: reminder.reminderDate,
});

export const saveReminder: (reminder: ReminderFormModel) => Promise<boolean> = (reminder) => {
  return apiService
    .post('reminders', handleSendReminder(reminder))
    .then(() => Promise.resolve(true))
    .catch((e) => Promise.resolve(false));
};

export const editReminder: (reminder: ReminderFormModel) => Promise<boolean> = (reminder) => {
  return apiService
    .patch(`reminders/${reminder.id}`, handleSendReminder(reminder))
    .then(() => Promise.resolve(true))
    .catch((e) => Promise.resolve(false));
};

export const deleteReminder: (id: string) => Promise<boolean> = (id) => {
  return apiService
    .delete(`reminders/${id}`)
    .then(() => Promise.resolve(true))
    .catch((e) => Promise.resolve(false));
};

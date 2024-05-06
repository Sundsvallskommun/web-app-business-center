import dayjs from 'dayjs';
import { statusCodes } from '../interfaces/status-codes';
import { ApiResponse, apiService, Data } from './api-service';
import { ReminderFormModel } from './reminder-service';
import { ApiResponseMeta } from '@interfaces/service';

export interface NoteResponse {
  id: string;
  subject: string;
  body: string;
  caseId: string;
  caseLink: string;
  caseType: string;
  externalCaseId: string;
  createdBy?: string;
  created: string;
  modified: string;
  modifiedBy: string;
  context: string;
  role: string;
  clientId: string;
}

const emptyNotesResponse: ApiResponse<{ notes: NoteResponse[] }> = {
  data: { notes: [] },
  message: 'none',
};

export type SendNoteOmittedTypes = 'id' | 'partyId' | 'created' | 'modified' | 'modifiedBy';

export interface SendNote {
  subject: string;
  body: string;
  caseId: string;
  caseLink: string;
  caseType: string;
  externalCaseId: string;
  createdBy?: string;
}

export interface NoteLabel {
  label: string;
  sortable: boolean;
  shownForStatus: statusCodes;
  screenReaderOnly: boolean;
}

export interface NotesData extends Data {
  _meta?: ApiResponseMeta;
  notes: NoteResponse[];
  labels: NoteLabel[];
}

export const noteLabels: NoteLabel[] = [
  { label: 'Ärende', sortable: false, screenReaderOnly: true, shownForStatus: statusCodes.Any },
  { label: 'Innehåll', sortable: false, screenReaderOnly: true, shownForStatus: statusCodes.Any },
];

export const emptyNotesList: NotesData = { notes: [], labels: noteLabels };

export const handleNotesResponse: (res: ApiResponse<{ notes: NoteResponse[] }>) => ReminderFormModel[] = (res) =>
  res.data.notes.map((n: NoteResponse) => ({
    heading: n.subject,
    note: n.body,
    caseId: n.caseId,
    caseLink: n.caseLink,
    reminderDate: '',
    caseType: n.caseType,
    externalCaseId: n.externalCaseId,
    isReminder: false,
    id: n.id,
    created: dayjs(n.created).format('YYYY-MM-DD HH:MM'),
    createdBy: n.createdBy,
    modified: dayjs(n.modified).format('YYYY-MM-DD HH:MM'),
    modifiedBy: n.modifiedBy,
  }));

export const getNotes: () => Promise<NotesData> = () =>
  apiService
    .get<ApiResponse<{ notes: NoteResponse[]; _meta: ApiResponseMeta }>>('notes')
    .then(
      (res) =>
        ({
          notes: handleNotesResponse(res.data),
          labels: noteLabels,
          _meta: res.data.data._meta,
        } as unknown as NotesData)
    )
    .catch(
      (e) =>
        ({
          notes: handleNotesResponse(emptyNotesResponse),
          labels: noteLabels,
          error: e.response?.status ?? 'UNKNOWN ERROR',
        } as unknown as NotesData)
    );

export const handleSendNote: (reminder: ReminderFormModel) => SendNote = (reminder) => ({
  subject: reminder.heading,
  body: reminder.note,
  caseId: reminder.caseId,
  caseLink: reminder.caseLink,
  caseType: reminder.caseType,
  externalCaseId: reminder.externalCaseId,
});

export const saveNote: (note: ReminderFormModel) => Promise<boolean> = (note) => {
  return apiService
    .post('notes', handleSendNote(note))
    .then(() => Promise.resolve(true))
    .catch((e) => Promise.resolve(false));
};

export const editNote: (note: ReminderFormModel) => Promise<boolean> = (note) => {
  return apiService
    .patch(`notes/${note.id}`, handleSendNote(note))
    .then(() => Promise.resolve(true))
    .catch((e) => Promise.resolve(false));
};

export const deleteNote: (id: string) => Promise<boolean> = (id) => {
  return apiService
    .delete(`notes/${id}`)
    .then(() => Promise.resolve(true))
    .catch((e) => Promise.resolve(false));
};

import {
  handleNotesResponse,
  handleSendNote,
  getNotes,
  noteLabels,
  saveNote,
  editNote,
  deleteNote,
} from '@services/notes-service';
const axios = require('axios');
jest.mock('axios');

const mockApiNoteResponse = {
  data: {
    notes: [
      {
        id: 'id',
        subject: 'subject',
        body: 'body',
        caseId: 'caseId',
        caseLink: 'caseLink',
        caseType: 'caseType',
        externalCaseId: 'externalCaseId',
        createdBy: 'createdBy',
        created: new Date(1337, 0, 1, 1, 1, 1, 1),
        modified: new Date(1337, 0, 1, 1, 1, 1, 1),
        modifiedBy: 'modifiedBy',
      },
    ],
    _meta: {
      page: 1,
      limit: 100,
      totalRecords: 1,
      totalPages: 1,
    },
  },
  message: 'success',
};

const handledMockNotes = [
  {
    heading: 'subject',
    note: 'body',
    caseId: 'caseId',
    caseLink: 'caseLink',
    created: '1337-01-01 01:01',
    reminderDate: '',
    caseType: 'caseType',
    externalCaseId: 'externalCaseId',
    isReminder: false,
    id: 'id',
    createdBy: 'createdBy',
    modified: '1337-01-01 01:01',
    modifiedBy: 'modifiedBy',
  },
];

const mockReminder = {
  heading: 'subject',
  note: 'body',
  caseId: 'caseId',
  caseLink: 'caseLink',
  reminderDate: '',
  caseType: 'caseType',
  externalCaseId: 'externalCaseId',
  isReminder: false,
  id: 'id',
  created: '1337-01-01 01:01',
  createdBy: 'createdBy',
  modified: '1337-01-01 01:01',
  modifiedBy: 'modifiedBy',
};

const handledSendNote = {
  subject: 'subject',
  body: 'body',
  caseId: 'caseId',
  caseLink: 'caseLink',
  caseType: 'caseType',
  externalCaseId: 'externalCaseId',
};

const GetNotesResponseSuccess = {
  notes: handledMockNotes,
  labels: noteLabels,
  _meta: {
    page: 1,
    limit: 100,
    totalRecords: 1,
    totalPages: 1,
  },
};

const GetNotesResponse404 = {
  notes: [],
  labels: noteLabels,
  error: '404',
};

describe('Notes service', () => {
  it('converts api response properly', () => {
    expect(handleNotesResponse(mockApiNoteResponse)).toEqual(handledMockNotes);
  });
  it('converts api send data properly', () => {
    expect(handleSendNote(mockReminder)).toEqual(handledSendNote);
  });

  it('getNotes Success', async () => {
    axios.get.mockResolvedValue({ data: mockApiNoteResponse });
    const res = await getNotes();
    expect(res).toEqual(GetNotesResponseSuccess);
  });

  it('getNotes 404', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockImplementation(() => {
      return Promise.reject({ response: { status: '404', data: { message: 'NOK' } }, config: { url: '' } });
    });
    const res = await getNotes();
    expect(res).toEqual(GetNotesResponse404);
  });

  // These are basically not falsifiable because they return true for all responses
  it('saveNote Success', async () => {
    axios.post.mockResolvedValue({ message: 'created' });
    const res = await saveNote(mockReminder);
    expect(res).toEqual(true);
  });

  it('saveNote Fail', async () => {
    axios.post.mockImplementation(() => {
      return Promise.reject({ error: { response: { status: '', data: { message: 'NOK' } } } });
    });
    const res = await saveNote(mockReminder);
    expect(res).toEqual(false);
  });

  it('editNote Success', async () => {
    axios.patch.mockResolvedValue({ message: 'edited' });
    const res = await editNote(mockReminder);
    expect(res).toEqual(true);
  });

  it('editNote Fail', async () => {
    axios.patch.mockImplementation(() => {
      return Promise.reject({ error: { response: { status: '', data: { message: 'NOK' } } } });
    });
    const res = await editNote(mockReminder);
    expect(res).toEqual(false);
  });

  it('deleteNote Success', async () => {
    axios.delete.mockResolvedValue({ message: 'removed' });
    const res = await deleteNote('id');
    expect(res).toEqual(true);
  });

  it('deleteNote Fail', async () => {
    axios.delete.mockImplementation(() => {
      return Promise.reject({ error: { response: { status: '', data: { message: 'NOK' } } } });
    });
    const res = await deleteNote(mockReminder);
    expect(res).toEqual(false);
  });
});

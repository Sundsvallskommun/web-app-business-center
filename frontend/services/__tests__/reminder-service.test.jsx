import {
  handleReminderResponse,
  handleSendReminder,
  getReminders,
  remindersLabels,
  saveReminder,
  editReminder,
  deleteReminder,
} from '@services/reminder-service';
const axios = require('axios');
jest.mock('axios');

const mockApiReminderResponse = {
  data: [
    {
      reminderId: 'reminderId',
      personId: 'personId',
      action: 'action',
      note: 'note',
      caseId: 'caseId',
      caseLink: 'caseLink',
      reminderDate: 'reminderDate',
      caseType: 'caseType',
      externalCaseId: 'externalCaseId',
      created: new Date(1337, 0, 1, 1, 1, 1, 1),
      createdBy: 'createdBy',
      modified: new Date(1337, 0, 1, 1, 1, 1, 1),
      modifiedBy: 'modifiedBy',
    },
  ],
  message: 'success',
};

const mockReminder = {
  heading: 'action',
  note: 'note',
  caseId: 'caseId',
  caseLink: 'caseLink',
  reminderDate: 'reminderDate',
  caseType: 'caseType',
  externalCaseId: 'externalCaseId',
  isReminder: true,
  id: 'reminderId',
  created: '1337-01-01 01:01',
  createdBy: 'createdBy',
  modified: '1337-01-01 01:01',
  modifiedBy: 'modifiedBy',
};

const handledMockReminders = [mockReminder];

const handledSendReminder = {
  action: 'action',
  note: 'note',
  caseId: 'caseId',
  caseLink: 'caseLink',
  caseType: 'caseType',
  externalCaseId: 'externalCaseId',
  reminderDate: 'reminderDate',
};

const remindersData = {
  reminders: [mockReminder],
  labels: remindersLabels,
};

const emptyReminderList = {
  reminders: [],
  labels: remindersLabels,
};

describe('Reminders service', () => {
  it('converts api response properly', () => {
    expect(handleReminderResponse(mockApiReminderResponse)).toEqual(handledMockReminders);
  });
  it('converts api send data properly', () => {
    expect(handleSendReminder(mockReminder)).toEqual(handledSendReminder);
  });

  it('getReminders Success', async () => {
    axios.get.mockResolvedValue({ data: mockApiReminderResponse });
    const res = await getReminders();
    expect(res).toEqual(remindersData);
  });

  it('getReminders Fail', async () => {
    axios.get.mockImplementation(() => {
      return Promise.reject({ error: { response: { status: '', data: { message: 'NOK' } } } });
    });
    const res = await getReminders();
    expect(res).toEqual({ ...emptyReminderList, error: 'UNKNOWN ERROR' });
  });

  it('saveReminder Success', async () => {
    axios.post.mockResolvedValue(handledSendReminder);
    const res = await saveReminder(mockReminder);
    expect(res).toEqual(true);
  });

  it('saveReminder Fail', async () => {
    axios.post.mockImplementation(() => {
      return Promise.reject({ error: { response: { status: '', data: { message: 'NOK' } } } });
    });
    const res = await saveReminder(mockReminder);
    expect(res).toEqual(false);
  });

  it('editReminder Success', async () => {
    axios.patch.mockResolvedValue(handledSendReminder);
    const res = await editReminder(mockReminder);
    expect(res).toEqual(true);
  });

  it('editReminder Fail', async () => {
    axios.patch.mockImplementation(() => {
      return Promise.reject({ error: { response: { status: '', data: { message: 'NOK' } } } });
    });
    const res = await editReminder(mockReminder);
    expect(res).toEqual(false);
  });

  it('deleteReminder Success', async () => {
    axios.delete.mockResolvedValue(handledSendReminder);
    const res = await deleteReminder('reminderId');
    expect(res).toEqual(true);
  });

  it('deleteReminder Fail', async () => {
    axios.delete.mockImplementation(() => {
      return Promise.reject({ error: { response: { status: '', data: { message: 'NOK' } } } });
    });
    const res = await deleteReminder('reminderId');
    expect(res).toEqual(false);
  });
});

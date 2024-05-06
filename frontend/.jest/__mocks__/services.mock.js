import { getMe, getUserMeta } from '@services/user-service';
import { getCases } from '@services/case-service';
import { getReminders, editReminder, saveReminder, deleteReminder } from '@services/reminder-service';
import { getNotes, editNote, saveNote, deleteNote } from '@services/notes-service';
import { getRepresenting, getBusinessEngagements } from '@services/organisation-service';
import { getContactSettings } from '@services/settings-service';
import { getInvoices } from '@services/invoice-service';

import {
  representingEntity,
  user,
  userMeta,
  cases,
  reminders,
  notes,
  feedbackSettings,
  businessEngagements,
  invoices,
} from './data.mock.js';

jest.mock('@services/user-service', () => {
  const originalModule = jest.requireActual('@services/user-service');
  return {
    // __esModule: true,
    ...originalModule,
    getMe: jest.fn(),
    getUserMeta: jest.fn(),
  };
});

jest.mock('@services/case-service', () => {
  const originalModule = jest.requireActual('@services/case-service');
  return {
    // __esModule: true,
    ...originalModule,
    getCases: jest.fn(),
  };
});

jest.mock('@services/reminder-service', () => {
  const originalModule = jest.requireActual('@services/reminder-service');
  return {
    // __esModule: true,
    ...originalModule,
    getReminders: jest.fn(),
    editReminder: jest.fn(),
    saveReminder: jest.fn(),
    deleteReminder: jest.fn(),
  };
});

jest.mock('@services/notes-service', () => {
  const originalModule = jest.requireActual('@services/notes-service');
  return {
    // __esModule: true,
    ...originalModule,
    getNotes: jest.fn(),
    editNote: jest.fn(),
    saveNote: jest.fn(),
    deleteNote: jest.fn(),
  };
});

jest.mock('@services/organisation-service', () => {
  const originalModule = jest.requireActual('@services/organisation-service');
  return {
    // __esModule: true,
    ...originalModule,
    getRepresenting: jest.fn(),
    getBusinessEngagements: jest.fn(),
  };
});

jest.mock('@services/settings-service', () => {
  const originalModule = jest.requireActual('@services/settings-service');
  return {
    // __esModule: true,
    ...originalModule,
    getContactSettings: jest.fn(),
  };
});

jest.mock('@services/invoice-service', () => {
  const originalModule = jest.requireActual('@services/invoice-service');
  return {
    // __esModule: true,
    ...originalModule,
    getInvoices: jest.fn(),
  };
});

getMe.mockImplementation(() => Promise.resolve(user));
getUserMeta.mockImplementation(() => Promise.resolve(userMeta));
getCases.mockImplementation(() => Promise.resolve(cases));
getReminders.mockImplementation(() => Promise.resolve(reminders));
editReminder.mockImplementation(() => Promise.resolve(true));
saveReminder.mockImplementation(() => Promise.resolve(true));
deleteReminder.mockImplementation(() => Promise.resolve(true));
getNotes.mockImplementation(() => Promise.resolve(notes));
editNote.mockImplementation(() => Promise.resolve(true));
saveNote.mockImplementation(() => Promise.resolve(true));
deleteNote.mockImplementation(() => Promise.resolve(true));
getRepresenting.mockImplementation(() => Promise.resolve(representingEntity));
getBusinessEngagements.mockImplementation(() => Promise.resolve(businessEngagements));
getContactSettings.mockImplementation(() => Promise.resolve(feedbackSettings));
getInvoices.mockImplementation(() => Promise.resolve(invoices));

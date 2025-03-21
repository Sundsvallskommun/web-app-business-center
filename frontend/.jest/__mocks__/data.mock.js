import { closedCasesLabels, ongoingCasesLabels } from '@services/case-service';
import { noteLabels } from '@services/notes-service';
import { remindersLabels } from '@services/reminder-service';
import { invoicesLabels } from '@services/invoice-service';

export const user = {
  name: 'Karin',
  userSettings: {
    feedbackLifespan: 2,
  },
};

export const representingEntity = {
  orgName: 'orgName',
  orgNumber: 'orgNumber',
  information: {
    companyLocation: {
      city: 'city',
      street: 'street',
      postcode: 'postcode',
      careOf: 'careOf',
    },
  },
};

export const handledMockCaseOngoingA = {
  externalCaseId: 'externalCaseIdOngoingA',
  caseId: 'idOngoingA',
  subject: {
    caseType: 'caseTypeOngoingA',
    meta: {
      created: 'firstSubmittedOngoingA',
      modified: 'lastStatusChangeOngoingA',
    },
  },
  department: '--OngoingA',
  validFrom: '--OngoingA',
  validTo: '--OngoingA',
  serviceDate: '--OngoingA',
  status: { code: 2, color: 'info', label: 'Kompletterad' },
  lastStatusChange: 'lastStatusChangeOngoingA',
};

export const handledMockCaseOngoingB = {
  externalCaseId: 'externalCaseIdOngoingB',
  caseId: 'idOngoingB',
  subject: {
    caseType: 'caseTypeOngoingB',
    meta: {
      created: 'firstSubmittedOngoingB',
      modified: 'lastStatusChangeOngoingB',
    },
  },
  department: '--OngoingB',
  validFrom: '--OngoingB',
  validTo: '--OngoingB',
  serviceDate: '--OngoingB',
  status: { code: 2, color: 'info', label: 'Kompletterad' },
  lastStatusChange: 'lastStatusChangeOngoing',
};

export const handledMockCaseClosedA = {
  externalCaseId: 'externalCaseIdClosedA',
  caseId: 'idClosedA',
  subject: {
    caseType: 'caseTypeClosedA',
    meta: {
      created: 'firstSubmittedClosedA',
      modified: 'lastStatusChangeClosedA',
    },
  },
  department: '--ClosedA',
  validFrom: '--ClosedA',
  validTo: '--ClosedA',
  serviceDate: '--ClosedA',
  status: { code: 1, color: 'neutral', label: 'Ärendet arkiveras' },
  lastStatusChange: 'lastStatusChangeClosedA',
};

export const handledMockCaseClosedB = {
  externalCaseId: 'externalCaseIdClosedB',
  caseId: 'idClosedB',
  subject: {
    caseType: 'caseTypeClosedB',
    meta: {
      created: 'firstSubmittedClosedB',
      modified: 'lastStatusChangeClosedB',
    },
  },
  department: '--ClosedB',
  validFrom: '--ClosedB',
  validTo: '--ClosedB',
  serviceDate: '--ClosedB',
  status: { code: 1, color: 'neutral', label: 'Ärendet arkiveras' },
  lastStatusChange: 'lastStatusChangeClosedB',
};

export const cases = {
  cases: [handledMockCaseOngoingA, handledMockCaseOngoingB, handledMockCaseClosedA, handledMockCaseClosedB],
  labels: [],
};

export const notificationAlerts = cases.cases;

export const ongoingCases = {
  cases: [handledMockCaseOngoingA, handledMockCaseOngoingB],
  labels: ongoingCasesLabels,
};

export const closedCases = {
  cases: [handledMockCaseClosedA, handledMockCaseClosedB],
  labels: closedCasesLabels,
};

export const handledMockNotes = [
  {
    heading: 'subject',
    note: 'body',
    caseId: 'caseId',
    caseLink: 'caseLink',
    created: 'created',
    reminderDate: '',
    caseType: 'caseType',
    externalCaseId: 'externalCaseId',
    isReminder: false,
    id: 'id',
    createdBy: 'createdBy',
  },
];

export const notes = {
  notes: handledMockNotes,
  labels: noteLabels,
};

export const mockReminder = {
  heading: 'action',
  note: 'note',
  caseId: 'caseId',
  caseLink: 'caseLink',
  reminderDate: 'reminderDate',
  caseType: 'caseType',
  externalCaseId: 'externalCaseId',
  isReminder: true,
  id: 'reminderId',
  createdBy: 'createdBy',
};

export const reminders = {
  reminders: [mockReminder],
  labels: remindersLabels,
};

export const feedbackSettings = {
  id: 'id',
  contacts: [
    {
      alias: 'alias',
      contactMethods: {
        SMS: [
          {
            contactMethod: 'SMS',
            destination: '0701740605',
            sendFeedback: true,
            alias: 'alias',
          },
        ],
        EMAIL: [
          {
            contactMethod: 'EMAIL',
            destination: 'a@example.com',
            sendFeedback: false,
            alias: 'alias',
          },
        ],
      },
    },
  ],
};

export const userMeta = {
  lastLoginTime: '2002-02-11T09:15:15.628Z',
};

export const businessEngagements = {
  engagements: [
    {
      organizationName: 'organizationName',
      organizationNumber: 'organizationNumber',
      organizationId: 'organizationId',
    },
  ],
};

export const invoices = {
  invoices: [
    {
      invoiceNumber: 'n.invoiceNumber',
      dueDate: 'n.dueDate',
      invoiceDescription: 'n.invoiceDescription',
      totalAmount: 'n.totalAmount',
      pdfAvailable: 'n.pdfAvailable',
      invoiceStatus: 'mapStatus(n.invoiceStatus)',
      ocrNumber: 'n.ocrNumber',
    },
  ],
  labels: invoicesLabels,
};

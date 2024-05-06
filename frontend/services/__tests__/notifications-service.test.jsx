import { getNotifications } from '@services/notifications-service';
import dayjs from 'dayjs';

let lastLoginTime = dayjs('1999-01-01');
let dateCaseHasBeenChanged = dayjs();
let dateCaseHasNotBeenChanged = dayjs('1999-01-01');

const settings = {
  name: 'name',
  userSettings: {
    feedbackLifespan: 2,
    readNotificationsClearedDate: dateCaseHasNotBeenChanged,
  },
};

const userMeta = {
  lastLoginTime: lastLoginTime,
};

const cases = {
  cases: [
    {
      externalCaseId: 'externalCaseId',
      caseId: 'caseId',
      subject: {
        caseType: 'caseType',
        meta: {
          created: 'created',
          modified: 'modified',
        },
      },
      department: 'department',
      validFrom: 'validFrom',
      validTo: 'validTo',
      serviceDate: 'serviceDate',
      status: {
        code: ['Approved', 'Rejected', 'Ongoing', 'Warning', 'Any'],
        color: 'color',
        label: 'label',
      },
      lastStatusChange: dateCaseHasBeenChanged,
    },
    {
      externalCaseId: 'externalCaseId',
      caseId: 'caseId',
      subject: {
        caseType: 'caseType',
        meta: {
          created: 'created',
          modified: 'modified',
        },
      },
      department: 'department',
      validFrom: 'validFrom',
      validTo: 'validTo',
      serviceDate: 'serviceDate',
      status: {
        code: ['Approved', 'Rejected', 'Ongoing', 'Warning', 'Any'],
        color: 'color',
        label: 'label',
      },
      lastStatusChange: dateCaseHasNotBeenChanged,
    },
  ],
  labels: [
    {
      label: 'label',
      screenReaderOnly: true,
      sortable: true,
      shownForStatus: ['Approved', 'Rejected', 'Ongoing', 'Warning', 'Any'],
    },
  ],
};

const changedCasees = [
  {
    externalCaseId: 'externalCaseId',
    caseId: 'caseId',
    subject: {
      caseType: 'caseType',
      meta: {
        created: 'created',
        modified: 'modified',
      },
    },
    department: 'department',
    validFrom: 'validFrom',
    validTo: 'validTo',
    serviceDate: 'serviceDate',
    status: { code: ['Approved', 'Rejected', 'Ongoing', 'Warning', 'Any'], color: 'color', label: 'label' },
    lastStatusChange: dateCaseHasBeenChanged,
  },
];

describe('Notifications service', () => {
  it('converts api response properly', async () => {
    const getReadNotifications = jest.spyOn(require('@services/notifications-service'), 'getReadNotifications');
    getReadNotifications.mockReturnValueOnce([]);
    expect(await getNotifications(settings, cases)).toEqual(changedCasees);
  });
});

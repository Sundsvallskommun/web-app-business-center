import NotificationComponent from '../notification.component';
import { render, screen } from '@testing-library/react';
import { AppWrapper } from '@contexts/app.context';

const handledMockCase = {
  externalCaseId: 'externalCaseId',
  caseId: 'id',
  subject: {
    caseType: 'caseType',
    meta: {
      created: 'firstSubmitted',
      modified: 'lastStatusChange',
    },
  },
  department: '--',
  validFrom: '--',
  validTo: '--',
  serviceDate: '--',
  status: { code: 2, color: 'info', label: 'Kompletterad' },
  lastStatusChange: 'lastStatusChange',
};

describe('NotificationComponent', () => {
  beforeEach(async () => {
    render(
      <AppWrapper>
        <NotificationComponent item={handledMockCase} type={'info'} />
      </AppWrapper>
    );
  });

  it('renders NotificationComponent and checks for data', async () => {
    const item = screen.getByText(/Kompletterad/);
    expect(item).toBeTruthy();
  });
});

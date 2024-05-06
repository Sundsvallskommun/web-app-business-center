import '@jestRoot/__mocks__/services.mock';
import '@jestRoot/__mocks__/context.mock';
import { NotificationsAlert } from '../notifications-alert.component';
import { render, act, waitFor } from '@testing-library/react';
import { AppWrapper } from '@contexts/app.context';
import userEvent from '@testing-library/user-event';

jest.mock(
  'next/link',
  () =>
    ({ children }) =>
      children
);
describe('NotificationsAlert', () => {
  let container;
  const user = userEvent.setup();
  jest.setTimeout(10000);
  let notification;
  let alertButton;
  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => ({})); // Remove act() error, because this test is not checking for data renders
    jest.spyOn(console, 'log').mockImplementation(() => ({}));
    container = render(
      <AppWrapper>
        <NotificationsAlert />
      </AppWrapper>
    );
    await waitFor(() => (alertButton = container.getByRole('button', { name: /4/i })), { timeout: 5000 });
    await act(() => user.click(alertButton));
    await waitFor(() => (notification = container.getAllByText(/caseTypeOngoingA/i)), { timeout: 10000 });
  });

  it('renders NotificationsAlert with modal open unchanged', () => {
    expect(container).toMatchSnapshot();
  });

  it('renders NotificationsAlert with modal open and checks for notification data', async () => {
    let alertButtonExpanded;
    await waitFor(() => (alertButtonExpanded = container.getByRole('button', { name: /4/i, expanded: true })), {
      timeout: 5000,
    });
    expect(alertButtonExpanded).toBeTruthy();
    expect(notification[0]).toBeTruthy();
  });

  it('renders NotificationsAlert with modal open and clicks first notification', async () => {
    let notificationbuttons;
    await waitFor(() => (notificationbuttons = container.getAllByRole('button', { name: /caseTypeOngoingA/i })), {
      timeout: 5000,
    });
    await act(() => user.click(notificationbuttons[0]));

    // Should close modal
    let alertButtonClosed;
    await waitFor(() => (alertButtonClosed = container.getByRole('button', { name: /4/i, expanded: false })), {
      timeout: 5000,
    });
    expect(alertButtonClosed).toBeTruthy();
  });

  // it('renders NotificationsAlert with modal open and clicks clearAll', async () => {
  //     const clearButton = await container.getAllByRole('button', {name: /Rensa alla/i});
  //     await act(()=>user.click(clearButton[0]));
  //     let alertButton;
  //     await waitFor(()=> alertButton = container.getByRole('button', {name: /Det finns inga nya händelser/i}), {timeout: 5000});
  //     expect(alertButton).toBeTruthy();
  // })
});

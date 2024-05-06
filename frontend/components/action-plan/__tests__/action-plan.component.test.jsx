import '@jestRoot/__mocks__/services.mock';
import '@jestRoot/__mocks__/context.mock';
import { ActionPlan } from '../action-plan.component';
import { render, act, waitFor, within } from '@testing-library/react';
import { AppWrapper } from '@contexts/app.context';
import userEvent from '@testing-library/user-event';
import { reminders, notes } from '@jestRoot/__mocks__/data.mock';

describe('ActionPlan', () => {
  let container;
  const user = userEvent.setup();
  jest.setTimeout(10000);
  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => ({}));
    jest.spyOn(console, 'log').mockImplementation(() => ({}));
    container = render(
      <AppWrapper>
        <ActionPlan reminders={reminders} notes={notes} />
      </AppWrapper>
    );
    const disclosureButtons = await container.queryAllByRole('button', {
      name: /Egna påminnelser/i,
      expanded: false,
    });
    expect(disclosureButtons).toBeTruthy();
    await act(() => user.click(disclosureButtons[0]));
    await waitFor(
      () => (disclosureButtonOpen = container.getByRole('button', { name: /Egna påminnelser/i, expanded: true }))
    );
    expect(disclosureButtonOpen).toBeTruthy();
    await waitFor(() => container.getAllByText(/action/));
    const rows = container.getAllByText(/action/);
    expect(rows).toBeTruthy();
  });

  it('renders ActionPlan unchanged', () => {
    expect(container).toMatchSnapshot();
  });

  it('renders ActionPlan component and checks for props data', async () => {
    const row = container.queryAllByRole('row');
    const reminder = row.find((row) => within(row).queryByText('action') !== null);
    expect(reminder).toBeTruthy();

    const note = row.find((row) => within(row).queryByText('subject') !== null);
    expect(note).toBeTruthy();
  });

  it('renders ActionPlan component and opens and closes modal', async () => {
    const rows = container.getAllByRole('row');
    const noteRows = rows.filter((row) => within(row).queryByText('subject') !== null);
    expect(noteRows[0]).toBeTruthy();

    // Open modal
    const subjectButton = container.getByRole('button', { name: /^subject/i });
    expect(subjectButton).toBeTruthy();
    await act(() => user.click(subjectButton));

    const modalHeading = container.getByText(/Redigera egen påminnelse/i);
    expect(modalHeading).toBeTruthy();

    // Close modal
    const closeButtons = container.getAllByRole('button', { name: /Avbryt/i });
    expect(closeButtons[0]).toBeTruthy();
    await act(() => user.click(closeButtons[0]));

    const modalHeadingClosed = container.queryByText(/Redigera egen påminnelse/i);
    expect(modalHeadingClosed).toBeNull();
  });

  it('renders ActionPlan component and opens modal to edit and saves as is', async () => {
    // const rows = container.getAllByRole('row');
    // const noteRows = rows.filter((row) => within(row).queryByText('subject') !== null);
    // expect(noteRows[0]).toBeTruthy();

    // Open modal
    const subjectButton = container.getByRole('button', { name: /^subject/ });
    expect(subjectButton).toBeTruthy();
    await act(() => user.click(subjectButton));

    const modalHeading = container.queryByText(/Redigera egen påminnelse/);
    expect(modalHeading).toBeTruthy();

    // Save as is
    const submitButton = container.getByRole('button', { name: /Spara/ });
    await act(() => user.click(submitButton));

    const modalHeadingClosed = container.queryByText(/Redigera egen påminnelse/i);
    expect(modalHeadingClosed).toBeNull();
  });

  it('renders ActionPlan component and deletes reminder', async () => {
    const settingsButtons = container.getAllByRole('button', { name: /Ta bort påminnelse: subject/ });
    expect(settingsButtons[0]).toBeTruthy();
    await act(() => user.click(settingsButtons[0]));

    // const settingsButtonsClosed = container.getAllByRole('button', { name: /Inställningar/i });
    // expect(settingsButtonsClosed[0]).toBeTruthy();
  });
});

import '@jestRoot/__mocks__/services.mock';
import '@jestRoot/__mocks__/context.mock';
import { OngoingCases } from '../ongoing-cases.component';
import { render, waitFor, within } from '@testing-library/react';
import { AppWrapper } from '@contexts/app.context';
import userEvent from '@testing-library/user-event';
import { ongoingCases } from '@jestRoot/__mocks__/data.mock';

describe('OngoingCases', () => {
  let container;
  const user = userEvent.setup({ delay: null });
  jest.useFakeTimers();
  let disclosureButtonOpen;
  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => ({}));
    jest.spyOn(console, 'log').mockImplementation(() => ({}));
    container = render(
      <AppWrapper>
        <OngoingCases ongoing={ongoingCases} />
      </AppWrapper>
    );

    const disclosureButtons = await container.queryAllByRole('button', {
      name: /Pågående ärenden/i,
      expanded: false,
    });
    expect(disclosureButtons).toBeTruthy();
    await user.click(disclosureButtons[0]);
    await waitFor(
      () => (disclosureButtonOpen = container.getByRole('button', { name: /Pågående ärenden/i, expanded: true }))
    );
    expect(disclosureButtonOpen).toBeTruthy();
    await waitFor(() => container.getAllByText(/caseTypeOngoingA/));
    const rows = container.getAllByText(/caseTypeOngoingA/);
    expect(rows).toBeTruthy();
  });

  it('renders OngoingCases with open disclosure unchanged', () => {
    expect(container).toMatchSnapshot();
  });

  it('renders OngoingCases with open disclosure and opens and closes reminder modal', async () => {
    let reminderButtons;
    await waitFor(() => (reminderButtons = container.getAllByRole('button', { name: /Skapa egen påminnelse/i })));
    const reminderButton = reminderButtons[0];
    expect(reminderButton).toBeTruthy();

    // Open modal
    await user.click(reminderButton);
    const modalHeadings = container.getAllByText(/Skapa egen påminnelse/i);
    expect(modalHeadings[0]).toBeTruthy();

    // Assert data in fields
    expect(await container.getByDisplayValue(/caseTypeOngoingB/i)).toBeTruthy();
    expect(await container.getByDisplayValue(/idOngoingB/i)).toBeTruthy();

    // Close modal
    const closeButtons = container.getAllByRole('button', { name: /Avbryt/i });
    expect(closeButtons[0]).toBeTruthy();
    await user.click(closeButtons[0]);

    const modalHeadingOngoing = container.queryByText(/Redigera egen påminnelse/i);
    expect(modalHeadingOngoing).toBeNull();
  });

  it('renders OngoingCases with open disclosure and checks sortHandler', async () => {
    const arendeSortButton = container.getAllByRole('button', { name: /Ärende/ });
    expect(arendeSortButton[0]).toBeTruthy();

    // Renders sorted by Ärende ASC
    const rowASC = container.getAllByRole('row', { name: /caseTypeOngoing/ });
    const reminderASC = within(rowASC[0]).getByText('caseTypeOngoingB');
    expect(reminderASC).toBeTruthy();

    // Click sort (ASC -> DESC)
    await user.click(arendeSortButton[0]);

    const rowDESC = container.getAllByRole('row', { name: /caseTypeOngoing/ });
    const reminderDESC = within(rowDESC[0]).getByText('caseTypeOngoingA');
    expect(reminderDESC).toBeTruthy();
  });
});

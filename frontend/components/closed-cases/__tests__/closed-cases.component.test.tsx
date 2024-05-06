import '@jestRoot/__mocks__/services.mock';
import '@jestRoot/__mocks__/context.mock';
import { ClosedCases } from '../closed-cases.component';
import { render, waitFor, within } from '@testing-library/react';
import { AppWrapper } from '@contexts/app.context';
import userEvent from '@testing-library/user-event';
import { closedCases } from '@jestRoot/__mocks__/data.mock';

describe('ClosedCases', () => {
  let container;
  const user = userEvent.setup();
  let disclosureButtonOpen;
  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => ({}));
    jest.spyOn(console, 'log').mockImplementation(() => ({}));
    container = render(
      <AppWrapper>
        <ClosedCases closed={closedCases} />
      </AppWrapper>
    );

    const disclosureButtons = await container.queryAllByRole('button', {
      name: /Avslutade ärenden/i,
      expanded: false,
    });
    expect(disclosureButtons).toBeTruthy();
    await user.click(disclosureButtons[0]);
    await waitFor(
      () => (disclosureButtonOpen = container.getByRole('button', { name: /Avslutade ärenden/i, expanded: true }))
    );
    expect(disclosureButtonOpen).toBeTruthy();
    await waitFor(() => container.getAllByText(/caseTypeClosedA/));
    const rows = container.getAllByText(/caseTypeClosedA/);
    expect(rows).toBeTruthy();
  });

  it('renders ClosedCases with open disclosure unchanged', () => {
    expect(container).toMatchSnapshot();
  });

  it('renders ClosedCases with open disclosure and opens and closes reminder modal', async () => {
    let reminderButtons;
    await waitFor(() => (reminderButtons = container.getAllByRole('button', { name: /Skapa egen påminnelse/i })));
    const reminderButton = reminderButtons[0];
    expect(reminderButton).toBeTruthy();

    // Open modal
    await user.click(reminderButton);
    const modalHeadings = container.getAllByText(/Skapa egen påminnelse/i);
    expect(modalHeadings[0]).toBeTruthy();

    // Assert data in fields
    expect(await container.getByDisplayValue(/caseTypeClosedB/i)).toBeTruthy();
    expect(await container.getByDisplayValue(/idClosedB/i)).toBeTruthy();

    // Close modal
    const closeButtons = container.getAllByRole('button', { name: /Avbryt/i });
    expect(closeButtons[0]).toBeTruthy();
    await user.click(closeButtons[0]);

    const modalHeadingClosed = container.queryByText(/Redigera egen påminnelse/i);
    expect(modalHeadingClosed).toBeNull();
  });

  it('renders ClosedCases with open disclosure and checks sortHandler', async () => {
    const arendeSortButton = container.getAllByRole('button', { name: /Sortera efter Ärende i stigande ordning/ });
    expect(arendeSortButton[0]).toBeTruthy();

    // Renders sorted by Ärende ASC
    const rowASC = container.getAllByRole('row', { name: /lastStatusChangeClosed/ });
    expect(rowASC[0]).toBeTruthy();
    expect(within(rowASC[0])).toBeTruthy();
    const reminderASC = within(rowASC[0]).getByText('lastStatusChangeClosedB');
    expect(reminderASC).toBeTruthy();

    // Click sort (ASC -> DESC)
    await user.click(arendeSortButton[0]);
    await waitFor(() => container.getAllByRole('button', { name: /Sortera efter Ärende i fallande ordning/ }));

    const rowDESC = container.getAllByRole('row', { name: /lastStatusChangeClosed/ });
    expect(rowDESC[0]).toBeTruthy();
    const reminderDESC = within(rowDESC[0]).getByText('lastStatusChangeClosedA');
    expect(reminderDESC).toBeTruthy();
  });
});

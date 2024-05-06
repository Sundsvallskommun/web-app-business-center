import '@jestRoot/__mocks__/services.mock';
import '@jestRoot/__mocks__/context.mock';
import { FeedbackForm } from '../feedback-form';
import { render, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppWrapper } from '@contexts/app.context';

const handledMockSettingss = {
  id: 'id',
  contacts: [
    {
      alias: 'alias',
      contactMethods: {
        SMS: [
          {
            contactMethod: 'SMS',
            destination: 'destination',
            sendFeedback: true,
            alias: 'alias',
          },
        ],
        EMAIL: [
          {
            contactMethod: 'EMAIL',
            destination: 'destination',
            sendFeedback: false,
            alias: 'alias',
          },
        ],
      },
    },
  ],
};

describe('FeedbackForm', () => {
  const user = userEvent.setup();
  let container;
  jest.setTimeout(10000);
  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => ({})); // act issue
    container = render(
      <AppWrapper
        value={{
          feedbackSettings: handledMockSettingss,
        }}
      >
        <FeedbackForm />
      </AppWrapper>
    );
    await waitFor(() => container.findAllByText(/alias/i), { timeout: 5000 });
  });

  it('renders FeedbackForm and checks for h1', async () => {
    const heading = container.getByRole('heading', { level: 1 });
    expect(heading).toBeTruthy();
  });

  it('renders FeedbackForm and checks close modal button', async () => {
    const newContact = container.getByRole('button', { name: /Lägg till en kontaktperson/i, expanded: false });
    await act(() => user.click(newContact));

    const cancel = container.getByRole('button', { name: /Avbryt/i });
    await act(() => user.click(cancel));

    let newContactClosed;
    await waitFor(
      () =>
        (newContactClosed = container.queryByRole('button', { name: /Lägg till en kontaktperson/i, expanded: false }))
    );
    expect(newContactClosed).toBeTruthy();
  });

  it('renders FeedbackForm and checks new contact validation to be valid', async () => {
    const newContact = container.getByRole('button', { name: /Lägg till en kontaktperson/i, expanded: false });
    await act(() => user.click(newContact));

    // Namn
    const newContactFormNameInput = container.getByLabelText('Namn');
    await act(() => {
      newContactFormNameInput.focus();
      user.keyboard('test');
    });
    await waitFor(() => container.getByDisplayValue('test'));

    // Telefonnummer
    const newNumber = container.getByRole('button', { name: /Lägg till ett telefonnummer/i });
    await act(() => user.click(newNumber));
    await waitFor(() => container.getByLabelText('Telefonnummer'));
    const newContactFormTelefonnummerInput = container.getByLabelText('Telefonnummer');
    await act(() => {
      newContactFormTelefonnummerInput.focus();
      user.keyboard('0709999999');
    });
    await waitFor(() => container.getByDisplayValue('0709999999'));

    // E-Postadress
    const newEmail = container.getByRole('button', { name: /Lägg till en e-post/i });
    await act(() => user.click(newEmail));
    await waitFor(() => container.getByLabelText('E-post'));
    const newContactFormEPostadressInput = container.getByLabelText('E-post');
    await newContactFormEPostadressInput.focus();
    await act(() => {
      newContactFormEPostadressInput.focus();
      user.keyboard('a@b9.com');
    });
    await waitFor(() => container.getByDisplayValue('a@b9.com'));

    await act(() => {
      user.keyboard('{enter}');
    });

    // const saveContact = container.getByRole('button', {name: /^([^\s*]+[Spara])*$/});
    // await act(()=>user.click(saveContact));

    await waitFor(() => container.queryByText('Kontaktnamnet måste vara minst en karaktär lång'));
    expect(container.queryByText('Kontaktnamnet måste vara minst en karaktär lång')).toBeNull();

    await waitFor(() => container.queryByText('Ej giltigt telefonnummer'));
    expect(container.queryByText('Ej giltigt telefonnummer')).toBeNull();

    await waitFor(() => container.queryByText('Ej giltig e-post'));
    expect(container.queryByText('Ej giltig e-post')).toBeNull();
  });

  it('renders FeedbackForm and checks new contact validation to be invalid', async () => {
    const newContact = container.getByRole('button', { name: /Lägg till en kontaktperson/i });
    await act(() => user.click(newContact));

    // Namn
    const newContactFormNameInput = container.getByLabelText('Namn');
    await act(() => {
      newContactFormNameInput.focus();
      user.keyboard('test');
    });
    await waitFor(() => container.getByDisplayValue('test'));

    // Telefonnummer
    const newNumber = container.getByRole('button', { name: /Lägg till ett telefonnummer/i });
    await act(() => user.click(newNumber));
    await waitFor(() => container.getByLabelText('Telefonnummer'));
    const newContactFormTelefonnummerInput = container.getByLabelText('Telefonnummer');
    await act(() => {
      newContactFormTelefonnummerInput.focus();
      user.keyboard('070111111'); // missing one digit
    });
    await waitFor(() => container.getByDisplayValue('070111111'));

    await waitFor(() => container.getByText('Ej giltigt telefonnummer'));
    expect(container.getByText('Ej giltigt telefonnummer')).toBeTruthy();

    // E-Postadress
    const newEmail = container.getByRole('button', { name: /Lägg till en e-post/i });
    await act(() => user.click(newEmail));
    await waitFor(() => container.getByLabelText('E-post'));
    const newContactFormEPostadressInput = container.getByLabelText('E-post');
    await newContactFormEPostadressInput.focus();
    await act(() => {
      newContactFormEPostadressInput.focus();
      user.keyboard('a@'); // missing .[a-z]
    });
    await waitFor(() => container.getByDisplayValue('a@'));

    await act(() => {
      user.keyboard('{enter}');
    });

    await waitFor(() => container.getByText('Ej giltig e-post'));
    expect(container.getByText('Ej giltig e-post')).toBeTruthy();
  });

  it('renders FeedbackForm and turns off SMS globally', async () => {
    const globalSMSRadioInput = container.getByLabelText(/SMS/);
    await act(() => user.click(globalSMSRadioInput));

    const contact = container.getByRole('button', { name: /alias/i });
    expect(contact).toBeTruthy();
    await act(() => user.click(contact));

    const contactSMSRadioInput = container.getByLabelText(/Påminnelser för 0701740605/);
    expect(contactSMSRadioInput.checked == false).toBeTruthy();
  });

  it('renders FeedbackForm and turns off all notifications for contact "alias"', async () => {
    const globalSMSRadioInput = container.getByLabelText(/Påminnelser för alias/);
    await act(() => user.click(globalSMSRadioInput));

    const contact = container.getByRole('button', { name: /alias/i });
    expect(contact).toBeTruthy();
    await act(() => user.click(contact));

    const contactSMSRadioInput = container.getByLabelText(/Påminnelser för 0701740605/);
    expect(contactSMSRadioInput.checked == false).toBeTruthy();
    const contactEMAILRadioInput = container.getByLabelText(/Påminnelser för a@example.com/);
    expect(contactEMAILRadioInput.checked == false).toBeTruthy();
  });

  it('renders FeedbackForm and removes contact method for contact "alias", then removes contact', async () => {
    const globalSMSRadioInput = container.getByLabelText(/SMS/);
    await act(() => user.click(globalSMSRadioInput));

    // open contact
    const contact = container.getByRole('button', { name: /alias/i });
    expect(contact).toBeTruthy();
    await act(() => user.click(contact));

    // remove contact method SMS
    const removeContactMethod = container.getByRole('button', { name: /Ta bort telefonnummer/i });
    expect(removeContactMethod).toBeTruthy();
    await act(() => user.click(removeContactMethod));
    //assert removal of contact method SMS
    const contactSMSRadioInput = container.queryByLabelText(/Påminnelser för 0701740605/);
    expect(contactSMSRadioInput).toBeNull();

    // remove contact
    const removeContact = container.getByRole('button', { name: /Ta bort kontakt/i });
    expect(removeContact).toBeTruthy();
    await act(() => user.click(removeContact));

    const contactRemoved = container.queryByRole('button', { name: /alias/i });
    expect(contactRemoved).toBeNull();
  });
});

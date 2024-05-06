import '@jestRoot/__mocks__/services.mock';
import '@jestRoot/__mocks__/context.mock';
import { render, screen, act, waitFor, within } from '@testing-library/react';
import { AppWrapper } from '@contexts/app.context';
import Kontaktuppgifter from '@pages/kontaktuppgifter';
import userEvent from '@testing-library/user-event';

const useRouter = jest.spyOn(require('next/router'), 'useRouter');
useRouter.mockImplementation(() => ({ route: '/kontaktuppgifter', push: jest.fn() }));

describe('Kontaktuppgifter', () => {
  const user = userEvent.setup();
  let container;
  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    container = await render(
      <AppWrapper>
        <Kontaktuppgifter />
      </AppWrapper>
    );
    const welcomeAccept = container.queryByRole('button', { name: /Till Mina sidor företag/i });
    await act(() => user.click(welcomeAccept));
    const cookiesAccept = container.queryByRole('button', { name: /Godkänn endast nödvändiga/i });
    await act(() => user.click(cookiesAccept));
  });

  it('renders Kontaktuppgifter unchanged', () => {
    expect(container).toMatchSnapshot();
  });

  it('renders Kontaktuppgifter and checks for h1', async () => {
    expect(container.queryAllByRole('heading', { level: 1 })).toBeTruthy();
  });

  it('renders Kontaktuppgifter and checks for main', async () => {
    expect(container.queryByRole('main')).toBeTruthy();
  });
});

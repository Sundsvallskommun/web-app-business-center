import '@jestRoot/__mocks__/services.mock';
import '@jestRoot/__mocks__/context.mock';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AppWrapper } from '@contexts/app.context';
import * as nextRouter from 'next/router';
import Start from '@pages/valj-foretag';
import userEvent from '@testing-library/user-event';

nextRouter.useRouter = jest.fn();
nextRouter.useRouter.mockImplementation(() => ({ route: '/valj-foretag', push: jest.fn() }));

describe('Välj företag', () => {
  const user = userEvent.setup();
  let container;
  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Remove act() error, because this test is not checking for data renders
    jest.spyOn(console, 'log').mockImplementation(() => {});
    container = render(
      <AppWrapper>
        <Start />
      </AppWrapper>
    );
    const welcomeAccept = container.queryByRole('button', { name: /Till Mina sidor företag/i });
    await act(() => user.click(welcomeAccept));
    const cookiesAccept = container.queryByRole('button', { name: /Godkänn endast nödvändiga/i });
    await act(() => user.click(cookiesAccept));
  });

  it('renders Välj företag unchanged', async () => {
    expect(container).toMatchSnapshot();
  });

  it('renders Välj företag and checks for h1', async () => {
    expect(container.queryByRole('heading', { level: 1 })).toBeTruthy();
  });

  it('renders Välj företag and checks for main', async () => {
    expect(container.queryByRole('main')).toBeTruthy();
  });
});

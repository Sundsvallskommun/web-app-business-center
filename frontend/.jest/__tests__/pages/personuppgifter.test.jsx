import '@jestRoot/__mocks__/services.mock';
import '@jestRoot/__mocks__/context.mock';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AppWrapper } from '@contexts/app.context';
import * as nextRouter from 'next/router';
import Personuppgifter from '@pages/personuppgifter';
import userEvent from '@testing-library/user-event';

nextRouter.useRouter = jest.fn();
nextRouter.useRouter.mockImplementation(() => ({ route: '/personuppgifter', push: jest.fn() }));

describe('Personuppgifter', () => {
  const user = userEvent.setup();
  let container;
  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    container = await render(
      <AppWrapper>
        <Personuppgifter />
      </AppWrapper>
    );
    const welcomeAccept = container.queryByRole('button', { name: /Till Mina sidor företag/i });
    await act(() => user.click(welcomeAccept));
    const cookiesAccept = container.queryByRole('button', { name: /Godkänn endast nödvändiga/i });
    await act(() => user.click(cookiesAccept));
  });

  it('renders Personuppgifter unchanged', () => {
    expect(container).toMatchSnapshot();
  });

  it('renders Personuppgifter and checks for h1', async () => {
    expect(container.queryByRole('heading', { level: 1 })).toBeTruthy();
  });

  it('renders Personuppgifter and checks for main', async () => {
    expect(container.queryByRole('main')).toBeTruthy();
  });
});

import '@jestRoot/__mocks__/services.mock';
import '@jestRoot/__mocks__/context.mock';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AppWrapper } from '@contexts/app.context';
import * as nextRouter from 'next/router';
import Tillganglighet from '@pages/tillganglighet';
import userEvent from '@testing-library/user-event';

nextRouter.useRouter = jest.fn();
nextRouter.useRouter.mockImplementation(() => ({
  route: '/tillganglighet',
  push: jest.fn().mockImplementation((x) => Promise.resolve(x)),
}));

describe('Tillganglighet', () => {
  let container;
  const user = userEvent.setup();
  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    container = await render(
      <AppWrapper>
        <Tillganglighet />
      </AppWrapper>
    );
    const welcomeAccept = container.queryByRole('button', { name: /Till Mina sidor företag/i });
    await act(() => user.click(welcomeAccept));
    const cookiesAccept = container.queryByRole('button', { name: /Godkänn endast nödvändiga/i });
    await act(() => user.click(cookiesAccept));
  });

  it('renders Tillganglighet unchanged', () => {
    expect(container).toMatchSnapshot();
  });

  it('renders Tillganglighet and checks for h1', async () => {
    expect(container.queryByRole('heading', { level: 1 })).toBeTruthy();
  });

  it('renders Tillganglighet and checks for main', async () => {
    expect(container.queryByRole('main')).toBeTruthy();
  });
});

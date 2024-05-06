import '@jestRoot/__mocks__/services.mock';
import '@jestRoot/__mocks__/context.mock';
import Foretagsuppgifter from '@pages/foretagsuppgifter';
import { render, screen, act, waitFor, within } from '@testing-library/react';
import { AppWrapper } from '@contexts/app.context';
import userEvent from '@testing-library/user-event';

const useRouter = jest.spyOn(require('next/router'), 'useRouter');
useRouter.mockImplementation(() => ({
  route: '/foretagsuppgifter',
  // query: { tabkey: 'foretagsuppgifter' },
  push: jest.fn(),
}));

describe('Foretagsuppgifter', () => {
  const user = userEvent.setup();
  let container;
  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    container = await render(
      <AppWrapper>
        <Foretagsuppgifter />
      </AppWrapper>
    );
    const welcomeAccept = container.queryByRole('button', { name: /Till Mina sidor företag/i });
    await act(() => user.click(welcomeAccept));
    const cookiesAccept = container.queryByRole('button', { name: /Godkänn endast nödvändiga/i });
    await act(() => user.click(cookiesAccept));
  });

  it('renders Foretagsuppgifter unchanged', () => {
    expect(container).toMatchSnapshot();
  });

  it('renders Foretagsuppgifter and checks for h1', async () => {
    expect(container.queryAllByRole('heading', { level: 1 })).toBeTruthy();
  });

  it('renders Foretagsuppgifter and checks for main', async () => {
    expect(container.queryByRole('main')).toBeTruthy();
  });
});

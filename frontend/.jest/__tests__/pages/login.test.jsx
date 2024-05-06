import '@jestRoot/__mocks__/services.mock';
import '@jestRoot/__mocks__/context.mock';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AppWrapper } from '@contexts/app.context';
import * as nextRouter from 'next/router';
import Login from '@pages/login';

nextRouter.useRouter = jest.fn();
nextRouter.useRouter.mockImplementation(() => ({ route: '/login', push: jest.fn() }));

describe('Login', () => {
  let container;
  beforeEach(async () => {
    container = await render(
      <AppWrapper>
        <Login />
      </AppWrapper>
    );
  });

  it('renders Login unchanged', () => {
    expect(container).toMatchSnapshot();
  });

  it('renders Login and checks for h1', async () => {
    expect(container.queryByRole('heading', { level: 1 })).toBeTruthy();
  });

  it('renders Login and checks for main', async () => {
    expect(container.queryByRole('main')).toBeTruthy();
  });
});

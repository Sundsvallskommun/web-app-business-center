import '@jestRoot/__mocks__/services.mock';
import '@jestRoot/__mocks__/context.mock';
import Logout from '@pages/logout';
import { render } from '@testing-library/react';
import { AppWrapper } from '@contexts/app.context';

const useRouter = jest.spyOn(require('next/router'), 'useRouter');
useRouter.mockImplementation(() => ({
  route: '/logout',
  push: jest.fn(),
}));

describe('Logout', () => {
  let container;
  const mockRouter = {
    push: jest.fn(),
  };
  beforeEach(async () => {
    useRouter.mockReturnValue(mockRouter);
    container = render(
      <AppWrapper>
        <Logout />
      </AppWrapper>
    );
  });

  it('renders Logout and checks if router push was called', () => {
    expect(mockRouter.push).toBeCalledWith('/login');
  });
});

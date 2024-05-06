import '@jestRoot/__mocks__/services.mock';
import '@jestRoot/__mocks__/context.mock';
import Index from '@pages/index';
import { render } from '@testing-library/react';
import { AppWrapper } from '@contexts/app.context';

const useRouter = jest.spyOn(require('next/router'), 'useRouter');
useRouter.mockImplementation(() => ({
  route: '/',
  push: jest.fn(),
}));

describe('Index', () => {
  let container;
  const mockRouter = {
    push: jest.fn(),
  };
  beforeEach(async () => {
    useRouter.mockReturnValue(mockRouter);
    container = render(
      <AppWrapper>
        <Index />
      </AppWrapper>
    );
  });

  it('renders Index and checks if router push was called', () => {
    expect(mockRouter.push).toBeCalledWith('oversikt');
  });
});

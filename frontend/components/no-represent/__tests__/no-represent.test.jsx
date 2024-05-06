import { NoRepresent } from '../no-represent';
import { render, screen } from '@testing-library/react';
import { AppWrapper } from '@contexts/app.context';

describe('NoRepresent', () => {
  beforeEach(async () => {
    // jest.spyOn(console, 'error').mockImplementation(() => {}); // Remove act() error, because this test is not checking for data renders
    render(
      <AppWrapper>
        <NoRepresent />
      </AppWrapper>
    );
  });

  it('renders NoRepresent and checks for h1', async () => {
    expect(await screen.findByRole('heading', { level: 1 })).toBeTruthy();
  });
});

import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { ParkingPermitFileUpload } from './parkingpermit-file-upload.component';

jest.mock('@sk-web-gui/react', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const Container = ({
    children,
    ...props
  }: {
    children?: import('react').ReactNode;
    className?: string;
    role?: string;
  }) => React.createElement('div', props, children);

  return {
    FileUpload: {
      Field: () => React.createElement('input', { type: 'file' }),
      List: Container,
      ListItem: Container,
    },
    FormErrorMessage: Container,
  };
});

describe('ParkingPermitFileUpload', () => {
  it('shows a file-specific server error next to the upload control', () => {
    render(
      <ParkingPermitFileUpload
        category="POLICE_REPORT"
        categoryLabel="Polisanmälan"
        errorMessage="Du kan bifoga högst 10 filer."
        files={[]}
        maxFileSizeMB={25}
        onChange={jest.fn()}
      />
    );

    expect(screen.getByRole('alert').textContent?.trim()).toBe('Du kan bifoga högst 10 filer.');
  });
});

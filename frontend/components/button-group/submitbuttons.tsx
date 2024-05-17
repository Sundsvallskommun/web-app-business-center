import React from 'react';
import { Button, cx } from '@sk-web-gui/react';

export const Submitbuttons: React.FC<{ children?: React.ReactNode | React.ReactNode[] }> = ({ children }) => {
  return (
    <Button.Group
      className={cx(
        'flex flex-col mt-[40px]',
        Array.isArray(children) && 'sm:flex-row sm:grid sm:grid-cols-2 gap-md sm:gap-lg'
      )}
    >
      {children}
    </Button.Group>
  );
};
export default Submitbuttons;

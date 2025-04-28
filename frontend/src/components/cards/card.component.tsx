import { cx } from '@sk-web-gui/react';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className }: CardProps) => {
  return (
    <div
      className={cx(
        `shadow-50 rounded-cards p-30 desktop:p-32 flex flex-col gap-y-40 bg-background-content`,
        className
      )}
    >
      {children}
    </div>
  );
};

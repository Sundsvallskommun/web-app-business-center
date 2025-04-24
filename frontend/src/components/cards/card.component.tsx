import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className }: CardProps) => {
  return (
    <div
      className={`border-1 border-divider rounded-cards p-30 desktop:p-32 flex flex-col desktop:gap-y-40 bg-background-content, ${className}`}
    >
      {children}
    </div>
  );
};

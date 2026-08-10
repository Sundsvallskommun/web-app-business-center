import { cx } from '@sk-web-gui/react';

export const TableWrapper: React.FC<{
  header?: React.ReactNode;
  children: React.ReactNode;
}> = ({ header = '', children }) => {
  return (
    <div className="table-wrapper">
      {header || ''}
      <div className={cx(header && 'mt-md')}>{children}</div>
    </div>
  );
};

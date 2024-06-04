import { cx } from '@sk-web-gui/react';

export const TableWrapper: React.FC<{
  header?;
  children;
}> = ({ header = '', children }) => {
  return (
    <div className="table-wrapper">
      {header && header}
      <div className={cx(header && 'mt-md')}>{children}</div>
    </div>
  );
};

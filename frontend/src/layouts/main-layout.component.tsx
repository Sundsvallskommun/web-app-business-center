import { cx } from '@sk-web-gui/react';
import Main from './main.component';

export default function MainLayout({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cx('main-container', className)}>
      <Main>{children}</Main>
    </div>
  );
}

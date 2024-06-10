import { Logo, cx } from '@sk-web-gui/react';
import { appName } from '../utils/app-name';
import EmptyLayout from './empty-layout.component';

export const EntryLayout: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({
  title,
  children,
  className,
}) => {
  return (
    <EmptyLayout title={`${appName()} - ${title}`}>
      <div className="relative">
        <div className="absolute w-full bg-vattjom-background-200">
          <div className="h-[26.4rem] max-w-[80rem] mx-auto relative overflow-hidden">
            <div className="-mt-[3rem] absolute w-[30.4rem] h-[56rem]">
              <Logo variant="symbol" className="text-vattjom-surface-accent" />
            </div>
          </div>
        </div>
        <div className={cx('relative flex flex-col items-center justify-center py-80 px-40', className)}>
          <Logo variant="logo" className="text-black w-[16.4rem] h-[7.2rem] mb-48" />
          {children}
        </div>
      </div>
    </EmptyLayout>
  );
};

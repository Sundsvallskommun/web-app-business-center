import { Logo, cx } from '@sk-web-gui/react';
import { appName } from '../utils/app-name';
import EmptyLayout from './empty-layout.component';

export const EntryLayout: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
  logoClasses?: string;
}> = ({ title, children, className, logoClasses }) => {
  return (
    <EmptyLayout title={`${appName()} - ${title}`}>
      <div className="relative">
        <div className="absolute w-full bg-vattjom-background-200">
          <div className="h-[26.4rem] max-w-[80rem] mx-auto relative overflow-hidden">
            <div className="hidden lg:block -mt-[4rem] -ml-34 absolute w-[36rem]">
              <Logo variant="symbol" className="text-vattjom-surface-accent" />
            </div>
          </div>
        </div>
        <div
          className={cx('relative flex flex-col items-center justify-center px-20 py-40 lg:py-80 lg:px-40', className)}
        >
          <Logo
            variant="logo"
            className={cx(`text-black w-[16.4rem] h-[5.6rem] lg:h-[7.2rem] mb-32 lg:mb-48`, logoClasses)}
          />
          {children}
        </div>
      </div>
    </EmptyLayout>
  );
};

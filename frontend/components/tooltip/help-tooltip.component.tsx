import { Popover } from '@headlessui/react';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export const HelpTooltip: React.FC<{
  children: React.ReactNode;
  ariaLabel?: string;
  className?: string;
  onlyIcon?: boolean;
}> = ({ children, ariaLabel, className, onlyIcon }) => {
  return (
    <Popover
      className={`mx-sm align-text-bottom relative hidden lg:flex ${className}`}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
    >
      {() => (
        <>
          <Popover.Button className="flex items-center" aria-label={ariaLabel}>
            {!onlyIcon && <strong className="mr-2">Hjälp</strong>}
            <HelpOutlineIcon sx={{ fontSize: 20 }} className="" />
          </Popover.Button>

          <Popover.Panel
            focus={true}
            style={{ width: '90vw' }}
            className="absolute max-w-2xl left-auto right-0 lg:max-w-2xl z-10 rounded-md text-left text-black bg-white p-4 border border-gray-stroke"
          >
            <span className="inline-block">{children}</span>
          </Popover.Panel>
        </>
      )}
    </Popover>
  );
};

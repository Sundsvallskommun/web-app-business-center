import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { AnchorProps } from '@headlessui/react/dist/internal/floating';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Tooltip } from '@sk-web-gui/react';

export const HelpTooltip: React.FC<{
  children: React.ReactNode;
  ariaLabel?: string;
  className?: string;
  onlyIcon?: boolean;
  position?: AnchorProps & React.ComponentPropsWithoutRef<typeof Tooltip>['position'];
}> = ({ children, ariaLabel = 'Hjälptext', className, onlyIcon, position = 'left' }) => {
  return (
    <Popover
      className={`mx-sm align-text-bottom relative hidden lg:flex ${className}`}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
    >
      <PopoverButton className="flex items-center" aria-label={ariaLabel}>
        {!onlyIcon && <strong className="mr-2">Hjälp</strong>}
        <HelpOutlineIcon sx={{ fontSize: 20 }} className="" />
      </PopoverButton>

      <PopoverPanel anchor={position}>
        <Tooltip position={position} className="max-w-[50rem]">
          {children}
        </Tooltip>
      </PopoverPanel>
    </Popover>
  );
};

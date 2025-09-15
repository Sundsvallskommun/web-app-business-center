import { cx } from '@sk-web-gui/react';
import { JSX } from 'react';

type MessageAvatarProps = {
  color?: string;
  logo?: JSX.Element;
};

export function MessageAvatar({ color, logo }: MessageAvatarProps) {
  return (
    <div className={cx('sk-avatar sk-avatar-sm')} data-color={color} data-accent data-rounded>
      {logo}
    </div>
  );
}

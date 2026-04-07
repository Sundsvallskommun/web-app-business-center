import { useCallback, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useLocalStorageValue } from '@react-hookz/web';
import { Button, Icon, cx } from '@sk-web-gui/react';

export const AlertBanner: React.FC = () => {
  const message = process.env.NEXT_PUBLIC_ALERT_BANNER_MESSAGE;
  const severity = process.env.NEXT_PUBLIC_ALERT_BANNER_SEVERITY;
  const { value: ignoredAlert, set: setIgnoredAlert } = useLocalStorageValue('ignoredAlert');
  const _visible = !!message && message !== ignoredAlert;
  const [visible, setVisible] = useState(_visible);

  const onClose = useCallback(() => {
    setIgnoredAlert(message);
    setVisible(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, setVisible]);

  const bgColor = severity === 'warning' ? 'bg-warning-surface-accent' : 'bg-vattjom-surface-accent';

  const iconColor = severity === 'warning' ? 'warning' : 'vattjom';

  return visible ? (
    <div className={cx('w-full text-primary', bgColor)}>
      <div className="flex py-16 container w-full m-auto">
        <Icon icon={<AlertCircle />} className="flex-none" color={iconColor} />
        <span className="px-16 flex flex-grow">{message}</span>
        <Button aria-label="Stäng störningsmeddelande" variant="link" iconButton onClick={onClose}>
          <Icon icon={<X />} className="text-primary" />
        </Button>
      </div>
    </div>
  ) : undefined;
};

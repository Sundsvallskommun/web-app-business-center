'use client';

import { ProgressBar } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';

interface TimeLeftProps {
  time: number;
  maxTime: number;
}

export const TimeLeft: React.FC<TimeLeftProps> = ({ time, maxTime }) => {
  const { t } = useTranslation();

  const handleSeconds = () => (time > 5 ? Math.ceil(time / 10) * 10 : time);

  const readableTimeLeft =
    time / 60 > 0.5
      ? t('common:minutes', { count: Math.ceil(time / 60) })
      : t('common:seconds', { count: handleSeconds() });

  return (
    <div className="flex flex-col gap-4 text-small justify-center text-center">
      <ProgressBar steps={maxTime} current={time} color={time / maxTime < 0.25 ? 'bjornstigen' : 'gronsta'} />
      <span role="log">
        {readableTimeLeft} {t('common:left')}
      </span>
    </div>
  );
};

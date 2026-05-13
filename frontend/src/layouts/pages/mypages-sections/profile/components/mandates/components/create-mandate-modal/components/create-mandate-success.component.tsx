import CountdownTimer from '@components/countdown/countdown-timer.component';
import { useApi } from '@services/api-service';
import { Button, Icon, Modal } from '@sk-web-gui/react';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CreateMandateSuccessProps {
  onClose: () => void;
}

export const CreateMandateSuccess: React.FC<CreateMandateSuccessProps> = ({ onClose }) => {
  const { refetch } = useApi({ url: '/mandates/org', method: 'get' });
  const { t } = useTranslation();
  const [time, setTime] = useState<number>(10);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (time === 0) {
      onClose();
    }
  }, [time, onClose]);

  return (
    <>
      <CountdownTimer className="sr-only" timeout={10000} onChangeTime={(ms) => setTime(Math.ceil(ms / 1000))} />
      <Modal.Content className="flex flex-col gap-32 pb-32 grow">
        <header className="w-full flex flex-col gap-16 items-center text-center my-24">
          <Icon.Padded color="gronsta" rounded icon={<Check />} size="6rem" />
          <h2 className="text-h2-md">{t('profile:mandates.success.save')}</h2>
        </header>
        <p>
          {t('profile:autoclose')} {t('common:seconds', { count: time })}
        </p>
      </Modal.Content>
      <Modal.Footer>
        <Button color="primary" className="w-full md:auto" onClick={onClose}>
          {t('common:ok')}
        </Button>
      </Modal.Footer>
    </>
  );
};

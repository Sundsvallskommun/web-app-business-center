import { Button, Icon, Modal } from '@sk-web-gui/react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BankIdFailProps {
  onClose: () => void;
  onRetry: () => void;
  hintCode?: string | null;
}

export const BankIdFail: React.FC<BankIdFailProps> = ({ onClose, onRetry, hintCode }) => {
  const { t } = useTranslation();

  return (
    <>
      <Modal.Content className="w-full flex flex-col items-center h-full grow">
        <header className="w-full flex flex-col gap-16 items-center text-center">
          <Icon.Padded color="error" rounded icon={<X />} size="6rem" />
          <h1 className="text-h2-md text-error">{t('bankid:failed')}</h1>
          <p>{t(`bankid:errors.hintCode.${hintCode}`, { defaultValue: t('bankid:error') })}</p>
        </header>
      </Modal.Content>
      <Modal.Footer className="flex flex-col md:flex-row gap-16 justify-start">
        <Button className="md:grow-0 md:w-fit" variant="secondary" onClick={onClose}>
          {t('bankid:cancel')}
        </Button>
        <Button data-cy="bankid-fail-retry-button" className="md:grow-0 md:w-fit" variant="primary" onClick={onRetry}>
          {t('bankid:retry')}
        </Button>
      </Modal.Footer>
    </>
  );
};

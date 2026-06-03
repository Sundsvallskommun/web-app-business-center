import { Button, Icon, Modal } from '@sk-web-gui/react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CreateMandateFailProps {
  onClose: () => void;
  code: number;
}

export const CreateMandateFail: React.FC<CreateMandateFailProps> = ({ onClose, code }) => {
  const { t } = useTranslation();

  return (
    <>
      <Modal.Content className="flex flex-col gap-32 pb-32 grow">
        <header className="w-full flex flex-col gap-16 items-center text-center my-24">
          <Icon.Padded color="error" rounded icon={<X />} size="6rem" />
          <h2 className="text-h2-md text-error">{t('profile:mandates.errors.save')}</h2>
        </header>
        <p>{t(`profile:mandates.errors.${code}`, { defaultValue: t('profile:mandates.errors.500') })}</p>
      </Modal.Content>
      <Modal.Footer>
        <Button color="primary" className="w-full md:auto" onClick={onClose}>
          {t('common:close')}
        </Button>
      </Modal.Footer>
    </>
  );
};

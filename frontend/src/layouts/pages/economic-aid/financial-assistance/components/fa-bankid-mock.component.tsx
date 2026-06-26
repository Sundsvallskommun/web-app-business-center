import { Button, Modal, Spinner } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';

interface FaBankidMockProps {
  show: boolean;
  label: string;
  description: string;
  confirmLabel: string;
  confirmLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * MOCK av BankID-signering. Visar en spinner och en knapp för att "slutföra" signeringen.
 * Ersätts senare med den riktiga bankid-sign-komponenten.
 */
export const FaBankidMock: React.FC<FaBankidMockProps> = ({
  show,
  label,
  description,
  confirmLabel,
  confirmLoading,
  onConfirm,
  onClose,
}) => {
  const { t } = useTranslation('financial-assistance');

  return (
    <Modal show={show} onClose={onClose} label={label} data-cy="fa-bankid-mock">
      <Modal.Content className="flex flex-col items-center gap-24 py-24 text-center">
        <Spinner size={4} color="vattjom" />
        <p className="text-content">{description}</p>
      </Modal.Content>
      <Modal.Footer className="flex flex-col md:flex-row">
        <Button variant="secondary" onClick={onClose}>
          {t('financial-assistance:bankid.cancel')}
        </Button>
        <Button color="vattjom" onClick={onConfirm} loading={confirmLoading} data-cy="fa-bankid-mock-confirm">
          {confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

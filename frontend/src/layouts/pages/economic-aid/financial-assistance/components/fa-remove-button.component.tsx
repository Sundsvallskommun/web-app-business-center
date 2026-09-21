import { Button, Icon } from '@sk-web-gui/react';
import { Trash } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FaRemoveButtonProps {
  onRemove: () => void;
  /** Egen etikett — annars "Ta bort". */
  label?: string;
  dataCy?: string;
  className?: string;
}

/**
 * "Ta bort"-knappen för en tillagd rad eller ett kort i ansökan (inkomst, kostnad, tillgång,
 * ersättning, barn, planeringsrad). En enda komponent så att knappen ser likadan ut överallt.
 */
export const FaRemoveButton: React.FC<FaRemoveButtonProps> = ({ onRemove, label, dataCy, className }) => {
  const { t } = useTranslation('financial-assistance');
  return (
    <Button
      variant="secondary"
      size="sm"
      className={className}
      data-cy={dataCy}
      onClick={onRemove}
      leftIcon={<Icon icon={<Trash />} />}
    >
      {label ?? t('financial-assistance:economy.remove')}
    </Button>
  );
};

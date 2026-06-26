import { useTranslation } from 'react-i18next';
import { StepNavigation } from '../../components/step-navigation.component';
import { FaStepProps } from './fa-step-registry';

/** Renders for wizard groups not yet implemented (milestones M2–M4). */
export const StepPlaceholder: React.FC<FaStepProps> = ({ label, onBack, onNext }) => {
  const { t } = useTranslation('financial-assistance');

  return (
    <section className="flex flex-col gap-24" data-cy="fa-step-placeholder">
      <header className="text-content">
        <h2>{label}</h2>
      </header>
      <p className="text-content">{t('financial-assistance:placeholder.body')}</p>
      <StepNavigation onBack={onBack} onNext={onNext} />
    </section>
  );
};

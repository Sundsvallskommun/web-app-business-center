import { FinancialAssistanceFormData } from '@interfaces/financial-assistance';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StepNavigation } from '../../components/step-navigation.component';
import { FaReviewSummary } from '../components/fa-review-summary.component';
import { FaStepProps } from './fa-step-registry';

/** Sista gruppen — summering och skicka in. Vistelse + försäkran ligger på utbetalningssteget. */
export const StepReview: React.FC<FaStepProps> = ({ applicationType, onBack, isSubmitting }) => {
  const { t } = useTranslation('financial-assistance');
  const { watch } = useFormContext<FinancialAssistanceFormData>();

  const attestation = watch('attestation');

  return (
    <section className="flex flex-col gap-24" data-cy="fa-step-review">
      <header className="text-content">
        <h2>{t('financial-assistance:review.heading')}</h2>
        <p>{t('financial-assistance:review.summaryHeading')}</p>
      </header>

      <FaReviewSummary applicationType={applicationType} />

      <StepNavigation
        onBack={onBack}
        isSubmit
        forwardLabel={t('financial-assistance:review.submit')}
        forwardDisabled={!attestation}
        forwardLoading={isSubmitting}
      />
    </section>
  );
};

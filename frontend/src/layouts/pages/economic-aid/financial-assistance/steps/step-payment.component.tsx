import { FinancialAssistanceFormData } from '@interfaces/financial-assistance';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StepNavigation } from '../../components/step-navigation.component';
import { FaPersonPaymentCard } from '../components/fa-person-payment-card.component';
import { FaStepProps } from './fa-step-registry';

/** Grupp 5 — utbetalning (alla typer). Ett kort per person (sökande + ev. medsökande). */
export const StepPayment: React.FC<FaStepProps> = ({ applicationType, onBack, onNext }) => {
  const { t } = useTranslation('financial-assistance');
  const { control } = useFormContext<FinancialAssistanceFormData>();

  // persons is fixed (applicant + optional co-applicant) — useFieldArray only for stable keys.
  const { fields } = useFieldArray({ control, name: 'persons' });

  return (
    <section className="flex flex-col gap-24" data-cy="fa-step-payment">
      <header className="text-content">
        <h2>{t('financial-assistance:payment.heading')}</h2>
        <p>{t('financial-assistance:payment.ingress')}</p>
      </header>

      {fields.map((field, index) => (
        <FaPersonPaymentCard
          key={field.id}
          index={index}
          role={field.role}
          applicationType={applicationType}
        />
      ))}

      <StepNavigation onBack={onBack} onNext={onNext} />
    </section>
  );
};

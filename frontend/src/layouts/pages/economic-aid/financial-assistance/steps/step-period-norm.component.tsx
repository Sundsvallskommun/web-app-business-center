import { FinancialAssistanceFormData, NormType, PeriodChoice } from '@interfaces/financial-assistance';
import { FormControl, FormLabel, RadioButton, Textarea } from '@sk-web-gui/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StepNavigation } from '../../components/step-navigation.component';
import { FaStepProps } from './fa-step-registry';

const PERIOD_CHOICES: PeriodChoice[] = ['CURRENT_MONTH', 'NEXT_MONTH', 'OTHER_BENEFIT'];
const NORM_TYPES: NormType[] = ['RIKSNORM', 'OTHER_NORM'];

/** Grupp 1 — period & norm. maritalStatus kommer från portalen (skrivskyddad). */
export const StepPeriodNorm: React.FC<FaStepProps> = ({ applicationType, onBack, onNext }) => {
  const { t } = useTranslation('financial-assistance');
  const { watch, setValue } = useFormContext<FinancialAssistanceFormData>();

  const maritalStatus = watch('maritalStatus');
  const periodChoice = watch('periodChoice');
  const normType = watch('normType');
  const periodMonth = watch('periodMonth');
  const periodYear = watch('periodYear');

  const isNew = applicationType === 'NEW';
  const periodMissing = isNew && !periodChoice;
  const forwardDisabled = !normType || periodMissing;

  return (
    <section className="flex flex-col gap-24" data-cy="fa-step-period-norm">
      <header className="text-content">
        <h2>{t('financial-assistance:periodNorm.heading')}</h2>
      </header>

      {/* Civilstånd — från portalen, skrivskyddat */}
      <div className="text-content">
        <p className="font-bold">{t('financial-assistance:periodNorm.maritalStatusLabel')}</p>
        <p>{t(`financial-assistance:maritalStatus.${maritalStatus}`)}</p>
      </div>

      {/* Period */}
      {isNew ? (
        <FormControl data-cy="fa-period-choice">
          <FormLabel className="font-bold">{t('financial-assistance:periodNorm.periodChoiceLabel')}</FormLabel>
          <RadioButton.Group>
            {PERIOD_CHOICES.map((choice) => (
              <RadioButton
                key={choice}
                size="sm"
                name="fa-period-choice"
                id={`fa-period-choice-${choice}`}
                data-cy={`fa-period-choice-${choice}`}
                checked={periodChoice === choice}
                onChange={() => {}}
                onClick={() => setValue('periodChoice', choice, { shouldDirty: true })}
              >
                {t(`financial-assistance:periodChoice.${choice}`)}
              </RadioButton>
            ))}
          </RadioButton.Group>
          {periodChoice === 'OTHER_BENEFIT' ? (
            <Textarea
              className="w-full min-h-72 mt-12"
              data-cy="fa-other-benefit"
              placeholder={t('financial-assistance:periodNorm.otherBenefitPlaceholder')}
              value={watch('otherBenefitDescription')}
              onChange={(event) =>
                setValue('otherBenefitDescription', event.target.value, { shouldDirty: true })
              }
            />
          ) : null}
        </FormControl>
      ) : (
        <div className="text-content">
          <p className="font-bold">{t('financial-assistance:periodNorm.periodLabel')}</p>
          <p>
            {periodMonth && periodYear
              ? t('financial-assistance:periodNorm.periodValue', { month: periodMonth, year: periodYear })
              : '—'}
          </p>
        </div>
      )}

      {/* Norm */}
      <FormControl data-cy="fa-norm-type">
        <FormLabel className="font-bold">{t('financial-assistance:periodNorm.normTypeLabel')}</FormLabel>
        <RadioButton.Group>
          {NORM_TYPES.map((type) => (
            <RadioButton
              key={type}
              size="sm"
              name="fa-norm-type"
              id={`fa-norm-type-${type}`}
              data-cy={`fa-norm-type-${type}`}
              checked={normType === type}
              onChange={() => {}}
              onClick={() => setValue('normType', type, { shouldDirty: true })}
            >
              {t(`financial-assistance:normType.${type}`)}
            </RadioButton>
          ))}
        </RadioButton.Group>
      </FormControl>

      <StepNavigation onBack={onBack} onNext={onNext} forwardDisabled={forwardDisabled} />
    </section>
  );
};

import { FinancialAssistanceFormData } from '@interfaces/financial-assistance';
import { Checkbox, Divider, FormControl, FormLabel, RadioButton, Textarea } from '@sk-web-gui/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StepNavigation } from '../../components/step-navigation.component';
import { FaReviewSummary } from '../components/fa-review-summary.component';
import { FaStepProps } from './fa-step-registry';

/** Sista gruppen — vistelse (ej tilläggsansökan), heder & samvete, skicka in. */
export const StepReview: React.FC<FaStepProps> = ({ applicationType, onBack, isSubmitting }) => {
  const { t } = useTranslation('financial-assistance');
  const { register, watch, setValue } = useFormContext<FinancialAssistanceFormData>();

  const attestation = watch('attestation');
  const stays = watch('staysInMunicipality');
  const showStay = applicationType !== 'SUPPLEMENTARY';

  return (
    <section className="flex flex-col gap-24" data-cy="fa-step-review">
      <header className="text-content">
        <h2>{t('financial-assistance:review.heading')}</h2>
        <p>{t('financial-assistance:review.summaryHeading')}</p>
      </header>

      <FaReviewSummary applicationType={applicationType} />

      <Divider />

      {showStay && (
        <FormControl data-cy="fa-stays">
          <FormLabel className="font-bold">{t('financial-assistance:review.staysLabel')}</FormLabel>
          <RadioButton.Group inline>
            <RadioButton
              size="sm"
              className="mr-sm"
              name="fa-stays"
              id="fa-stays-yes"
              data-cy="fa-stays-yes"
              checked={stays === true}
              onChange={() => {}}
              onClick={() => setValue('staysInMunicipality', true, { shouldDirty: true })}
            >
              {t('financial-assistance:common.yes')}
            </RadioButton>
            <RadioButton
              size="sm"
              className="mr-sm"
              name="fa-stays"
              id="fa-stays-no"
              data-cy="fa-stays-no"
              checked={stays === false}
              onChange={() => {}}
              onClick={() => setValue('staysInMunicipality', false, { shouldDirty: true })}
            >
              {t('financial-assistance:common.no')}
            </RadioButton>
          </RadioButton.Group>
          {stays === false ? (
            <Textarea
              className="w-full min-h-72 mt-12"
              data-cy="fa-stay-description"
              placeholder={t('financial-assistance:review.stayDescriptionPlaceholder')}
              value={watch('stayDescription')}
              onChange={(event) => setValue('stayDescription', event.target.value, { shouldDirty: true })}
            />
          ) : null}
        </FormControl>
      )}

      <FormControl>
        <Checkbox data-cy="fa-attestation" {...register('attestation', { required: true })}>
          {t('financial-assistance:review.attestation')}
        </Checkbox>
      </FormControl>

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

import { FinancialAssistanceFormData } from '@interfaces/financial-assistance';
import { Checkbox, Divider, FormControl, FormLabel, RadioButton, Textarea } from '@sk-web-gui/react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StepNavigation } from '../../components/step-navigation.component';
import { FaAttachments } from '../components/fa-attachments.component';
import { FaPersonPaymentCard } from '../components/fa-person-payment-card.component';
import { FaStepProps } from './fa-step-registry';

/** Grupp 5 — utbetalning (alla typer), vistelse och försäkran (heder & samvete). */
export const StepPayment: React.FC<FaStepProps> = ({ applicationType, onBack, onNext }) => {
  const { t } = useTranslation('financial-assistance');
  const { control, register, watch, setValue } = useFormContext<FinancialAssistanceFormData>();

  // persons is fixed (applicant + optional co-applicant) — useFieldArray only for stable keys.
  const { fields } = useFieldArray({ control, name: 'persons' });
  const isCohabiting = watch('maritalStatus') === 'COHABITING';
  const stays = watch('staysInMunicipality');
  const attestation = watch('attestation');
  const showStay = applicationType !== 'SUPPLEMENTARY';
  const attestationInfo = t('financial-assistance:review.attestationInfo', { returnObjects: true }) as string[];

  return (
    <section className="flex flex-col gap-24" data-cy="fa-step-payment">
      <header className="text-content flex flex-col gap-8">
        <h2>{t('financial-assistance:payment.heading')}</h2>
        <p className="font-bold">
          {t('financial-assistance:payment.payoutQuestion', isCohabiting ? { context: 'ni' } : undefined)}
        </p>
        {isCohabiting ? (
          <p className="text-small text-dark-secondary">{t('financial-assistance:payment.payoutInfoCohabiting')}</p>
        ) : null}
      </header>

      {fields.map((field, index) => (
        <FaPersonPaymentCard key={field.id} index={index} role={field.role} applicationType={applicationType} />
      ))}

      <Divider />

      {/* Bilagor — före vistelse. */}
      <FaAttachments applicationType={applicationType} />

      {/* Vistelse under ansökningsmånaden — flyttad hit från granska-steget. */}
      {showStay ? (
        <>
          <Divider />
          <FormControl data-cy="fa-stays" className="w-full">
            <FormLabel className="text-h4-md font-bold">{t('financial-assistance:review.staysHeading')}</FormLabel>
            <p className="font-bold mb-8">
              {t('financial-assistance:review.staysInfo', isCohabiting ? { context: 'ni' } : undefined)}
            </p>
            <RadioButton.Group inline>
              <RadioButton
                size="sm"
                className="mr-sm"
                name="fa-stays"
                id="fa-stays-yes"
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
        </>
      ) : null}

      <Divider />

      {/* Försäkran (heder & samvete) — före granska-steget. */}
      <section className="flex flex-col gap-16 text-content" data-cy="fa-attestation-section">
        <h3 className="text-h4-md font-bold">{t('financial-assistance:review.attestationHeading')}</h3>
        <div className="flex flex-col gap-8">
          {attestationInfo.map((paragraph) => (
            <p key={paragraph} className="text-small text-dark-secondary">
              {paragraph}
            </p>
          ))}
        </div>
        <FormControl>
          <Checkbox data-cy="fa-attestation" {...register('attestation', { required: true })}>
            {t('financial-assistance:review.attestation')}
          </Checkbox>
        </FormControl>
      </section>

      {/* Meddelandefunktion — uppmana till komplettering via Mina sidor. */}
      <p role="note" className="bg-vattjom-background-200 rounded-button px-14 py-12 text-content" data-cy="fa-message-info">
        {t('financial-assistance:review.messageInfo')}
      </p>

      <StepNavigation onBack={onBack} onNext={onNext} forwardDisabled={!attestation} />
    </section>
  );
};

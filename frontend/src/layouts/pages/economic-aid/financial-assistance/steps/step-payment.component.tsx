import { FinancialAssistanceFormData } from '@interfaces/financial-assistance';
import { Checkbox, Divider, FormControl, FormLabel, RadioButton, Textarea } from '@sk-web-gui/react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StepNavigation } from '../../components/step-navigation.component';
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

  return (
    <section className="flex flex-col gap-24" data-cy="fa-step-payment">
      <header className="text-content">
        <h2>{t('financial-assistance:payment.heading')}</h2>
        <p>{isCohabiting ? t('financial-assistance:payment.ingressCohabiting') : t('financial-assistance:payment.ingress')}</p>
      </header>

      {fields.map((field, index) => (
        <FaPersonPaymentCard key={field.id} index={index} role={field.role} applicationType={applicationType} />
      ))}

      {/* Vistelse under ansökningsmånaden — flyttad hit från granska-steget. */}
      {showStay ? (
        <>
          <Divider />
          <FormControl data-cy="fa-stays">
            <FormLabel className="font-bold">{t('financial-assistance:review.staysLabel')}</FormLabel>
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
        <p className="text-small text-dark-secondary">{t('financial-assistance:review.attestationInfo')}</p>
        <FormControl>
          <Checkbox data-cy="fa-attestation" {...register('attestation', { required: true })}>
            {t('financial-assistance:review.attestation')}
          </Checkbox>
        </FormControl>
      </section>

      <StepNavigation onBack={onBack} onNext={onNext} forwardDisabled={!attestation} />
    </section>
  );
};

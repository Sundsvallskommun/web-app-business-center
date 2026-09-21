import { FA_FIELD_MAX_LENGTH, FinancialAssistanceFormData } from '@interfaces/financial-assistance';
import { Card, FormControl, FormLabel, Input } from '@sk-web-gui/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FaRemoveButton } from './fa-remove-button.component';

interface FaPendingBenefitCardProps {
  index: number;
  onRemove: () => void;
}

/** One benefit awaiting decision (errand_fa_pending_benefit). */
export const FaPendingBenefitCard: React.FC<FaPendingBenefitCardProps> = ({ index, onRemove }) => {
  const { t } = useTranslation('financial-assistance');
  const { register } = useFormContext<FinancialAssistanceFormData>();

  return (
    <Card data-cy={`fa-pending-benefit-${index}`} className="flex flex-col gap-16 p-24">
      <h4 className="text-h5-md font-bold">
        {t('financial-assistance:economy.pendingBenefit.heading', { number: index + 1 })}
      </h4>

      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-16">
        <FormControl className="w-full">
          <FormLabel htmlFor={`fa-pending-benefit-${index}-name`}>
            {t('financial-assistance:economy.pendingBenefit.benefitNameLabel')}
          </FormLabel>
          <Input
            id={`fa-pending-benefit-${index}-name`}
            maxLength={FA_FIELD_MAX_LENGTH.pendingBenefitText}
            {...register(`pendingBenefits.${index}.benefitName` as const)}
          />
        </FormControl>

        <FormControl className="w-full">
          <FormLabel htmlFor={`fa-pending-benefit-${index}-applicant`}>
            {t('financial-assistance:economy.pendingBenefit.applicantNameLabel')}
          </FormLabel>
          <Input
            id={`fa-pending-benefit-${index}-applicant`}
            maxLength={FA_FIELD_MAX_LENGTH.pendingBenefitText}
            {...register(`pendingBenefits.${index}.applicantName` as const)}
          />
        </FormControl>
      </div>

      {/* "Ta bort" nere till höger, samma knapp som på inkomstraderna. */}
      <div className="flex justify-end">
        <FaRemoveButton dataCy={`fa-pending-benefit-${index}-remove`} onRemove={onRemove} />
      </div>
    </Card>
  );
};

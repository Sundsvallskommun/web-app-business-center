import { FinancialAssistanceFormData } from '@interfaces/financial-assistance';
import { Button, Card, FormControl, FormLabel, Icon, Input } from '@sk-web-gui/react';
import { X } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

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
      <header className="flex items-center justify-between gap-8">
        <h4 className="text-h5-md font-bold">
          {t('financial-assistance:economy.pendingBenefit.heading', { number: index + 1 })}
        </h4>
        <Button
          variant="link"
          size="sm"
          color="error"
          data-cy={`fa-pending-benefit-${index}-remove`}
          onClick={onRemove}
          leftIcon={<Icon icon={<X />} />}
        >
          {t('financial-assistance:economy.remove')}
        </Button>
      </header>

      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-16">
        <FormControl className="w-full">
          <FormLabel htmlFor={`fa-pending-benefit-${index}-name`}>
            {t('financial-assistance:economy.pendingBenefit.benefitNameLabel')}
          </FormLabel>
          <Input id={`fa-pending-benefit-${index}-name`} {...register(`pendingBenefits.${index}.benefitName` as const)} />
        </FormControl>

        <FormControl className="w-full">
          <FormLabel htmlFor={`fa-pending-benefit-${index}-applicant`}>
            {t('financial-assistance:economy.pendingBenefit.applicantNameLabel')}
          </FormLabel>
          <Input
            id={`fa-pending-benefit-${index}-applicant`}
            {...register(`pendingBenefits.${index}.applicantName` as const)}
          />
        </FormControl>
      </div>
    </Card>
  );
};

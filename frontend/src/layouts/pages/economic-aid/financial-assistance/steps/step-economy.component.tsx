import { FinancialAssistanceFormData, NormType, emptyCost } from '@interfaces/financial-assistance';
import { Button, FormControl, FormLabel, Icon, RadioButton } from '@sk-web-gui/react';
import { Plus } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StepNavigation } from '../../components/step-navigation.component';
import { FaCostCard } from '../components/fa-cost-card.component';
import { FaStepProps } from './fa-step-registry';

const NORM_TYPES: NormType[] = ['RIKSNORM', 'OTHER_NORM'];

/** Grupp 2 — ekonomi. Norm överst, därefter kostnader (alla ansökningstyper). */
export const StepEconomy: React.FC<FaStepProps> = ({ applicationType, onBack, onNext }) => {
  const { t } = useTranslation('financial-assistance');
  const { control, watch, setValue } = useFormContext<FinancialAssistanceFormData>();

  const isSupplementary = applicationType === 'SUPPLEMENTARY';
  const normType = watch('normType');
  const costs = useFieldArray({ control, name: 'costs' });

  return (
    <section className="flex flex-col gap-32" data-cy="fa-step-economy">
      <header className="text-content">
        <h2>{t('financial-assistance:economy.heading')}</h2>
      </header>

      {/* Norm — överst, med infotext per alternativ */}
      <FormControl data-cy="fa-norm-type">
        <FormLabel className="font-bold">{t('financial-assistance:periodNorm.normTypeLabel')}</FormLabel>
        <div className="flex flex-col gap-12">
          {NORM_TYPES.map((type) => (
            <div key={type} className="flex flex-col">
              <RadioButton
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
              <span className="text-small text-dark-secondary ml-32">{t(`financial-assistance:normInfo.${type}`)}</span>
            </div>
          ))}
        </div>
      </FormControl>

      {/* Kostnader */}
      <section className="flex flex-col gap-16" data-cy="fa-costs">
        <h3 className="text-h4-md font-bold">{t('financial-assistance:economy.costsHeading')}</h3>
        <p className="text-small text-dark-secondary">{t('financial-assistance:economy.costsInfo')}</p>
        {costs.fields.map((field, index) => (
          <FaCostCard
            key={field.id}
            index={index}
            showRecipientOrPeriod={isSupplementary}
            onRemove={() => costs.remove(index)}
          />
        ))}
        <div>
          <Button
            variant="link"
            size="sm"
            data-cy="fa-cost-add"
            onClick={() => costs.append(emptyCost())}
            leftIcon={<Icon icon={<Plus />} />}
          >
            {t('financial-assistance:economy.addCost')}
          </Button>
        </div>
      </section>

      <StepNavigation onBack={onBack} onNext={onNext} />
    </section>
  );
};

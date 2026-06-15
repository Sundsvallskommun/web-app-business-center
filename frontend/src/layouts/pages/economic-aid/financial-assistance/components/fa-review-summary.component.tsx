import { ApplicationType, FinancialAssistanceFormData } from '@interfaces/financial-assistance';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface FaReviewSummaryProps {
  applicationType: ApplicationType;
}

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex flex-col">
      <dt className="text-small text-dark-secondary">{label}</dt>
      <dd className="font-bold">{value}</dd>
    </div>
  );
};

const SummarySection: React.FC<{ heading: string; children: React.ReactNode }> = ({ heading, children }) => (
  <section className="flex flex-col gap-12">
    <h3 className="text-h5-md font-bold">{heading}</h3>
    <dl className="grid grid-cols-1 desktop:grid-cols-2 gap-12">{children}</dl>
  </section>
);

/** Read-only recap of the entered application, gated per applicationType, shown before submit. */
export const FaReviewSummary: React.FC<FaReviewSummaryProps> = ({ applicationType }) => {
  const { t } = useTranslation('financial-assistance');
  const { watch } = useFormContext<FinancialAssistanceFormData>();
  const values = watch();

  const isSupplementary = applicationType === 'SUPPLEMENTARY';
  const yesNo = (value: boolean | null): string | undefined =>
    value === null ? undefined : t(`financial-assistance:common.${value ? 'yes' : 'no'}`);
  const amount = (value: number | null): string | undefined => (value == null ? undefined : `${value} kr`);

  const period =
    values.periodMonth && values.periodYear
      ? t('financial-assistance:periodNorm.periodValue', { month: values.periodMonth, year: values.periodYear })
      : values.periodChoice
        ? t(`financial-assistance:periodChoice.${values.periodChoice}`)
        : undefined;

  return (
    <div className="flex flex-col gap-24 text-content">
      <SummarySection heading={t('financial-assistance:groups.period-norm')}>
        <Row
          label={t('financial-assistance:periodNorm.maritalStatusLabel')}
          value={t(`financial-assistance:maritalStatus.${values.maritalStatus}`)}
        />
        <Row label={t('financial-assistance:periodNorm.periodLabel')} value={period} />
        <Row
          label={t('financial-assistance:periodNorm.normTypeLabel')}
          value={values.normType ? t(`financial-assistance:normType.${values.normType}`) : undefined}
        />
        <Row label={t('financial-assistance:periodNorm.otherBenefitPlaceholder')} value={values.otherBenefitDescription} />
      </SummarySection>

      {!isSupplementary ? (
        <SummarySection heading={t('financial-assistance:groups.household-housing')}>
          <Row label={t('financial-assistance:householdHousing.hasChildrenLabel')} value={yesNo(values.hasChildrenUnder21)} />
          {values.children.map((child, index) => (
            <Row
              key={`child-${index}`}
              label={t('financial-assistance:child.heading', { number: index + 1 })}
              value={[child.firstName, child.lastName, child.personalNumber].filter(Boolean).join(' ')}
            />
          ))}
          <Row
            label={t('financial-assistance:householdHousing.housingFormLabel')}
            value={values.housingForm ? t(`financial-assistance:housingForm.${values.housingForm}`) : undefined}
          />
        </SummarySection>
      ) : null}

      <SummarySection heading={t('financial-assistance:economy.costsHeading')}>
        {values.costs.map((cost, index) => (
          <Row
            key={`cost-${index}`}
            label={cost.costType ? t(`financial-assistance:costType.${cost.costType}`) : t('financial-assistance:economy.cost.heading', { number: index + 1 })}
            value={amount(cost.appliedAmount)}
          />
        ))}
        {!isSupplementary
          ? values.incomes.map((income, index) => (
              <Row
                key={`income-${index}`}
                label={income.incomeType ? t(`financial-assistance:incomeType.${income.incomeType}`) : t('financial-assistance:economy.income.heading', { number: index + 1 })}
                value={amount(income.amount)}
              />
            ))
          : null}
        {!isSupplementary
          ? values.assets.map((asset, index) => (
              <Row
                key={`asset-${index}`}
                label={asset.assetCategory ? t(`financial-assistance:assetCategory.${asset.assetCategory}`) : t('financial-assistance:economy.asset.heading', { number: index + 1 })}
                value={amount(asset.value) ?? asset.description}
              />
            ))
          : null}
      </SummarySection>

      {!isSupplementary ? (
        <SummarySection heading={t('financial-assistance:groups.planning')}>
          {values.plannings.map((planning, index) => (
            <Row
              key={`planning-${index}`}
              label={t('financial-assistance:planning.planning.heading', { number: index + 1 })}
              value={planning.planningType ? t(`financial-assistance:planningType.${planning.planningType}`) : undefined}
            />
          ))}
        </SummarySection>
      ) : null}

      <SummarySection heading={t('financial-assistance:groups.payment')}>
        {values.persons.map((person, index) => (
          <Row
            key={`person-${index}`}
            label={t(`financial-assistance:recipient.${person.role}`)}
            value={person.paymentMethod ? t(`financial-assistance:paymentMethod.${person.paymentMethod}`) : undefined}
          />
        ))}
      </SummarySection>
    </div>
  );
};

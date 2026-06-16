import { FinancialAssistanceFormData, HousingForm, PeriodChoice, emptyChild } from '@interfaces/financial-assistance';
import { Button, FormControl, FormLabel, Icon, Input, RadioButton, Select, Textarea } from '@sk-web-gui/react';
import { Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StepNavigation } from '../../components/step-navigation.component';
import { FaChildCard } from '../components/fa-child-card.component';
import { FaStepProps } from './fa-step-registry';

const PERIOD_CHOICES: PeriodChoice[] = ['CURRENT_MONTH', 'NEXT_MONTH', 'OTHER_BENEFIT'];
const HOUSING_FORMS: HousingForm[] = [
  'NO_HOUSING_OR_INSTITUTION',
  'RENTAL',
  'SUBLET',
  'LODGER',
  'CONDOMINIUM',
  'OWNED_HOUSE',
  'RENTED_HOUSE',
  'LIVING_WITH_PARENTS',
];

const numberFieldOptions = {
  setValueAs: (value: string | number | null) => (value === '' || value === null ? null : Number(value)),
};

/**
 * Grupp 1 — hushåll & boende. Leder med civilstånd (från portalen) + ansökningsperiod,
 * därefter barn och boende (ej tilläggsansökan). Återansökan visar ändringsfrågor.
 */
export const StepHouseholdHousing: React.FC<FaStepProps> = ({ applicationType, onBack, onNext }) => {
  const { t } = useTranslation('financial-assistance');
  const { control, register, watch, setValue } = useFormContext<FinancialAssistanceFormData>();

  const { fields, append, remove } = useFieldArray({ control, name: 'children' });

  const maritalStatus = watch('maritalStatus');
  const periodChoice = watch('periodChoice');
  const periodMonth = watch('periodMonth');
  const periodYear = watch('periodYear');
  const hasChildren = watch('hasChildrenUnder21');
  const childrenChanged = watch('childrenResidenceChanged');
  const housingChanged = watch('housingChanged');
  const housingForm = watch('housingForm');

  const isNew = applicationType === 'NEW';
  const isRenewal = applicationType === 'RENEWAL';
  const isSupplementary = applicationType === 'SUPPLEMENTARY';
  const showHousingDetails = !isRenewal || housingChanged === true;

  useEffect(() => {
    if (hasChildren === true && fields.length === 0) {
      append(emptyChild(), { shouldFocus: false });
    } else if (hasChildren === false && fields.length > 0) {
      setValue('children', [], { shouldDirty: true });
    }
  }, [hasChildren, fields.length, append, setValue]);

  const setBool = (name: 'hasChildrenUnder21' | 'childrenResidenceChanged' | 'housingChanged', value: boolean) =>
    setValue(name, value, { shouldDirty: true });

  return (
    <section className="flex flex-col gap-32" data-cy="fa-step-household-housing">
      <header className="text-content">
        <h2>{t('financial-assistance:householdHousing.heading')}</h2>
      </header>

      {/* Civilstånd — från portalen, skrivskyddat */}
      <div className="text-content">
        <p className="font-bold">{t('financial-assistance:periodNorm.maritalStatusLabel')}</p>
        <p>{t(`financial-assistance:maritalStatus.${maritalStatus}`)}</p>
      </div>

      {/* Ansökningsperiod */}
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
              onChange={(event) => setValue('otherBenefitDescription', event.target.value, { shouldDirty: true })}
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

      {/* Barn + boende ingår inte i tilläggsansökan */}
      {!isSupplementary ? (
        <>
          <FormControl data-cy="fa-has-children">
            <FormLabel className="font-bold">{t('financial-assistance:householdHousing.hasChildrenLabel')}</FormLabel>
            <RadioButton.Group inline>
              <RadioButton
                size="sm"
                className="mr-sm"
                name="fa-has-children"
                id="fa-has-children-yes"
                checked={hasChildren === true}
                onChange={() => {}}
                onClick={() => setBool('hasChildrenUnder21', true)}
              >
                {t('financial-assistance:common.yes')}
              </RadioButton>
              <RadioButton
                size="sm"
                className="mr-sm"
                name="fa-has-children"
                id="fa-has-children-no"
                checked={hasChildren === false}
                onChange={() => {}}
                onClick={() => setBool('hasChildrenUnder21', false)}
              >
                {t('financial-assistance:common.no')}
              </RadioButton>
            </RadioButton.Group>
          </FormControl>

          {hasChildren === true ? (
            <section className="flex flex-col gap-16" data-cy="fa-children">
              {fields.map((field, index) => (
                <FaChildCard key={field.id} index={index} applicationType={applicationType} onRemove={() => remove(index)} />
              ))}
              <div>
                <Button
                  variant="link"
                  size="sm"
                  data-cy="fa-child-add"
                  onClick={() => append(emptyChild())}
                  leftIcon={<Icon icon={<Plus />} />}
                >
                  {t('financial-assistance:householdHousing.addChild')}
                </Button>
              </div>
            </section>
          ) : null}

          {isRenewal && hasChildren === true ? (
            <FormControl data-cy="fa-children-changed">
              <FormLabel className="font-bold">
                {t('financial-assistance:householdHousing.childrenChangedLabel')}
              </FormLabel>
              <RadioButton.Group inline>
                <RadioButton
                  size="sm"
                  className="mr-sm"
                  name="fa-children-changed"
                  id="fa-children-changed-yes"
                  checked={childrenChanged === true}
                  onChange={() => {}}
                  onClick={() => setBool('childrenResidenceChanged', true)}
                >
                  {t('financial-assistance:common.yes')}
                </RadioButton>
                <RadioButton
                  size="sm"
                  className="mr-sm"
                  name="fa-children-changed"
                  id="fa-children-changed-no"
                  checked={childrenChanged === false}
                  onChange={() => {}}
                  onClick={() => setBool('childrenResidenceChanged', false)}
                >
                  {t('financial-assistance:common.no')}
                </RadioButton>
              </RadioButton.Group>
              {childrenChanged === true ? (
                <Textarea
                  className="w-full min-h-72 mt-12"
                  placeholder={t('financial-assistance:householdHousing.changeDescriptionPlaceholder')}
                  value={watch('childrenResidenceChangeDescription')}
                  onChange={(event) =>
                    setValue('childrenResidenceChangeDescription', event.target.value, { shouldDirty: true })
                  }
                />
              ) : null}
            </FormControl>
          ) : null}

          {isRenewal ? (
            <FormControl data-cy="fa-housing-changed">
              <FormLabel className="font-bold">
                {t('financial-assistance:householdHousing.housingChangedLabel')}
              </FormLabel>
              <RadioButton.Group inline>
                <RadioButton
                  size="sm"
                  className="mr-sm"
                  name="fa-housing-changed"
                  id="fa-housing-changed-yes"
                  checked={housingChanged === true}
                  onChange={() => {}}
                  onClick={() => setBool('housingChanged', true)}
                >
                  {t('financial-assistance:common.yes')}
                </RadioButton>
                <RadioButton
                  size="sm"
                  className="mr-sm"
                  name="fa-housing-changed"
                  id="fa-housing-changed-no"
                  checked={housingChanged === false}
                  onChange={() => {}}
                  onClick={() => setBool('housingChanged', false)}
                >
                  {t('financial-assistance:common.no')}
                </RadioButton>
              </RadioButton.Group>
              {housingChanged === true ? (
                <Textarea
                  className="w-full min-h-72 mt-12"
                  placeholder={t('financial-assistance:householdHousing.changeDescriptionPlaceholder')}
                  value={watch('housingChangeDescription')}
                  onChange={(event) => setValue('housingChangeDescription', event.target.value, { shouldDirty: true })}
                />
              ) : null}
            </FormControl>
          ) : null}

          {showHousingDetails ? (
            <section className="flex flex-col gap-16" data-cy="fa-housing">
              <h3 className="text-h4-md font-bold">{t('financial-assistance:householdHousing.housingHeading')}</h3>

              <FormControl className="w-full max-w-[28rem]">
                <FormLabel htmlFor="fa-housing-form">
                  {t('financial-assistance:householdHousing.housingFormLabel')}
                </FormLabel>
                <Select
                  id="fa-housing-form"
                  className="w-full"
                  value={housingForm || ''}
                  onSelectValue={(next) =>
                    setValue('housingForm', (next as HousingForm | '') || '', { shouldDirty: true })
                  }
                >
                  <Select.Option value="" disabled>
                    {t('financial-assistance:child.select')}
                  </Select.Option>
                  {HOUSING_FORMS.map((value) => (
                    <Select.Option key={value} value={value}>
                      {t(`financial-assistance:housingForm.${value}`)}
                    </Select.Option>
                  ))}
                </Select>
              </FormControl>

              {/* "Utan bostad/institution" har ingen följdfråga. */}
              {housingForm && housingForm !== 'NO_HOUSING_OR_INSTITUTION' ? (
                <div className="grid grid-cols-1 desktop:grid-cols-2 gap-16">
                  <FormControl className="w-full">
                    <FormLabel htmlFor="fa-housing-adults">
                      {t('financial-assistance:householdHousing.adultsLabel')}
                    </FormLabel>
                    <Input
                      id="fa-housing-adults"
                      type="number"
                      min={0}
                      {...register('housingAdultsCount', numberFieldOptions)}
                    />
                  </FormControl>
                  <FormControl className="w-full">
                    <FormLabel htmlFor="fa-housing-children">
                      {t('financial-assistance:householdHousing.childrenCountLabel')}
                    </FormLabel>
                    <Input
                      id="fa-housing-children"
                      type="number"
                      min={0}
                      {...register('housingChildrenCount', numberFieldOptions)}
                    />
                  </FormControl>
                </div>
              ) : null}

              {housingForm === 'LODGER' ? (
                <FormControl className="w-full max-w-[20rem]">
                  <FormLabel htmlFor="fa-housing-rooms">
                    {t('financial-assistance:householdHousing.roomsLabel')}
                  </FormLabel>
                  <Input
                    id="fa-housing-rooms"
                    type="number"
                    min={0}
                    {...register('housingRoomsPlusKitchen', numberFieldOptions)}
                  />
                </FormControl>
              ) : null}
            </section>
          ) : null}
        </>
      ) : null}

      <StepNavigation onBack={onBack} onNext={onNext} />
    </section>
  );
};

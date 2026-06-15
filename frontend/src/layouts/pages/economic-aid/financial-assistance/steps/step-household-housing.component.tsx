import {
  FinancialAssistanceFormData,
  HousingForm,
  emptyChild,
} from '@interfaces/financial-assistance';
import { Button, FormControl, FormLabel, Icon, Input, RadioButton, Select, Textarea } from '@sk-web-gui/react';
import { Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StepNavigation } from '../../components/step-navigation.component';
import { FaChildCard } from '../components/fa-child-card.component';
import { FaStepProps } from './fa-step-registry';

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

/** Grupp 2 — hushåll & boende. Barn + boendeform; återansökan visar ändringsfrågor. */
export const StepHouseholdHousing: React.FC<FaStepProps> = ({ applicationType, onBack, onNext }) => {
  const { t } = useTranslation('financial-assistance');
  const { control, register, watch, setValue } = useFormContext<FinancialAssistanceFormData>();

  const { fields, append, remove } = useFieldArray({ control, name: 'children' });

  const hasChildren = watch('hasChildrenUnder21');
  const childrenChanged = watch('childrenResidenceChanged');
  const housingChanged = watch('housingChanged');
  const housingForm = watch('housingForm');

  const isRenewal = applicationType === 'RENEWAL';
  const showHousingDetails = !isRenewal || housingChanged === true;

  // Keep at least one child row when "Ja", clear when "Nej".
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

      {/* Barn under 21 */}
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
            <FaChildCard key={field.id} index={index} onRemove={() => remove(index)} />
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

      {/* Förändring av barns boende — endast återansökan */}
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

      {/* Boendeförändring — endast återansökan */}
      {isRenewal ? (
        <FormControl data-cy="fa-housing-changed">
          <FormLabel className="font-bold">{t('financial-assistance:householdHousing.housingChangedLabel')}</FormLabel>
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

      {/* Boendeuppgifter */}
      {showHousingDetails ? (
        <section className="flex flex-col gap-16" data-cy="fa-housing">
          <h3 className="text-h4-md font-bold">{t('financial-assistance:householdHousing.housingHeading')}</h3>

          <FormControl className="w-full max-w-[28rem]">
            <FormLabel htmlFor="fa-housing-form">{t('financial-assistance:householdHousing.housingFormLabel')}</FormLabel>
            <Select
              id="fa-housing-form"
              className="w-full"
              value={housingForm || ''}
              onSelectValue={(next) => setValue('housingForm', (next as HousingForm | '') || '', { shouldDirty: true })}
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

          {housingForm === 'NO_HOUSING_OR_INSTITUTION' ? (
            <FormControl className="w-full">
              <FormLabel htmlFor="fa-housing-description">
                {t('financial-assistance:householdHousing.housingDescriptionLabel')}
              </FormLabel>
              <Textarea
                id="fa-housing-description"
                className="w-full min-h-72"
                value={watch('housingDescription')}
                onChange={(event) => setValue('housingDescription', event.target.value, { shouldDirty: true })}
              />
            </FormControl>
          ) : null}
        </section>
      ) : null}

      <StepNavigation onBack={onBack} onNext={onNext} />
    </section>
  );
};

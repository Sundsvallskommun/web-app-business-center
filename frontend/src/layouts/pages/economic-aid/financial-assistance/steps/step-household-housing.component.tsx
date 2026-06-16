import {
  FinancialAssistanceFormData,
  HousingForm,
  PrefilledChild,
  PrefillResult,
  emptyChild,
} from '@interfaces/financial-assistance';
import { useApi } from '@services/api-service';
import { Button, Divider, FormControl, FormLabel, Icon, Input, RadioButton, Select, Textarea } from '@sk-web-gui/react';
import { Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StepNavigation } from '../../components/step-navigation.component';
import { FaChildCard } from '../components/fa-child-card.component';
import { FaContactSection } from '../components/fa-contact-section.component';
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

/**
 * Grupp 1 — personuppgifter, hushåll & boende. Civilstånd + kontaktuppgifter/notisval per person
 * (sökande + ev. medsökande), därefter barn och boende (ej tilläggsansökan). Texterna växlar
 * du→ni när det finns en medsökande.
 */
export const StepHouseholdHousing: React.FC<FaStepProps> = ({ applicationType, onBack, onNext }) => {
  const { t } = useTranslation('financial-assistance');
  const { control, register, watch, setValue, getValues } = useFormContext<FinancialAssistanceFormData>();

  const { fields, append, remove } = useFieldArray({ control, name: 'children' });

  const maritalStatus = watch('maritalStatus');
  const hasChildren = watch('hasChildrenUnder21');
  const childrenChanged = watch('childrenResidenceChanged');
  const housingChanged = watch('housingChanged');
  const housingForm = watch('housingForm');

  const isRenewal = applicationType === 'RENEWAL';
  const isSupplementary = applicationType === 'SUPPLEMENTARY';
  const isCohabiting = maritalStatus === 'COHABITING';
  // i18next-kontext för du→ni-växling när det finns en medsökande.
  const ni = isCohabiting ? { context: 'ni' } : undefined;

  // Notisval: minst en kanal per person (sökande, och medsökande när gift/sambo).
  const applicantNotifyMissing = !watch('notifyByEmail') && !watch('notifyBySms');
  const coApplicantNotifyMissing = isCohabiting && !watch('coNotifyByEmail') && !watch('coNotifyBySms');
  const notifyMissing = applicantNotifyMissing || coApplicantNotifyMissing;

  const coApplicantPnr =
    (watch('persons').find((person) => person.role === 'CO_APPLICANT')?.personalNumber ?? '').trim();

  const showFullHousing = !isRenewal || housingChanged === true;
  const showHouseholdCountsOnly = isRenewal && housingChanged === false;

  // Barn-prefill från senaste Lifecare-normberäkning (endast återansökan).
  const prefillApi = useApi<PrefillResult>({
    url: '/economic-aid/prefill',
    method: 'get',
    queryOptions: { enabled: isRenewal },
  });
  const prefilledChildren = prefillApi.data?.children ?? [];

  useEffect(() => {
    if (hasChildren === true && fields.length === 0) {
      append(emptyChild(), { shouldFocus: false });
    } else if (hasChildren === false && fields.length > 0) {
      setValue('children', [], { shouldDirty: true });
    }
  }, [hasChildren, fields.length, append, setValue]);

  const setBool = (name: 'hasChildrenUnder21' | 'childrenResidenceChanged' | 'housingChanged', value: boolean) =>
    setValue(name, value, { shouldDirty: true });

  // Lägg till ett föreslaget barn (från Lifecare, identifierat med partyId) om det inte redan finns.
  const addPrefilledChild = (child: PrefilledChild) => {
    const partyId = child.partyId ?? '';
    if (partyId && getValues('children').some((entry) => entry.partyId === partyId)) return;
    const parts = (child.name ?? '').trim().split(/\s+/).filter(Boolean);
    const lastName = parts.length > 1 ? parts[parts.length - 1] : '';
    const firstName = parts.length > 1 ? parts.slice(0, -1).join(' ') : (parts[0] ?? '');
    append({ ...emptyChild(), partyId, firstName, lastName });
  };

  const yesNo = (
    field: 'hasChildrenUnder21' | 'childrenResidenceChanged' | 'housingChanged',
    current: boolean | null,
    cy: string,
  ) => (
    <RadioButton.Group inline>
      <RadioButton
        size="sm"
        className="mr-sm"
        name={cy}
        id={`${cy}-yes`}
        checked={current === true}
        onChange={() => {}}
        onClick={() => setBool(field, true)}
      >
        {t('financial-assistance:common.yes')}
      </RadioButton>
      <RadioButton
        size="sm"
        className="mr-sm"
        name={cy}
        id={`${cy}-no`}
        checked={current === false}
        onChange={() => {}}
        onClick={() => setBool(field, false)}
      >
        {t('financial-assistance:common.no')}
      </RadioButton>
    </RadioButton.Group>
  );

  return (
    <section className="flex flex-col gap-32" data-cy="fa-step-household-housing">
      <header className="text-content">
        <h2>{t('financial-assistance:personuppgifter.heading')}</h2>
      </header>

      {/* Civilstånd — från portalen, skrivskyddat */}
      <div className="text-content">
        <p className="font-bold">{t('financial-assistance:periodNorm.maritalStatusLabel')}</p>
        <p>{t(`financial-assistance:maritalStatus.${maritalStatus}`)}</p>
      </div>

      {/* Kontaktuppgifter + notisval — sökande, och medsökande vid gift/sambo */}
      <FaContactSection
        heading={t('financial-assistance:personuppgifter.applicantHeading')}
        notifyLabel={t('financial-assistance:personuppgifter.notifyLabel')}
        profileUrl="/economic-aid/applicant-profile"
        emailField="contactEmail"
        phoneField="contactPhone"
        notifyEmailField="notifyByEmail"
        notifySmsField="notifyBySms"
      />

      {isCohabiting && coApplicantPnr ? (
        <FaContactSection
          heading={t('financial-assistance:personuppgifter.coApplicantHeading')}
          notifyLabel={t('financial-assistance:personuppgifter.notifyLabelCoApplicant')}
          profileUrl={`/economic-aid/co-applicant-profile?personnummer=${encodeURIComponent(coApplicantPnr)}`}
          emailField="coApplicantEmail"
          phoneField="coApplicantPhone"
          notifyEmailField="coNotifyByEmail"
          notifySmsField="coNotifyBySms"
        />
      ) : null}

      {/* Barn + boende ingår inte i tilläggsansökan */}
      {!isSupplementary ? (
        <>
          <FormControl data-cy="fa-has-children">
            <FormLabel className="font-bold">{t('financial-assistance:householdHousing.hasChildrenLabel', ni)}</FormLabel>
            <p className="text-small text-dark-secondary mb-8">
              {t('financial-assistance:householdHousing.hasChildrenInfo', ni)}
            </p>
            {yesNo('hasChildrenUnder21', hasChildren, 'fa-has-children')}
          </FormControl>

          {hasChildren === true ? (
            <section className="flex flex-col gap-16" data-cy="fa-children">
              {prefilledChildren.length > 0 ? (
                <div
                  className="rounded-12 border-2 border-divider bg-background-content p-16 flex flex-col gap-8"
                  data-cy="fa-prefill-children"
                >
                  <span className="font-bold">{t('financial-assistance:householdHousing.prefillHeading')}</span>
                  {prefilledChildren.map((child) => (
                    <div key={child.partyId ?? child.name ?? ''} className="flex items-center justify-between gap-8">
                      <span>{child.name}</span>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => addPrefilledChild(child)}
                        leftIcon={<Icon icon={<Plus />} />}
                      >
                        {t('financial-assistance:householdHousing.prefillAdd')}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null}

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
                {t('financial-assistance:householdHousing.childrenChangedLabel', ni)}
              </FormLabel>
              {yesNo('childrenResidenceChanged', childrenChanged, 'fa-children-changed')}
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
                {t('financial-assistance:householdHousing.housingChangedLabel', ni)}
              </FormLabel>
              {yesNo('housingChanged', housingChanged, 'fa-housing-changed')}
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

          {showFullHousing ? (
            <section className="flex flex-col gap-16" data-cy="fa-housing">
              <FormControl className="w-full max-w-[28rem]">
                <FormLabel htmlFor="fa-housing-form">
                  {isRenewal
                    ? t('financial-assistance:householdHousing.housingFormLabelChanged')
                    : t('financial-assistance:householdHousing.housingFormLabel')}
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
                <FormControl className="w-full max-w-[28rem]">
                  <FormLabel htmlFor="fa-housing-person-count">
                    {t('financial-assistance:householdHousing.personCountLabel')}
                  </FormLabel>
                  <Input
                    id="fa-housing-person-count"
                    type="number"
                    min={0}
                    {...register('housingPersonCount', numberFieldOptions)}
                  />
                </FormControl>
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

          {/* Boendet oförändrat (återansökan) → ange ändå antal i hushållet. */}
          {showHouseholdCountsOnly ? (
            <FormControl className="w-full max-w-[28rem]" data-cy="fa-household-counts">
              <FormLabel htmlFor="fa-housing-person-count-only">
                {t('financial-assistance:householdHousing.personCountLabel')}
              </FormLabel>
              <Input
                id="fa-housing-person-count-only"
                type="number"
                min={0}
                {...register('housingPersonCount', numberFieldOptions)}
              />
            </FormControl>
          ) : null}
        </>
      ) : null}

      <StepNavigation onBack={onBack} onNext={onNext} forwardDisabled={notifyMissing} />
    </section>
  );
};

import { CIVILSTAND_VALUES, Civilstand, EconomicAidApplicationV1, EligibilityResult } from '@interfaces/economic-aid';
import { isFinancialAssistanceSlug } from '@interfaces/financial-assistance';
import { useApi } from '@services/api-service';
import { FormControl, FormErrorMessage, FormLabel, Input, RadioButton, useSnackbar } from '@sk-web-gui/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StepNavigation } from '../components/step-navigation.component';
import { StepProps } from './step-registry';

const PERSONNUMMER_PATTERN = /^\d{8}-\d{4}$/;
const CIVILSTAND_WITH_PARTNER: ReadonlySet<Civilstand> = new Set(['gift', 'sambo']);

const cardClass = (checked: boolean): string =>
  [
    'flex items-start gap-16 p-20 rounded-12 cursor-pointer border-2 transition',
    'hover:border-vattjom-surface-primary',
    checked
      ? 'border-vattjom-surface-primary bg-vattjom-background-100'
      : 'border-divider bg-background-content',
  ].join(' ');

/**
 * Steg 1 — civilstånd. Värdet skrivs till `hushall.civilstand`. Vid gift/sambo
 * samlas även medsökandes personnummer in (formatkontroll). Civilstånd skickas
 * till backend som hämtar applikantens personnummer från sessionen och
 * medsökandes från fältet, och resolvar vilka typeSlugs som ska visas.
 */
export const StepCivilstand: React.FC<StepProps> = ({ onBack, onNext }) => {
  const { t } = useTranslation('economic-aid');
  const toastMessage = useSnackbar();
  const { register, watch, setValue, getValues, trigger, formState } =
    useFormContext<EconomicAidApplicationV1>();

  const civilstand = watch('hushall.civilstand');
  const showMedsokande = civilstand !== null && CIVILSTAND_WITH_PARTNER.has(civilstand);
  const personnummerError = formState.errors.hushall?.medsokande?.personnummer;

  // Resolves which application(s) to offer. The applicant's personnummer is taken
  // from the authenticated session server-side; for gift/sambo we add the partner's.
  const eligibility = useApi<EligibilityResult>({ url: '/economic-aid/eligibility', method: 'post' });

  const select = (value: Civilstand) =>
    setValue('hushall.civilstand', value, { shouldDirty: true });

  const handleForward = async () => {
    if (!civilstand) return;

    const isPartner = CIVILSTAND_WITH_PARTNER.has(civilstand);
    if (isPartner) {
      const valid = await trigger('hushall.medsokande.personnummer');
      if (!valid) return;
    }

    const body: Record<string, unknown> = { civilstand };
    if (isPartner) {
      body.medsokandePersonnummer = getValues('hushall.medsokande.personnummer');
    }

    const result = await eligibility.mutateAsync(body);
    if (!result || result.error) {
      toastMessage({
        position: 'bottom',
        closeable: false,
        status: 'error',
        message: 'Det gick inte att hämta vilken ansökan som passar dig. Försök igen senare.',
      });
      return;
    }

    setValue('eligibility', result, { shouldDirty: true });

    // Only one suggestion → skip the selection step and go straight into that form.
    const suggestions = result.suggestions ?? [];
    if (suggestions.length === 1 && isFinancialAssistanceSlug(suggestions[0].typeSlug)) {
      setValue('chosenTypeSlug', suggestions[0].typeSlug, { shouldDirty: true });
      return;
    }

    onNext();
  };

  return (
    <section
      className="flex flex-col gap-24"
      aria-labelledby="economic-aid-step-civilstand-heading"
      data-cy="economic-aid-step-civilstand"
    >
      <header className="text-content">
        <h2 id="economic-aid-step-civilstand-heading">{t('economic-aid:civilstand.heading')}</h2>
        <p>{t('economic-aid:civilstand.ingress')}</p>
      </header>

      <FormControl>
        <FormLabel className="sr-only">{t('economic-aid:civilstand.legend')}</FormLabel>
        {/*
          Samma kort-layout som vägvalssteget: RadioButton.Group injicerar en
          rad-layout som krockar med korten, så vi roller-grupperar själva och
          låter hela kortet vara en <label> runt den nativa radion.
        */}
        <div
          role="radiogroup"
          aria-labelledby="economic-aid-step-civilstand-heading"
          className="grid gap-16 desktop:grid-cols-2"
        >
          {CIVILSTAND_VALUES.map((value) => {
            const checked = civilstand === value;
            const inputId = `civilstand-${value}`;
            return (
              <label
                key={value}
                htmlFor={inputId}
                className={cardClass(checked)}
                data-cy={`economic-aid-civilstand-${value}`}
              >
                <RadioButton
                  size="md"
                  name="civilstand"
                  id={inputId}
                  value={value}
                  checked={checked}
                  onChange={() => select(value)}
                  aria-labelledby={`${inputId}-label`}
                />
                <span id={`${inputId}-label`} className="font-bold">
                  {t(`economic-aid:civilstand.options.${value}`)}
                </span>
              </label>
            );
          })}
        </div>
      </FormControl>

      {showMedsokande && (
        <FormControl invalid={!!personnummerError} className="w-full max-w-[24rem]">
          <FormLabel htmlFor="economic-aid-medsokande-personnummer" className="font-bold">
            {t('economic-aid:civilstand.medsokande.personnummerLabel')}
          </FormLabel>
          <Input
            id="economic-aid-medsokande-personnummer"
            data-cy="economic-aid-medsokande-personnummer"
            placeholder="ÅÅÅÅMMDD-XXXX"
            {...register('hushall.medsokande.personnummer', {
              validate: (value) => {
                const selected = getValues('hushall.civilstand');
                if (!selected || !CIVILSTAND_WITH_PARTNER.has(selected)) return true;
                if (value.trim().length === 0) return 'Personnummer på medsökande krävs';
                return PERSONNUMMER_PATTERN.test(value) || 'Personnummer måste anges som ÅÅÅÅMMDD-XXXX';
              },
            })}
          />
          <p className="text-small text-dark-secondary mt-4">
            {t('economic-aid:civilstand.medsokande.personnummerHelper')}
          </p>
          {personnummerError?.message ? (
            <FormErrorMessage className="text-error">{personnummerError.message}</FormErrorMessage>
          ) : null}
        </FormControl>
      )}

      <StepNavigation
        onBack={onBack}
        onNext={handleForward}
        forwardDisabled={civilstand === null}
        forwardLoading={eligibility.isPending}
      />
    </section>
  );
};

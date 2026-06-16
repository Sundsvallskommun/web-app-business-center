import { ApplicantProfile, CIVILSTAND_VALUES, Civilstand, EconomicAidApplicationV1, EligibilityResult } from '@interfaces/economic-aid';
import { isFinancialAssistanceSlug } from '@interfaces/financial-assistance';
import { apiService, useApi } from '@services/api-service';
import { FormControl, FormErrorMessage, FormLabel, Icon, Input, RadioButton, useSnackbar } from '@sk-web-gui/react';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FaBankidMock } from '../financial-assistance/components/fa-bankid-mock.component';
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

interface CoApplicantLookup {
  found: boolean;
  name: string;
}

/**
 * Steg 1 — civilstånd. Vid gift/sambo matas medsökandes personnummer in; på blur slås
 * namnet upp mot Citizen och måste få träff innan man går vidare. När man fortsätter
 * signerar medsökande med BankID (mockad — spinner + knapp tills riktig signering finns).
 */
export const StepCivilstand: React.FC<StepProps> = ({ onBack, onNext }) => {
  const { t } = useTranslation('economic-aid');
  const toastMessage = useSnackbar();
  const { register, watch, setValue, getValues, trigger, formState } =
    useFormContext<EconomicAidApplicationV1>();

  const civilstand = watch('hushall.civilstand');
  const showMedsokande = civilstand !== null && CIVILSTAND_WITH_PARTNER.has(civilstand);
  const personnummerError = formState.errors.hushall?.medsokande?.personnummer;

  const [coApplicant, setCoApplicant] = useState<CoApplicantLookup | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const [pendingResult, setPendingResult] = useState<EligibilityResult | null>(null);

  const eligibility = useApi<EligibilityResult>({ url: '/economic-aid/eligibility', method: 'post' });

  const select = (value: Civilstand) =>
    setValue('hushall.civilstand', value, { shouldDirty: true });

  // Slår upp medsökandes namn mot Citizen. Returnerar uppslaget (eller null vid felaktigt format).
  const runCoApplicantLookup = async (): Promise<CoApplicantLookup | null> => {
    const pnr = getValues('hushall.medsokande.personnummer');
    if (!PERSONNUMMER_PATTERN.test(pnr)) {
      setCoApplicant(null);
      return null;
    }
    setLookupLoading(true);
    try {
      const res = await apiService.get<{ data: ApplicantProfile }>(
        `/economic-aid/co-applicant-profile?personnummer=${encodeURIComponent(pnr)}`,
      );
      const profile = res.data.data;
      const name = [profile.fornamn, profile.efternamn].filter(Boolean).join(' ').trim();
      const lookup: CoApplicantLookup = { found: !!name, name };
      setCoApplicant(lookup);
      return lookup;
    } catch {
      const lookup: CoApplicantLookup = { found: false, name: '' };
      setCoApplicant(lookup);
      return lookup;
    } finally {
      setLookupLoading(false);
    }
  };

  // Sparar eligibility-resultatet och går vidare (direkt in i formuläret om bara ett förslag).
  const proceed = (result: EligibilityResult) => {
    setValue('eligibility', result, { shouldDirty: true });
    const suggestions = result.suggestions ?? [];
    if (suggestions.length === 1 && isFinancialAssistanceSlug(suggestions[0].typeSlug)) {
      setValue('chosenTypeSlug', suggestions[0].typeSlug, { shouldDirty: true });
      return;
    }
    onNext();
  };

  const handleForward = async () => {
    if (!civilstand) return;

    const isPartner = CIVILSTAND_WITH_PARTNER.has(civilstand);
    if (isPartner) {
      const validFormat = await trigger('hushall.medsokande.personnummer');
      if (!validFormat) return;
      const lookup = coApplicant ?? (await runCoApplicantLookup());
      if (!lookup || !lookup.found) {
        toastMessage({
          position: 'bottom',
          closeable: false,
          status: 'error',
          message: t('economic-aid:civilstand.medsokande.notFound'),
        });
        return;
      }
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
        message: t('economic-aid:civilstand.eligibilityError'),
      });
      return;
    }

    // Med medsökande krävs BankID-signering (mock) innan vi går vidare.
    if (isPartner) {
      setPendingResult(result);
      setSignOpen(true);
      return;
    }

    proceed(result);
  };

  const pnrField = register('hushall.medsokande.personnummer', {
    validate: (value) => {
      const selected = getValues('hushall.civilstand');
      if (!selected || !CIVILSTAND_WITH_PARTNER.has(selected)) return true;
      if (value.trim().length === 0) return t('economic-aid:civilstand.medsokande.personnummerRequired');
      return PERSONNUMMER_PATTERN.test(value) || t('economic-aid:civilstand.medsokande.personnummerFormat');
    },
  });

  const forwardDisabled = civilstand === null || (showMedsokande && !coApplicant?.found);

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
            placeholder={t('economic-aid:civilstand.medsokande.personnummerPlaceholder')}
            {...pnrField}
            onChange={(event) => {
              pnrField.onChange(event);
              setCoApplicant(null);
            }}
            onBlur={(event) => {
              pnrField.onBlur(event);
              void runCoApplicantLookup();
            }}
          />
          <p className="text-small text-dark-secondary mt-4">
            {t('economic-aid:civilstand.medsokande.personnummerHelper')}
          </p>
          {personnummerError?.message ? (
            <FormErrorMessage className="text-error">{personnummerError.message}</FormErrorMessage>
          ) : null}

          {lookupLoading ? (
            <p className="text-small text-dark-secondary mt-8" data-cy="economic-aid-medsokande-checking">
              {t('economic-aid:civilstand.medsokande.checking')}
            </p>
          ) : null}
          {!lookupLoading && coApplicant?.found ? (
            <p className="flex items-center gap-8 font-bold mt-8" data-cy="economic-aid-medsokande-found">
              <Icon size={20} icon={<Check />} className="text-vattjom-surface-primary" />
              {coApplicant.name}
            </p>
          ) : null}
          {!lookupLoading && coApplicant && !coApplicant.found ? (
            <FormErrorMessage className="text-error mt-8" data-cy="economic-aid-medsokande-notfound">
              {t('economic-aid:civilstand.medsokande.notFound')}
            </FormErrorMessage>
          ) : null}
        </FormControl>
      )}

      <StepNavigation
        onBack={onBack}
        onNext={handleForward}
        forwardDisabled={forwardDisabled}
        forwardLoading={eligibility.isPending || lookupLoading}
      />

      <FaBankidMock
        show={signOpen}
        label={t('economic-aid:civilstand.medsokande.signLabel')}
        description={t('economic-aid:civilstand.medsokande.signDescription')}
        confirmLabel={t('economic-aid:civilstand.medsokande.signConfirm')}
        onClose={() => setSignOpen(false)}
        onConfirm={() => {
          setSignOpen(false);
          if (pendingResult) proceed(pendingResult);
        }}
      />
    </section>
  );
};

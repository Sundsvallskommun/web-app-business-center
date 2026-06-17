'use client';

import { CardElevated } from '@components/cards/card-elevated.component';
import {
  ECONOMIC_AID_STEPS,
  EconomicAidApplicationV1,
  emptyEconomicAidApplication,
} from '@interfaces/economic-aid';
import { useApi } from '@services/api-service';
import {
  clearEconomicAidDraft,
  loadEconomicAidDraft,
  saveEconomicAidDraft,
} from '@services/economic-aid-service';
import { useSnackbar } from '@sk-web-gui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MaritalStatus, isFinancialAssistanceSlug } from '@interfaces/financial-assistance';
import { FinancialAssistanceApplication } from './financial-assistance/financial-assistance-application.component';
import { STEP_COMPONENTS } from './steps/step-registry';

const FIRST_STEP = 0;
const LAST_STEP = ECONOMIC_AID_STEPS.length - 1;

interface SubmitResponse {
  errandId: string;
}

export const EconomicAidApplication: React.FC = () => {
  const router = useRouter();
  const toastMessage = useSnackbar();
  const { t } = useTranslation('economic-aid');
  const [currentStep, setCurrentStep] = useState(FIRST_STEP);

  // Scrolla upp till formulärets topp vid stegbyte (Påbörja ansökan/Nästa/Tillbaka), men inte vid
  // första render.
  const topRef = useRef<HTMLElement>(null);
  const isInitialRender = useRef(true);
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentStep]);

  const form = useForm<EconomicAidApplicationV1>({
    defaultValues: emptyEconomicAidApplication(),
    mode: 'onChange',
  });

  const submitApplication = useApi<SubmitResponse>({
    url: '/economic-aid/applications',
    method: 'post',
  });

  // Hydrate from sessionStorage after mount so SSR/CSR don't disagree.
  // form is a stable ref from useForm; the dep is for eslint, not re-runs.
  useEffect(() => {
    form.reset(loadEconomicAidDraft());
  }, [form]);

  // Autosave on every change. We intentionally pull the full form state via
  // getValues() rather than the watch payload — watch's callback value is a
  // DeepPartial of the form, and a shallow merge of partials on hydrate would
  // overwrite nested defaults with undefined. getValues() always returns the
  // complete current state.
  useEffect(() => {
    const subscription = form.watch(() => {
      saveEconomicAidDraft(form.getValues());
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const goNext = () => setCurrentStep((step) => Math.min(step + 1, LAST_STEP));
  const goBack = () => setCurrentStep((step) => Math.max(step - 1, FIRST_STEP));

  // useApi's mutation swallows errors and resolves with `{ error }` instead of
  // throwing — see api-service.ts defaultMutationCall. We branch on the
  // returned shape; throw/catch would never fire.
  const handleSubmit = form.handleSubmit(async (data) => {
    const result = await submitApplication.mutateAsync(data as unknown as Record<string, unknown>);

    if (!result || result.error) {
      toastMessage({
        position: 'bottom',
        closeable: false,
        message: t('economic-aid:submitError'),
        status: 'error',
      });
      return;
    }

    clearEconomicAidDraft();
    toastMessage({
      position: 'bottom',
      closeable: false,
      message: t('economic-aid:submitSuccess'),
      status: 'success',
    });
    // FIXME: ersätt med dedikerad bekräftelsesida när den finns.
    router.push(`/privat/arenden?inskickad=${encodeURIComponent(result.errandId ?? '')}`);
  });

  // Once the applicant picks a suggestion, the financial-assistance application takes over.
  const chosenTypeSlug = form.watch('chosenTypeSlug');
  if (chosenTypeSlug && isFinancialAssistanceSlug(chosenTypeSlug)) {
    const civilstand = form.getValues('hushall.civilstand');
    const maritalStatus: MaritalStatus = civilstand === 'gift' || civilstand === 'sambo' ? 'COHABITING' : 'SINGLE';
    const suggestion = (form.getValues('eligibility')?.suggestions ?? []).find(
      (item) => item.typeSlug === chosenTypeSlug,
    );
    return (
      <FinancialAssistanceApplication
        slug={chosenTypeSlug}
        maritalStatus={maritalStatus}
        civilstandChoice={civilstand ?? 'ensamstaende'}
        periodMonth={suggestion?.periodMonth ?? null}
        periodYear={suggestion?.periodYear ?? null}
        coApplicantPersonalNumber={form.getValues('hushall.medsokande.personnummer')}
        onExit={() => form.setValue('chosenTypeSlug', null)}
      />
    );
  }

  const step = ECONOMIC_AID_STEPS[currentStep];
  const StepComponent = STEP_COMPONENTS[step.key];

  return (
    <FormProvider {...form}>
      <form className="flex flex-col gap-32" onSubmit={handleSubmit} data-cy="economic-aid-form">
        <header ref={topRef} className="text-content">
          <h1>{t('economic-aid:header.title')}</h1>
          <p>{t('economic-aid:header.subtitle')}</p>
        </header>

        <CardElevated className="w-full max-w-[80rem] mx-auto p-24 desktop:p-32">
          <StepComponent
            label={t(`economic-aid:steps.${step.key}`)}
            onBack={goBack}
            onNext={goNext}
            isSubmitting={submitApplication.isPending}
          />
        </CardElevated>
      </form>
    </FormProvider>
  );
};

export default EconomicAidApplication;

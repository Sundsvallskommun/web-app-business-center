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
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ApplicationProgressStepper } from './components/application-progress-stepper.component';
// DEV ONLY — radera importen och komponenten nedan när SSBTEK-prefill finns.
import { TestPersonPicker } from './components/test-person-picker.component';
import { STEP_COMPONENTS } from './steps/step-registry';

const FIRST_STEP = 0;
const LAST_STEP = ECONOMIC_AID_STEPS.length - 1;

interface SubmitResponse {
  errandId: string;
}

export const EconomicAidApplication: React.FC = () => {
  const router = useRouter();
  const toastMessage = useSnackbar();
  const [currentStep, setCurrentStep] = useState(FIRST_STEP);

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
        message: 'Något gick fel när ansökan skulle skickas in. Försök igen senare.',
        status: 'error',
      });
      return;
    }

    clearEconomicAidDraft();
    toastMessage({
      position: 'bottom',
      closeable: false,
      message: 'Din ansökan har skickats in!',
      status: 'success',
    });
    // FIXME: ersätt med dedikerad bekräftelsesida när den finns.
    router.push(`/privat/arenden?inskickad=${encodeURIComponent(result.errandId ?? '')}`);
  });

  const step = ECONOMIC_AID_STEPS[currentStep];
  const StepComponent = STEP_COMPONENTS[step.key];

  return (
    <FormProvider {...form}>
      <form className="flex flex-col gap-32" onSubmit={handleSubmit} data-cy="economic-aid-form">
        <header className="text-content">
          <h1>Ansökan om ekonomiskt bistånd</h1>
          <p>Sundsvalls Kommun — Individ- och familjeförvaltningen</p>
        </header>

        <TestPersonPicker />

        <ApplicationProgressStepper current={currentStep} />

        <CardElevated className="w-full max-w-[80rem] mx-auto p-24 desktop:p-32">
          <StepComponent
            label={`Steg ${currentStep + 1} – ${step.label}`}
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

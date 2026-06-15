'use client';

import { CardElevated } from '@components/cards/card-elevated.component';
import {
  ApplicationType,
  FA_GROUPS_BY_TYPE,
  FinancialAssistanceFormData,
  FinancialAssistanceSlug,
  MaritalStatus,
  applicationTypeFromSlug,
  emptyFinancialAssistanceFormData,
} from '@interfaces/financial-assistance';
import { useApi } from '@services/api-service';
import { buildFinancialAssistanceData } from '@services/financial-assistance-service';
import { ProgressBar } from '@sk-web-gui/progress-bar';
import { ProgressStepper } from '@sk-web-gui/progress-stepper';
import { useSnackbar } from '@sk-web-gui/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FA_STEP_COMPONENTS } from './steps/fa-step-registry';

interface FinancialAssistanceApplicationProps {
  slug: FinancialAssistanceSlug;
  maritalStatus: MaritalStatus;
  periodMonth: number | null;
  periodYear: number | null;
  coApplicantPersonalNumber: string;
  /** Called from the first step's back button — returns to the suggestion step. */
  onExit: () => void;
}

interface CreateResponse {
  errandId: string;
}

/**
 * Grouped wizard for a financial-assistance application. Groups are gated per
 * applicationType (derived from the slug). Submits the typed payload to
 * /economic-aid/applications/{slug}; the backend forwards it to caremanagement.
 */
export const FinancialAssistanceApplication: React.FC<FinancialAssistanceApplicationProps> = ({
  slug,
  maritalStatus,
  periodMonth,
  periodYear,
  coApplicantPersonalNumber,
  onExit,
}) => {
  const { t } = useTranslation('financial-assistance');
  const router = useRouter();
  const toastMessage = useSnackbar();

  const applicationType: ApplicationType = applicationTypeFromSlug(slug);
  const groups = FA_GROUPS_BY_TYPE[applicationType];
  const [current, setCurrent] = useState(0);

  const form = useForm<FinancialAssistanceFormData>({
    defaultValues: emptyFinancialAssistanceFormData({
      maritalStatus,
      periodMonth,
      periodYear,
      applicantPersonalNumber: '',
      coApplicantPersonalNumber,
    }),
    mode: 'onChange',
  });

  const create = useApi<CreateResponse>({ url: `/economic-aid/applications/${slug}`, method: 'post' });

  const goNext = () => setCurrent((step) => Math.min(step + 1, groups.length - 1));
  const goBack = () => (current === 0 ? onExit() : setCurrent((step) => step - 1));

  const handleCreate = form.handleSubmit(async (values) => {
    const data = buildFinancialAssistanceData(values, applicationType);
    const result = await create.mutateAsync({ title: t('financial-assistance:header.title'), data });

    if (!result || result.error) {
      toastMessage({
        position: 'bottom',
        closeable: false,
        status: 'error',
        message: t('financial-assistance:submitError'),
      });
      return;
    }

    toastMessage({
      position: 'bottom',
      closeable: false,
      status: 'success',
      message: t('financial-assistance:submitSuccess'),
    });
    router.push(`/privat/arenden?inskickad=${encodeURIComponent(result.errandId ?? '')}`);
  });

  const groupKey = groups[current];
  const StepComponent = FA_STEP_COMPONENTS[groupKey];
  const labels = groups.map((group) => t(`financial-assistance:groups.${group}`));
  const total = groups.length;
  const stepLabel = `${t('financial-assistance:stepOf', { current: current + 1, total })} – ${labels[current]}`;

  return (
    <FormProvider {...form}>
      <form className="flex flex-col gap-32" onSubmit={handleCreate} data-cy="financial-assistance-form">
        <header className="text-content">
          <h1>{t('financial-assistance:header.title')}</h1>
          <p>{t(`financial-assistance:type.${applicationType}`)}</p>
        </header>

        <div data-cy="fa-stepper">
          <div className="desktop:hidden flex flex-col gap-12" aria-hidden="true">
            <p className="text-small text-dark-secondary">
              {t('financial-assistance:stepOf', { current: current + 1, total })}
            </p>
            <p className="font-bold">{labels[current]}</p>
            <ProgressBar steps={total} current={current + 1} color="vattjom" size="sm" />
          </div>
          <div className="hidden desktop:block">
            <ProgressStepper steps={labels} current={current} labelPosition="bottom" size="sm" />
          </div>
        </div>

        <CardElevated className="w-full max-w-[80rem] mx-auto p-24 desktop:p-32">
          <StepComponent
            label={stepLabel}
            applicationType={applicationType}
            onBack={goBack}
            onNext={goNext}
            isSubmitting={create.isPending}
          />
        </CardElevated>
      </form>
    </FormProvider>
  );
};

export default FinancialAssistanceApplication;

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
import { apiService, useApi } from '@services/api-service';
import { buildFinancialAssistanceData } from '@services/financial-assistance-service';
import { toBase64 } from '@utils/toBase64';
import { ProgressBar } from '@sk-web-gui/progress-bar';
import { ProgressStepper } from '@sk-web-gui/progress-stepper';
import { UploadFile, useSnackbar } from '@sk-web-gui/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FaBankidMock } from './components/fa-bankid-mock.component';
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

/** Uploads the selected files to the newly created errand. Best-effort — returns false on failure. */
const uploadAttachments = async (errandId: string, attachments: UploadFile[]): Promise<boolean> => {
  if (!errandId || attachments.length === 0) return true;
  try {
    const formData = new FormData();
    await Promise.all(
      attachments.map(async (file) => {
        if (!(file.file instanceof Blob)) return;
        const base64 = await toBase64(file.file);
        const buffer = Buffer.from(base64, 'base64');
        const blob = new Blob([buffer], { type: file.file.type });
        formData.append('files', blob, `${file.meta.name}.${file.meta.ending}`);
      }),
    );
    await apiService.post(`/economic-aid/applications/${errandId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return true;
  } catch {
    return false;
  }
};

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
  const isCohabiting = maritalStatus === 'COHABITING';
  const [signOpen, setSignOpen] = useState(false);

  const goNext = () => setCurrent((step) => Math.min(step + 1, groups.length - 1));
  const goBack = () => (current === 0 ? onExit() : setCurrent((step) => step - 1));

  // Submit validerar formuläret och öppnar BankID-signeringen (mock). Signeringen krävs av
  // sökande och, vid gift/sambo, medsökande innan ärendet skapas.
  const openSign = form.handleSubmit(() => setSignOpen(true));

  // Körs när signeringen är "klar" (mock) — skapar ärendet och laddar upp bilagor.
  const runCreate = async () => {
    const values = form.getValues();
    const data = buildFinancialAssistanceData(values, applicationType);
    const result = await create.mutateAsync({ title: t('financial-assistance:header.title'), data });

    if (!result || result.error) {
      setSignOpen(false);
      toastMessage({
        position: 'bottom',
        closeable: false,
        status: 'error',
        message: t('financial-assistance:submitError'),
      });
      return;
    }

    // Errand created — upload attachments to it (best-effort; can be completed later via messages).
    const errandId = result.errandId ?? '';
    const attachmentsOk = await uploadAttachments(errandId, values.attachments);

    setSignOpen(false);
    toastMessage({
      position: 'bottom',
      closeable: false,
      status: attachmentsOk ? 'success' : 'error',
      message: attachmentsOk
        ? t('financial-assistance:submitSuccess')
        : t('financial-assistance:attachmentsError'),
    });
    router.push(`/privat/arenden?inskickad=${encodeURIComponent(errandId)}`);
  };

  const groupKey = groups[current];
  const StepComponent = FA_STEP_COMPONENTS[groupKey];
  const labels = groups.map((group) => t(`financial-assistance:groups.${group}`));
  const total = groups.length;
  const stepLabel = `${t('financial-assistance:stepOf', { current: current + 1, total })} – ${labels[current]}`;

  return (
    <FormProvider {...form}>
      <form className="flex flex-col gap-32" onSubmit={openSign} data-cy="financial-assistance-form">
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

      <FaBankidMock
        show={signOpen}
        label={t('financial-assistance:bankid.submitLabel')}
        description={
          isCohabiting
            ? t('financial-assistance:bankid.submitDescriptionBoth')
            : t('financial-assistance:bankid.submitDescription')
        }
        confirmLabel={t('financial-assistance:bankid.submitConfirm')}
        confirmLoading={create.isPending}
        onClose={() => setSignOpen(false)}
        onConfirm={runCreate}
      />
    </FormProvider>
  );
};

export default FinancialAssistanceApplication;

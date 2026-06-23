'use client';

import { CardElevated } from '@components/cards/card-elevated.component';
import {
  ApplicationType,
  CivilstandChoice,
  FA_GROUPS_BY_TYPE,
  FinancialAssistanceFormData,
  FinancialAssistanceSlug,
  MaritalStatus,
  applicationTypeFromSlug,
  emptyFinancialAssistanceFormData,
} from '@interfaces/financial-assistance';
import { apiService } from '@services/api-service';
import { clearEconomicAidDraft } from '@services/economic-aid-service';
import { buildFinancialAssistanceData } from '@services/financial-assistance-service';
import { buildApplicationPdfSummary } from '@services/financial-assistance-pdf-summary';
import { ProgressBar } from '@sk-web-gui/progress-bar';
import { ProgressStepper } from '@sk-web-gui/progress-stepper';
import { useSnackbar } from '@sk-web-gui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FaBankidMock } from './components/fa-bankid-mock.component';
import { FA_STEP_COMPONENTS } from './steps/fa-step-registry';

interface FinancialAssistanceApplicationProps {
  slug: FinancialAssistanceSlug;
  maritalStatus: MaritalStatus;
  civilstandChoice: CivilstandChoice;
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
  civilstandChoice,
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

  // Scrolla upp till formulärets topp vid stegbyte (Nästa/Tillbaka), men inte vid första render.
  const topRef = useRef<HTMLElement>(null);
  const isInitialRender = useRef(true);
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [current]);

  const form = useForm<FinancialAssistanceFormData>({
    defaultValues: emptyFinancialAssistanceFormData({
      maritalStatus,
      civilstandChoice,
      periodMonth,
      periodYear,
      applicantPersonalNumber: '',
      coApplicantPersonalNumber,
    }),
    mode: 'onChange',
  });

  const isCohabiting = maritalStatus === 'COHABITING';
  const [signOpen, setSignOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const goNext = () => setCurrent((step) => Math.min(step + 1, groups.length - 1));
  const goBack = () => (current === 0 ? onExit() : setCurrent((step) => step - 1));

  // Submit validerar formuläret och öppnar BankID-signeringen (mock). Signeringen krävs av
  // sökande och, vid gift/sambo, medsökande innan ärendet skapas.
  const openSign = form.handleSubmit(() => setSignOpen(true));

  // Körs när signeringen är "klar" (mock) — skapar ärendet med bilagorna i samma multipart-anrop.
  // Bilagorna skickas som "files"; payloaden (titel + data) som ett JSON-fält. caremanagement
  // sparar varje fil som egen bilaga och genererar dessutom en sammanslagen PDF.
  const runCreate = async () => {
    const values = form.getValues();
    const data = buildFinancialAssistanceData(values, applicationType);
    // Läsbar sammanställning (frågor/svar + personer + barn) som backend renderar till en PDF-bilaga.
    const summary = buildApplicationPdfSummary(values, applicationType, t);

    const formData = new FormData();
    // Titeln sätts server-side utifrån vald slug — skicka bara med data + sammanställning.
    formData.append('payload', JSON.stringify({ data, summary }));
    values.attachments.forEach((file) => {
      if (file.file instanceof Blob) {
        formData.append('files', file.file, `${file.meta.name}.${file.meta.ending}`);
      }
    });

    setCreating(true);
    try {
      const response = await apiService.post<{ data: CreateResponse }>(
        `/economic-aid/applications/${slug}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      setSignOpen(false);
      toastMessage({
        position: 'bottom',
        closeable: false,
        status: 'success',
        message: t('financial-assistance:submitSuccess'),
      });
      const errandId = response.data?.data?.errandId ?? '';
      clearEconomicAidDraft();
      router.push(`/privat/arenden?inskickad=${encodeURIComponent(errandId)}`);
    } catch {
      toastMessage({
        position: 'bottom',
        closeable: false,
        status: 'error',
        message: t('financial-assistance:submitError'),
      });
    } finally {
      setCreating(false);
    }
  };

  const groupKey = groups[current];
  const StepComponent = FA_STEP_COMPONENTS[groupKey];
  const labels = groups.map((group) => t(`financial-assistance:groups.${group}`));
  const total = groups.length;
  const stepLabel = `${t('financial-assistance:stepOf', { current: current + 1, total })} – ${labels[current]}`;

  return (
    <FormProvider {...form}>
      <form className="flex flex-col gap-32" onSubmit={openSign} data-cy="financial-assistance-form">
        <header ref={topRef} className="text-content">
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
            isSubmitting={creating}
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
        confirmLoading={creating}
        onClose={() => setSignOpen(false)}
        onConfirm={runCreate}
      />
    </FormProvider>
  );
};

export default FinancialAssistanceApplication;

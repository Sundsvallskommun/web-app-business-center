import { ApplicationType, FinancialAssistanceFormData } from '@interfaces/financial-assistance';
import {
  ApplicationPdfRow,
  ApplicationPdfSection,
  buildApplicationPdfSummary,
} from '@services/financial-assistance-pdf-summary';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useApplicantIdentities } from './use-applicant-identities';

interface FaReviewSummaryProps {
  applicationType: ApplicationType;
}

/** One question/answer row — label (with the form's help text) on the left, the answer on the right. */
const SummaryRow: React.FC<{ row: ApplicationPdfRow }> = ({ row }) => (
  <div className="flex flex-col desktop:flex-row desktop:gap-12 py-6 border-b border-divider">
    <dt className="desktop:basis-[45%] desktop:shrink-0 text-dark-secondary">
      <span>{row.label}</span>
      {row.info ? <span className="block text-small italic mt-2">{row.info}</span> : null}
    </dt>
    <dd className="font-bold">{row.value}</dd>
  </div>
);

const SummarySection: React.FC<{ section: ApplicationPdfSection }> = ({ section }) => (
  <section className="flex flex-col gap-4">
    {section.heading ? <h4 className="text-h5-md font-bold">{section.heading}</h4> : null}
    {section.info ? <p className="text-small italic text-dark-secondary whitespace-pre-line">{section.info}</p> : null}
    {section.rows.length ? (
      <dl className="flex flex-col">
        {section.rows.map((row, index) => (
          <SummaryRow key={index} row={row} />
        ))}
      </dl>
    ) : null}
  </section>
);

/**
 * Read-only recap shown before submit. Built from the SAME serializer as the attached PDF
 * ({@link buildApplicationPdfSummary}) so the preview and the PDF show identical questions,
 * answers and help texts. Person identity (personnummer/folkbokföringsadress) and the signatures
 * are added by the backend for the PDF and are not part of this on-screen preview.
 */
export const FaReviewSummary: React.FC<FaReviewSummaryProps> = ({ applicationType }) => {
  const { t } = useTranslation('financial-assistance');
  const { watch } = useFormContext<FinancialAssistanceFormData>();
  const values = watch();
  const isCohabiting = values.maritalStatus === 'COHABITING';
  const coApplicantPersonalNumber = values.persons.find((person) => person.role === 'CO_APPLICANT')?.personalNumber ?? '';
  const identities = useApplicantIdentities({ isCohabiting, coApplicantPersonalNumber });
  const summary = buildApplicationPdfSummary(values, applicationType, t, identities);

  return (
    <div className="flex flex-col gap-24 text-content" data-cy="fa-review-summary">
      {summary.groups.map((group) => (
        <div key={group.heading} className="flex flex-col gap-12">
          <h3 className="text-h4-md font-bold border-b border-divider pb-4">{group.heading}</h3>
          {group.sections.map((section, index) => (
            <SummarySection key={index} section={section} />
          ))}
        </div>
      ))}
    </div>
  );
};

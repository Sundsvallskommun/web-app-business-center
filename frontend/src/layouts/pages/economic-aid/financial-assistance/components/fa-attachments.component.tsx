import { ApplicationType, FinancialAssistanceFormData } from '@interfaces/financial-assistance';
import { requiredDocumentLabel, requiredDocumentsHeading } from '@services/financial-assistance-labels';
import { RequiredDocument, asksNeedsAttachments, getRequiredDocuments } from '@services/financial-assistance-required-documents';
import {
  CustomOnChangeEventUploadFile,
  FileUpload,
  FormControl,
  FormLabel,
  RadioButton,
  useSnackbar,
} from '@sk-web-gui/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useApplicantNames } from './use-applicant-names';

// Tillåtna filtyper för bilagor: PDF, Word (doc/docx), JPG/JPEG och PNG. Matchas mot filens MIME-typ.
const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

interface FaAttachmentsProps {
  applicationType: ApplicationType;
}

/**
 * Bilagor på utbetalningssteget, per ansökningstyp:
 * - Nyansökan: alltid uppladdning, med generella underlag, underlag utifrån svaren och
 *   planeringsunderlag (ingen fråga om bilagor).
 * - Återansökan: kräver svaren underlag visas listan och uppladdningen direkt; annars frågan
 *   "Behöver du bifoga några bilagor?".
 * - Tilläggsansökan: frågan om underlag.
 * Texterna växlar du→ni vid medsökande, och rubriken namnger båda personerna.
 *
 * FileUpload hanteras via onChange + setValue (samma mönster som den delade komponenten i katla) —
 * inte register, som inte ger Area:n filerna.
 */
export const FaAttachments: React.FC<FaAttachmentsProps> = ({ applicationType }) => {
  const { t } = useTranslation('financial-assistance');
  const toastMessage = useSnackbar();
  const { watch, setValue } = useFormContext<FinancialAssistanceFormData>();
  const { isCohabiting, nameForRole } = useApplicantNames();

  const isNew = applicationType === 'NEW';
  const isRenewal = applicationType === 'RENEWAL';
  const ni = isCohabiting ? { context: 'ni' } : undefined;
  const requiredDocuments = getRequiredDocuments(watch(), applicationType);
  const attachments = watch('attachments');
  const needsAttachments = watch('needsAttachments');
  const askNeedsAttachments = asksNeedsAttachments(applicationType, requiredDocuments);
  const showUpload = isNew || requiredDocuments.length > 0 || needsAttachments === true;

  const asList = (key: string): string[] => {
    const value = t(`financial-assistance:attachments.${key}`, { returnObjects: true, ...ni });
    return Array.isArray(value) ? (value as string[]) : [];
  };

  const requiredHeading = requiredDocumentsHeading(t, nameForRole('APPLICANT'), nameForRole('CO_APPLICANT'));

  // Läkarintyg m.fl. gäller en person — namnge personen när man ansöker tillsammans.
  const documentLabel = (document: RequiredDocument): string =>
    requiredDocumentLabel(t, document, isCohabiting, document.role ? nameForRole(document.role) : null);

  const renderList = (items: string[]) => (
    <ul className="list-disc flex flex-col gap-4 pl-20">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );

  const handleChange = (event: CustomOnChangeEventUploadFile) => {
    if (event.target.value !== null) {
      setValue('attachments', attachments.concat(event.target.value), { shouldDirty: true });
    }
  };

  // Visar ett felmeddelande när en otillåten filtyp (eller för stor fil) väljs.
  const handleInvalid = () =>
    toastMessage({
      position: 'bottom',
      closeable: false,
      status: 'error',
      message: t('financial-assistance:attachments.fileTypeError'),
    });

  const removeAttachment = (index: number) =>
    setValue(
      'attachments',
      attachments.filter((_, current) => current !== index),
      { shouldDirty: true }
    );

  return (
    <section className="flex flex-col gap-16" data-cy="fa-attachments">
      <h3 className="text-h4-md font-bold">{t('financial-assistance:attachments.heading')}</h3>

      {isNew || isRenewal ? <p className="text-content">{t('financial-assistance:attachments.intro', ni)}</p> : null}

      {/* Nyansökan: generella underlag, underlag utifrån svaren och planeringsunderlag. */}
      {isNew ? (
        <div className="text-content flex flex-col gap-12" data-cy="fa-attachments-reference">
          <div className="flex flex-col gap-8">
            <p className="font-bold">{requiredHeading}</p>
            {renderList(asList('generalDocs'))}
          </div>
          {requiredDocuments.length > 0 ? (
            <div className="flex flex-col gap-8" data-cy="fa-attachments-required">
              <p className="font-bold">{t('financial-assistance:attachments.answersHeading', ni)}</p>
              {renderList(requiredDocuments.map(documentLabel))}
            </div>
          ) : null}
          <div className="flex flex-col gap-8">
            <p className="font-bold">{t('financial-assistance:attachments.planningHeading')}</p>
            {renderList(asList('planningDocs'))}
          </div>
        </div>
      ) : null}

      {/* Återansökan: underlag som svaren kräver. */}
      {!isNew && requiredDocuments.length > 0 ? (
        <div className="text-content flex flex-col gap-8" data-cy="fa-attachments-required">
          <p className="font-bold">{requiredHeading}</p>
          {renderList(requiredDocuments.map(documentLabel))}
        </div>
      ) : null}

      {askNeedsAttachments ? (
        <FormControl data-cy="fa-needs-attachments">
          <FormLabel className="font-bold">{t('financial-assistance:attachments.needLabel', ni)}</FormLabel>
          <RadioButton.Group>
            <RadioButton
              size="sm"
              name="fa-needs-attachments"
              id="fa-needs-attachments-no"
              checked={needsAttachments === false}
              onChange={() => {}}
              onClick={() => setValue('needsAttachments', false, { shouldDirty: true })}
            >
              {t('financial-assistance:attachments.no')}
            </RadioButton>
            <RadioButton
              size="sm"
              name="fa-needs-attachments"
              id="fa-needs-attachments-yes"
              checked={needsAttachments === true}
              onChange={() => {}}
              onClick={() => setValue('needsAttachments', true, { shouldDirty: true })}
            >
              {t(isRenewal ? 'financial-assistance:attachments.yesRenewal' : 'financial-assistance:attachments.yes')}
            </RadioButton>
          </RadioButton.Group>
        </FormControl>
      ) : null}

      {showUpload ? (
        <div className="flex flex-col gap-12">
          <FileUpload.Field
            className="w-full"
            variant="horizontal"
            name="attachments"
            maxFileSizeMB={25}
            accept={ACCEPTED_MIME_TYPES}
            onChange={handleChange}
            onInvalid={handleInvalid}
          />
          <p className="text-small text-dark-secondary">{t('financial-assistance:attachments.maxSize')}</p>
          <p className="text-small text-dark-secondary">{t('financial-assistance:attachments.acceptedTypes')}</p>
          {attachments.length ? (
            <FileUpload.List name="attachments" showBorder>
              {attachments.map((file, index) => (
                <FileUpload.ListItem
                  className="break-all"
                  key={`${file?.meta.name}-${index}`}
                  index={index}
                  file={file}
                  actionsProps={{ showRemove: true, onRemove: () => removeAttachment(index) }}
                />
              ))}
            </FileUpload.List>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};

import { FinancialAssistanceFormData } from '@interfaces/financial-assistance';
import { getRequiredDocuments } from '@services/financial-assistance-required-documents';
import {
  CustomOnChangeEventUploadFile,
  FileUpload,
  FormControl,
  FormLabel,
  RadioButton,
} from '@sk-web-gui/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

/**
 * Bilagor på utbetalningssteget. Om gjorda val kräver underlag visas en lista
 * ("Du behöver bifoga följande"); annars frågan "Behöver du bifoga några bilagor?".
 *
 * FileUpload.Area är en drag-and-drop-yta som omsluter innehållet; FileUpload.Button
 * ger klick-för-att-bläddra. Fältet hanteras via onChange + setValue (samma mönster som
 * den delade komponenten i katla) — inte register, som inte ger Area:n filerna.
 */
export const FaAttachments: React.FC = () => {
  const { t } = useTranslation('financial-assistance');
  const { watch, setValue } = useFormContext<FinancialAssistanceFormData>();

  const requiredDocuments = getRequiredDocuments(watch());
  const attachments = watch('attachments');
  const needsAttachments = watch('needsAttachments');
  const ni = watch('maritalStatus') === 'COHABITING' ? { context: 'ni' } : undefined;
  const showUpload = requiredDocuments.length > 0 || needsAttachments === true;

  const handleChange = (event: CustomOnChangeEventUploadFile) => {
    if (event.target.value !== null) {
      setValue('attachments', attachments.concat(event.target.value), { shouldDirty: true });
    }
  };

  const removeAttachment = (index: number) =>
    setValue(
      'attachments',
      attachments.filter((_, current) => current !== index),
      { shouldDirty: true },
    );

  return (
    <section className="flex flex-col gap-16" data-cy="fa-attachments">
      <h3 className="text-h4-md font-bold">{t('financial-assistance:attachments.heading')}</h3>

      {requiredDocuments.length > 0 ? (
        <div className="text-content flex flex-col gap-8">
          <p className="font-bold">{t('financial-assistance:attachments.requiredHeading')}</p>
          <ul className="list-disc flex flex-col gap-4 pl-20">
            {requiredDocuments.map((id) => (
              <li key={id}>{t(`financial-assistance:attachments.docs.${id}`)}</li>
            ))}
          </ul>
        </div>
      ) : (
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
              {t('financial-assistance:attachments.yes')}
            </RadioButton>
          </RadioButton.Group>
        </FormControl>
      )}

      {showUpload ? (
        <div className="flex flex-col gap-12">
          <FileUpload.Field
            className="w-full"
            variant="horizontal"
            name="attachments"
            maxFileSizeMB={25}
            onChange={handleChange}
          />
          <p className="text-small text-dark-secondary">{t('financial-assistance:attachments.maxSize')}</p>
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

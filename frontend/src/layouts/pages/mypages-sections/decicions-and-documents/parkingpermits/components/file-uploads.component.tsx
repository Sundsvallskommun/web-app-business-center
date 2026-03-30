import { FileUpload, FormControl, FormHelperText, FormLabel } from '@sk-web-gui/react';
import { ACCEPTED_UPLOAD_FILETYPES } from '@services/asset-service';
import { UseFormReturn } from 'react-hook-form';
import { PermitFormModel } from '../parkingpermit-form.types';
import { MAX_FILE_SIZE_MB } from '../parkingpermit-form.constants';

interface FileUploadsProps {
  form: UseFormReturn<PermitFormModel>;
  showMedicalFileUpload: boolean;
}

export const FileUploads = ({ form, showMedicalFileUpload }: FileUploadsProps) => {
  const filesMedical = form.watch('files_medical');
  const filesPassport = form.watch('files_passport');
  const filesSignature = form.watch('files_signature');
  const signingAbility = form.watch('application_applicant_signingAbility');

  return (
    <>
      {showMedicalFileUpload && (
        <FormControl className="w-full">
          <FormLabel>Bifoga läkarintyg</FormLabel>
          <FormHelperText className="mb-12">Tillåtna filtyper: PDF, Word, JPEG. Max filstorlek: 25 MB</FormHelperText>
          {filesMedical && filesMedical.length > 0 ? (
            <FileUpload.List name="files_medical">
              {filesMedical.map((file, i) => (
                <FileUpload.ListItem
                  key={file.id}
                  index={i}
                  file={file}
                  categoryProps={{
                    categories: { MEDICAL_CONFIRMATION: 'Läkarintyg' },
                  }}
                  actionsProps={{
                    showRemove: true,
                    onRemove: () =>
                      form.setValue(
                        'files_medical',
                        form.watch('files_medical').filter((f) => f !== file)
                      ),
                  }}
                />
              ))}
            </FileUpload.List>
          ) : (
            <FileUpload.Field
              className="inline-block w-full"
              accept={ACCEPTED_UPLOAD_FILETYPES}
              variant="horizontal"
              name="files_medical"
              maxFileSizeMB={MAX_FILE_SIZE_MB}
              onChange={(e) => {
                form.setValue('files_medical', e.target.value);
              }}
            />
          )}
        </FormControl>
      )}

      <FormControl className="w-full">
        <FormLabel>Bifoga passfoto</FormLabel>
        <FormHelperText className="mb-12">Tillåtna filtyper: PDF, Word, JPEG. Max filstorlek: 25 MB</FormHelperText>
        {filesPassport && filesPassport.length > 0 ? (
          <FileUpload.List name="files_passport">
            {filesPassport.map((file, i) => (
              <FileUpload.ListItem
                key={file.id}
                index={i}
                file={file}
                categoryProps={{
                  categories: { PASSPORT_PHOTO: 'Passfoto' },
                }}
                actionsProps={{
                  showRemove: true,
                  onRemove: () =>
                    form.setValue(
                      'files_passport',
                      form.watch('files_passport').filter((f) => f !== file)
                    ),
                }}
              />
            ))}
          </FileUpload.List>
        ) : (
          <FileUpload.Field
            className="inline-block w-full"
            accept={ACCEPTED_UPLOAD_FILETYPES}
            variant="horizontal"
            name="files_passport"
            maxFileSizeMB={MAX_FILE_SIZE_MB}
            onChange={(e) => {
              form.setValue('files_passport', e.target.value);
            }}
          />
        )}
      </FormControl>

      {signingAbility === 'true' && (
        <FormControl className="w-full">
          <FormLabel>Bifoga namnteckning</FormLabel>
          <FormHelperText className="mb-12">Tillåtna filtyper: PDF, Word, JPEG. Max filstorlek: 25 MB</FormHelperText>
          {filesSignature && filesSignature.length > 0 ? (
            <FileUpload.List name="files_signature">
              {filesSignature.map((file, i) => (
                <FileUpload.ListItem
                  key={file.id}
                  index={i}
                  file={file}
                  categoryProps={{
                    categories: { SIGNATURE: 'Namnteckning' },
                  }}
                  actionsProps={{
                    showRemove: true,
                    onRemove: () =>
                      form.setValue(
                        'files_signature',
                        form.watch('files_signature').filter((f) => f !== file)
                      ),
                  }}
                />
              ))}
            </FileUpload.List>
          ) : (
            <FileUpload.Field
              className="inline-block w-full"
              accept={ACCEPTED_UPLOAD_FILETYPES}
              variant="horizontal"
              name="files_signature"
              maxFileSizeMB={MAX_FILE_SIZE_MB}
              onChange={(e) => {
                form.setValue('files_signature', e.target.value);
              }}
            />
          )}
        </FormControl>
      )}
    </>
  );
};

import { yupResolver } from '@hookform/resolvers/yup';
import { useApi } from '@services/api-service';
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  RadioButton,
  UploadFile,
  useConfirm,
  useSnackbar,
} from '@sk-web-gui/react';
import { toBase64 } from '@utils/toBase64';
import { ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { Resolver, useForm } from 'react-hook-form';

// Types
import { ExtraParameter, PermitFormMode, PermitFormModel } from './parkingpermit-form.types';
export type { PermitFormMode, ExtraParameter } from './parkingpermit-form.types';

// Schema and utilities
import { createFormSchema } from './parkingpermit-form.schema';
import { extraParametersToFormValues, formToExtraParameters, getDefaultFormValues } from './parkingpermit-form.utils';

// Field group components
import { DisabilityFields } from './components/disability-fields.component';
import { ConsentFields } from './components/consent-fields.component';
import {
  ChangedCircumstancesField,
  ExpirationDateField,
  MedicalConfirmationRequiredField,
} from './components/renewal-fields.component';
import { FileUploads } from './components/file-uploads.component';

export const MAX_FILE_SIZE_MB = 50;

interface ParkingPermitFormProps {
  mode: PermitFormMode;
  setFormState: React.Dispatch<React.SetStateAction<'showForm' | 'showInfo' | 'success'>>;
  errandData?: ExtraParameter[];
  errandNumber?: string;
  assetValidTo?: string;
}

export const ParkingPermitForm = ({
  mode,
  setFormState,
  errandData,
  errandNumber,
  assetValidTo,
}: ParkingPermitFormProps) => {
  const confirm = useConfirm();
  const toastMessage = useSnackbar();

  const form = useForm<PermitFormModel>({
    resolver: yupResolver(createFormSchema(mode)) as Resolver<PermitFormModel>,
    defaultValues: getDefaultFormValues(),
    mode: 'onChange',
  });

  // Prepopulate form when errand data is loaded or asset validTo is available
  useEffect(() => {
    const formValues: Partial<PermitFormModel> = {};

    // Prepopulate from errand extraParameters if available
    if (errandData && Array.isArray(errandData) && errandData.length > 0) {
      Object.assign(formValues, extraParametersToFormValues(errandData));
    }

    // Prepopulate expiration date from asset validTo (if not already set from errand data) - renewal only
    if (mode === 'renewal' && assetValidTo && !formValues.application_renewal_expirationDate) {
      formValues.application_renewal_expirationDate = assetValidTo;
    }

    // Only reset if we have values to prepopulate
    if (Object.keys(formValues).length > 0) {
      form.reset({
        ...form.getValues(),
        ...formValues,
        files_medical: [],
        files_passport: [],
        files_signature: [],
      });
    }
  }, [errandData, assetValidTo, form, mode]);

  // Mode-aware API endpoint
  const endpoint = mode === 'new' ? '/assets/parkingpermit/new' : '/assets/parkingpermit/extend';

  const registerErrand = useApi<unknown>({
    url: endpoint,
    method: 'post',
    axiosParameters: { headers: { 'Content-Type': 'multipart/form-data' } },
  });

  // Mode-aware UI text
  const confirmTitle = mode === 'new' ? 'Ansök om parkeringstillstånd?' : 'Ansök om förlängning?';

  const confirmMessage =
    mode === 'new'
      ? 'Vill du skicka in ansökan om parkeringstillstånd?'
      : 'Vill du skicka in ansökan om förlängning av parkeringstillstånd?';

  const successMessage =
    mode === 'new' ? 'Din ansökan har skickats in!' : 'Din ansökan om förlängning har skickats in!';

  const onSubmit = async (data: PermitFormModel) => {
    const confirmed = await confirm.showConfirmation(confirmTitle, confirmMessage, 'Ja', 'Nej', 'info');
    if (confirmed) {
      const formData = new FormData();

      // Convert form data to extraParameters array and append as JSON
      const extraParameters = formToExtraParameters(data, mode, errandNumber);
      formData.append('extraParameters', JSON.stringify(extraParameters));

      // Helper to append files with category prefix
      const appendFiles = async (files: UploadFile[], category: string) => {
        await Promise.all(
          files.map(async (file) => {
            if (file.file instanceof Blob) {
              const fileData = await toBase64(file.file);
              const buf = Buffer.from(fileData, 'base64');
              const blob = new Blob([buf], { type: file.file.type });
              formData.append('files', blob, `${category}__${file.meta.name}.${file.meta.ending}`);
            }
          })
        );
      };

      try {
        if (data.files_medical.length) {
          await appendFiles(data.files_medical, 'MEDICAL_CONFIRMATION');
        }
        if (data.files_passport.length) {
          await appendFiles(data.files_passport, 'PASSPORT_PHOTO');
        }
        if (data.files_signature.length) {
          await appendFiles(data.files_signature, 'SIGNATURE');
        }
      } catch {
        // File processing error - continue with submission
      }

      try {
        await registerErrand.mutateAsync(formData);
        form.reset();
        toastMessage({
          position: 'bottom',
          closeable: false,
          message: successMessage,
          status: 'success',
        });
        setFormState('success');
      } catch {
        toastMessage({
          position: 'bottom',
          closeable: false,
          message: 'Något gick fel när ansökan skulle skickas in. Försök igen senare.',
          status: 'error',
        });
      }
    }
  };

  const changedCircumstances = form.watch('application_renewal_changedCircumstances');
  const signingAbility = form.watch('application_applicant_signingAbility');
  const medicalConfirmationRequired = form.watch('application_renewal_medicalConfirmationRequired');

  // For NEW applications: always show all disability fields
  // For RENEWAL: show based on changedCircumstances answer
  const showDisabilityFields = mode === 'new' || changedCircumstances === 'Y';

  // Show medical file upload for new applications or when renewal requires new medical confirmation
  const showMedicalFileUpload = mode === 'new' || medicalConfirmationRequired === 'yes';

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-40">
      {mode === 'renewal' && <ChangedCircumstancesField form={form} />}

      {showDisabilityFields && (
        <>
          <DisabilityFields form={form} />
          <ConsentFields form={form} />
        </>
      )}

      {mode === 'renewal' && (
        <>
          <ExpirationDateField form={form} />
          <MedicalConfirmationRequiredField form={form} />
        </>
      )}

      <FormControl invalid={!!form.formState.errors.application_applicant_signingAbility}>
        <FormLabel className="mb-12">Kan den sökande signera med sin namnteckning?</FormLabel>
        <RadioButton.Group inline>
          <RadioButton
            data-cy="signing-ability-true"
            size="sm"
            className="mr-sm"
            name="application_applicant_signingAbility"
            id="signing-ability-true"
            value="true"
            checked={signingAbility === 'true'}
            onChange={() => {}}
            onClick={() => form.setValue('application_applicant_signingAbility', 'true', { shouldValidate: true })}
          >
            Ja
          </RadioButton>
          <RadioButton
            data-cy="signing-ability-false"
            size="sm"
            className="mr-sm"
            name="application_applicant_signingAbility"
            id="signing-ability-false"
            value="false"
            checked={signingAbility === 'false'}
            onChange={() => {}}
            onClick={() => form.setValue('application_applicant_signingAbility', 'false', { shouldValidate: true })}
          >
            Nej
          </RadioButton>
        </RadioButton.Group>
        {form.formState.errors.application_applicant_signingAbility && (
          <FormErrorMessage className="text-error">
            {form.formState.errors.application_applicant_signingAbility.message}
          </FormErrorMessage>
        )}
      </FormControl>

      <FileUploads form={form} showMedicalFileUpload={showMedicalFileUpload} />

      <div className="flex flex-col desktop:flex-row gap-x-24 gap-y-20 desktop:items-center mt-40">
        <Button size="lg" variant="secondary" onClick={() => setFormState('showInfo')}>
          Avbryt
        </Button>
        <Button
          size="lg"
          color="vattjom"
          rightIcon={<ArrowRight />}
          type="submit"
          loading={registerErrand.isPending}
          loadingText="Sparar"
        >
          Skicka in
        </Button>
      </div>
    </form>
  );
};

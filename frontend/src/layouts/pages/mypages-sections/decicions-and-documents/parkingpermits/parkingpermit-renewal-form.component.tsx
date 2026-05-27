import { useApi } from '@services/api-service';
import { ACCEPTED_UPLOAD_FILETYPES } from '@utils/accepted-file-types';
import {
  Button,
  Checkbox,
  FileUpload,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  RadioButton,
  UploadFile,
  useConfirm,
  useSnackbar,
} from '@sk-web-gui/react';
import { toBase64 } from '@utils/toBase64';
import { ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const MAX_FILE_SIZE_MB = 50;

interface PermitRenewalFormModel {
  description: string;
  circumstancesChanged: string;
  date: string;
  walkingAids: string[];
  files: UploadFile[];
}

export const ParkingPermitRenewalForm = ({
  setFormState,
}: {
  setFormState: React.Dispatch<React.SetStateAction<'showForm' | 'showInfo' | 'success'>>;
}) => {
  const { t } = useTranslation('decisions');
  const confirm = useConfirm();
  const toastMessage = useSnackbar();

  const walkingAids = [
    { label: t('decisions:parkingPermit.renewal.form.walkingAids.rollator'), value: 'Rullator' },
    { label: t('decisions:parkingPermit.renewal.form.walkingAids.electricWheelchair'), value: 'Elrullstol' },
    { label: t('decisions:parkingPermit.renewal.form.walkingAids.crutch'), value: 'Krycka/kryckor/käpp' },
    { label: t('decisions:parkingPermit.renewal.form.walkingAids.manualWheelchair'), value: 'Rullstol (manuell)' },
  ];

  const form = useForm<PermitRenewalFormModel>({
    defaultValues: {
      description: '',
      circumstancesChanged: 'TRUE',
      date: '',
      walkingAids: [],
      files: [],
    },
    mode: 'onChange',
  });

  const registerErrand = useApi<unknown>({
    url: '/assets/parkingpermit/extend',
    method: 'post',
    axiosParameters: { headers: { 'Content-Type': 'multipart/form-data' } },
  });

  const onSubmit = async (data: PermitRenewalFormModel) => {
    const confirmed = await confirm.showConfirmation(
      t('decisions:parkingPermit.renewal.form.confirmTitle'),
      t('decisions:parkingPermit.renewal.form.confirmDescription'),
      t('decisions:parkingPermit.renewal.form.yes'),
      t('decisions:parkingPermit.renewal.form.no'),
      'info'
    );
    if (confirmed) {
      const formData = new FormData();
      formData.append('description', data.description);
      formData.append('circumstancesChanged', data.circumstancesChanged);
      formData.append('date', data.date);
      formData.append('walkingAids', JSON.stringify(data.walkingAids));

      if (data.files.length) {
        try {
          await Promise.all(
            data.files.map(async (file) => {
              if (file.file instanceof Blob) {
                const fileData = await toBase64(file.file);
                const buf = Buffer.from(fileData, 'base64');
                const blob = new Blob([buf], { type: file.file.type });
                formData.append('files', blob, `${file.meta.name}.${file.meta.ending}`);
              }
            })
          );
        } catch {
          // File processing error - continue with submission
        }
      }

      try {
        await registerErrand.mutateAsync(formData);
        form.reset();
        toastMessage({
          position: 'bottom',
          closeable: false,
          message: t('decisions:parkingPermit.renewal.form.successMessage'),
          status: 'success',
        });
        setFormState('success');
      } catch {
        toastMessage({
          position: 'bottom',
          closeable: false,
          message: t('decisions:parkingPermit.renewal.form.errorMessage'),
          status: 'error',
        });
      }
    }
  };

  const files = form.watch('files');

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-56">
      <div className="flex flex-col">
        <FormLabel className="mb-12">
          {t('decisions:parkingPermit.renewal.form.circumstancesChanged')}
        </FormLabel>
        <RadioButton.Group inline>
          <RadioButton
            data-cy={`circumstances-changed-true`}
            size="sm"
            className="mr-sm"
            name={`circumstancesChanged-true`}
            id={`circumstancesChanged-true`}
            value={'TRUE'}
            checked={form.watch('circumstancesChanged') === 'TRUE'}
            onChange={() => {}}
            onClick={() => {
              form.setValue('circumstancesChanged', 'TRUE');
            }}
          >
            {t('decisions:parkingPermit.renewal.form.yes')}
          </RadioButton>
          <RadioButton
            data-cy={`circumstances-changed-false`}
            size="sm"
            className="mr-sm"
            name={`circumstancesChanged-false`}
            id={`circumstancesChanged-false`}
            value={'FALSE'}
            onChange={() => {}}
            checked={form.watch('circumstancesChanged') === 'FALSE'}
            onClick={() => {
              form.setValue('circumstancesChanged', 'FALSE');
            }}
          >
            {t('decisions:parkingPermit.renewal.form.no')}
          </RadioButton>
        </RadioButton.Group>
      </div>
      {form.watch('circumstancesChanged') === 'TRUE' && (
        <>
          <FormControl className="w-full desktop:w-3/4">
            <FormLabel htmlFor="description">{t('decisions:parkingPermit.renewal.form.describeChanges')}</FormLabel>
            <Input {...form.register('description', { required: t('decisions:parkingPermit.renewal.form.descriptionRequired') })} placeholder="" />
            {form.formState.errors.description && (
              <FormErrorMessage className="text-error">{form.formState.errors.description.message}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl>
            <FormLabel>{t('decisions:parkingPermit.renewal.form.walkingAidsLabel')}</FormLabel>
            <Checkbox.Group direction="row" defaultValue={['TRUE']} className="gap-16 flex flex-col desktop:flex-row">
              {walkingAids.map((aid, index) => (
                <Checkbox
                  key={`${aid.value}-${index}`}
                  value={aid.value}
                  data-cy={`walking-aids-checkbox-${index}`}
                  {...form.register('walkingAids')}
                >
                  {aid.label}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </FormControl>
        </>
      )}
      <FormControl>
        <FormLabel htmlFor="date">{t('decisions:parkingPermit.renewal.form.expiryDateLabel')}</FormLabel>
        <Input
          type="date"
          {...form.register('date', { required: t('decisions:parkingPermit.renewal.form.dateRequired') })}
          placeholder={t('decisions:parkingPermit.renewal.form.expiryDatePlaceholder')}
        />
        {form.formState.errors.date && (
          <FormErrorMessage className="text-error">{form.formState.errors.date.message}</FormErrorMessage>
        )}
      </FormControl>
      <FormControl className="w-full">
        <FormLabel>{t('decisions:parkingPermit.renewal.form.attachMedicalCertificate')}</FormLabel>
        <FormHelperText className="mb-12">{t('decisions:parkingPermit.renewal.form.allowedFileTypes')}</FormHelperText>
        {files && files.length > 0 ? (
          <FileUpload.List name="files">
            {files.map((file, i) => (
              <FileUpload.ListItem
                key={file.id}
                index={i}
                file={file}
                categoryProps={{
                  categories: { MEDICAL_CONFIRMATION: t('decisions:parkingPermit.renewal.form.medicalCertificateCategory') },
                }}
                actionsProps={{
                  showRemove: true,
                  onRemove: () =>
                    form.setValue(
                      'files',
                      form.watch('files').filter((f) => f !== file)
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
            name="files"
            maxFileSizeMB={MAX_FILE_SIZE_MB}
            onChange={(e) => {
              form.setValue('files', e.target.value);
            }}
          />
        )}
      </FormControl>
      <div className="flex flex-col desktop:flex-row gap-x-24 gap-y-20 desktop:items-center mt-40">
        <Button size="lg" variant="secondary" onClick={() => setFormState('showInfo')}>
          {t('decisions:parkingPermit.renewal.form.cancel')}
        </Button>
        <Button
          size="lg"
          color="vattjom"
          rightIcon={<ArrowRight />}
          type="submit"
          loading={registerErrand.isPending}
          loadingText={t('decisions:parkingPermit.renewal.form.submitting')}
        >
          {t('decisions:parkingPermit.renewal.form.submit')}
        </Button>
      </div>
    </form>
  );
};

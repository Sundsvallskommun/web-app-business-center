import { useApi } from '@services/api-service';
import { ACCEPTED_UPLOAD_FILETYPES } from '@services/asset-service';
import {
  Button,
  FileUpload,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  UploadFile,
  useConfirm,
  useSnackbar,
} from '@sk-web-gui/react';
import { toBase64 } from '@utils/toBase64';
import { ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';

const MAX_FILE_SIZE_MB = 25;

interface LostPermitFormModel {
  policeReportNumber: string;
  files: UploadFile[];
}

export const ParkingPermitLostForm = ({
  setFormState,
}: {
  setFormState: React.Dispatch<React.SetStateAction<'showForm' | 'showInfo' | 'success'>>;
}) => {
  const confirm = useConfirm();
  const toastMessage = useSnackbar();

  const form = useForm<LostPermitFormModel>({
    defaultValues: {
      policeReportNumber: '',
      files: [],
    },
    mode: 'onChange',
  });

  const reportLostPermit = useApi<unknown>({
    url: '/assets/parkingpermit/lost',
    method: 'post',
    axiosParameters: { headers: { 'Content-Type': 'multipart/form-data' } },
  });

  const onSubmit = async (data: LostPermitFormModel) => {
    const confirmed = await confirm.showConfirmation(
      'Skicka in anmälan?',
      'Vill du skicka in anmälan om borttappat parkeringstillstånd?',
      'Ja',
      'Nej',
      'info'
    );
    if (confirmed) {
      const formData = new FormData();
      formData.append('policeReportNumber', data.policeReportNumber);

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
        await reportLostPermit.mutateAsync(formData);
        form.reset();
        toastMessage({
          position: 'bottom',
          closeable: false,
          message: 'Din anmälan har skickats in!',
          status: 'success',
        });
        setFormState('success');
      } catch {
        toastMessage({
          position: 'bottom',
          closeable: false,
          message: 'Något gick fel när anmälan skulle skickas in. Försök igen senare.',
          status: 'error',
        });
      }
    }
  };

  const files = form.watch('files');

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-56">
      <p className="text-base">Bifoga din polisanmälan och ange diarienumret nedan.</p>

      <FormControl className="w-full desktop:w-3/4">
        <FormLabel htmlFor="policeReportNumber">Ange diarienummer från polisanmälan</FormLabel>
        <Input
          {...form.register('policeReportNumber', { required: 'Ange diarienummer' })}
          placeholder=""
          data-cy="police-report-number-input"
        />
        <FormHelperText>Diarienumret hittar du i din polisanmälan.</FormHelperText>
        {form.formState.errors.policeReportNumber && (
          <FormErrorMessage className="text-error">{form.formState.errors.policeReportNumber.message}</FormErrorMessage>
        )}
      </FormControl>

      <FormControl className="w-full">
        <FormLabel>Bifoga kopia av polisanmälan</FormLabel>
        <FormHelperText className="mb-12">Tillåtna filtyper: PDF, Word, JPEG. Max filstorlek: 25 MB</FormHelperText>
        {files && files.length > 0 ? (
          <FileUpload.List name="files">
            {files.map((file, i) => (
              <FileUpload.ListItem
                key={file.id}
                index={i}
                file={file}
                categoryProps={{
                  categories: { POLICE_REPORT: 'Polisanmälan' },
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
            data-cy="police-report-file-upload"
            onChange={(e) => {
              form.setValue('files', e.target.value);
            }}
          />
        )}
        {form.formState.errors.files && (
          <FormErrorMessage className="text-error">{form.formState.errors.files.message}</FormErrorMessage>
        )}
      </FormControl>

      <div className="flex flex-col desktop:flex-row gap-x-24 gap-y-20 desktop:items-center mt-40">
        <Button size="lg" variant="secondary" onClick={() => setFormState('showInfo')}>
          Avbryt
        </Button>
        <Button
          size="lg"
          color="vattjom"
          rightIcon={<ArrowRight />}
          type="submit"
          loading={reportLostPermit.isPending}
          loadingText="Skickar"
          data-cy="submit-lost-permit-button"
        >
          Skicka in
        </Button>
      </div>
    </form>
  );
};

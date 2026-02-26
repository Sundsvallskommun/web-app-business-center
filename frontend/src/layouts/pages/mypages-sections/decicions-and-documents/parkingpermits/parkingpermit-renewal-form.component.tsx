import { useApi } from '@services/api-service';
import {
  Button,
  Checkbox,
  FileUpload,
  FormControl,
  FormErrorMessage,
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

export const documentMimeTypes = [
  'video/quicktime',
  'video/mp4',
  'video/mpeg',
  'video/x-ms-wmv',
  'video/x-msvideo',
  'application/pdf',
  'application/rtf',
  'application/msword',
  'application/x-tika-msoffice',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.ms-outlook',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

export const ACCEPTED_UPLOAD_FILETYPES = [
  'mov',
  'mp4',
  'mpeg',
  'wmv',
  'avi',
  'bmp',
  'gif',
  'tif',
  'tiff',
  'jpeg',
  'jpg',
  'png',
  'htm',
  'html',
  'pdf',
  'rtf',
  'docx',
  'doc',
  'txt',
  'xlsx',
  'xls',
  'pptx',
  'odt',
  'ods',
  'text/html',
  'msg',
  'heic',
  'heif',
  ...documentMimeTypes,
];

const walkingAids = [
  { label: 'Rullator', value: 'Rullator' },
  { label: 'Elrullstol', value: 'Elrullstol' },
  { label: 'Krycka/kryckor/annat', value: 'Krycka/kryckor/annat' },
  { label: 'Rullstol (manuell)', value: 'Rullstol (manuell)' },
];

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
  const confirm = useConfirm();
  const toastMessage = useSnackbar();

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
      'Ansök om förlängning?',
      'Vill skicka in ansökan om förlängning av parkeringstillstånd?',
      'Ja',
      'Nej',
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
          message: 'Din ansökan har skickats in!',
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

  const files = form.watch('files');

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-56">
      <div className="flex flex-col">
        <FormLabel className="mb-12">
          Har förutsättningarna för din ansökan förändrats gentemot ditt nuvarande parkeringstillstånd? 
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
            Ja
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
            Nej
          </RadioButton>
        </RadioButton.Group>
      </div>
      {form.watch('circumstancesChanged') === 'TRUE' && (
        <>
          <FormControl className="w-full desktop:w-3/4">
            <FormLabel htmlFor="description">Beskriv kort vad som förändrats</FormLabel>
            <Input {...form.register('description', { required: 'Ange en beskrivning' })} placeholder="" />
            {form.formState.errors.description && (
              <FormErrorMessage className="text-error">{form.formState.errors.description.message}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl>
            <FormLabel>Vilket eller vilka hjälpmedel används vid förflyttning?</FormLabel>
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
        <FormLabel htmlFor="date">När gick ditt nuvarande parkeringstillstånd ut?</FormLabel>
        <Input
          type="date"
          {...form.register('date', { required: 'Ange ett datum' })}
          placeholder="Datum för utgång av parkeringstillståndet"
        />
        {form.formState.errors.date && (
          <FormErrorMessage className="text-error">{form.formState.errors.date.message}</FormErrorMessage>
        )}
      </FormControl>
      {files && files.length > 0 ? (
        <FileUpload.List name="files">
          {files.map((file, i) => (
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

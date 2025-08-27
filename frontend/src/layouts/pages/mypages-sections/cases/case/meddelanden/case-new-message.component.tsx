import { useApi } from '@services/api-service';
import {
  Button,
  FileUpload,
  FormControl,
  FormErrorMessage,
  Textarea,
  UploadFile,
  useSnackbar,
  useThemeQueries,
} from '@sk-web-gui/react';
import { toBase64 } from '@utils/toBase64';
import { useContext } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { CaseContext } from '../case-layout.component';

interface NewMessage {
  files: UploadFile[];
  message: string;
}

export default function CaseNewMessage() {
  const { isMinDesktop } = useThemeQueries();
  const context = useForm<NewMessage>({
    defaultValues: { files: [], message: '' },
    mode: 'onChange',
  });
  const { caseData } = useContext(CaseContext);
  const files = context.watch('files');
  const postMessageMutation = useApi({
    url: `/cases/${caseData?.caseId}/messages`,
    method: 'post',
    axiosParameters: {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  });
  const snackBar = useSnackbar();

  const handleOnSubmit: SubmitHandler<NewMessage> = async (values) => {
    const formData = new FormData();
    formData.append('message', values.message);
    if (values.files.length) {
      await Promise.all(
        values.files.map(async (file) => {
          if (file.file instanceof Blob) {
            const fileData = await toBase64(file.file);
            const buf = Buffer.from(fileData, 'base64');
            const blob = new Blob([buf], { type: file.file.type });
            formData.append('files', blob, `${file.meta.name}.${file.meta.ending}`);
          } else {
            console.warn('Invalid file structure:', file);
          }
        })
      ).catch((error) => {
        console.error('Error processing files:', error);
      });
    }
    postMessageMutation
      .mutateAsync(formData)
      .then((res) => {
        if (res.error) {
          snackBar({
            message: 'Meddelandet kunde inte skickas',
            status: 'error',
          });
        } else {
          context.reset();
          snackBar({
            message: 'Meddelandet skickades',
            status: 'success',
          });
        }
      })
      .catch((error) => {
        console.error('Error sending message:', error);
        snackBar({
          message: 'Meddelandet kunde inte skickas',
          status: 'error',
        });
      });
  };

  return (
    <div className="self-stretch flex flex-col gap-y-24 mx-20 desktop:mx-32">
      <FormProvider {...context}>
        <form className="flex flex-col gap-lg" onSubmit={context.handleSubmit(handleOnSubmit)}>
          <div className="flex flex-col gap-y-24">
            <div className="flex flex-col">
              <p className="font-bold mb-[1.2rem]">
                Skicka ett meddelande för att kontakta handläggaren för ditt ärende
              </p>
              <FormControl className="w-full">
                <Textarea
                  {...context.register('message', { required: 'Skriv ett meddelande' })}
                  placeholder="Skriv ett meddelande"
                  className="w-full min-h-72"
                  value={context.getValues().message}
                  readOnly={postMessageMutation.isPending}
                />
                {context.formState.errors.message && (
                  <FormErrorMessage className="text-small text-error" role="alert">
                    {context.formState.errors.message.message}
                  </FormErrorMessage>
                )}
              </FormControl>
              <FileUpload.Button className="mt-16" name="files" />
            </div>
            {files.length ? (
              <div className="flex flex-col py-16 gap-y-16">
                <h3 className="text-large font-normal font-[Arial]">Valda filer</h3>
                <FileUpload.List name="files" showBorder>
                  {files?.map((file, i) => (
                    <FileUpload.ListItem
                      key={`${file?.meta.name}-${i}`}
                      index={i}
                      actionsProps={{ showRemove: true }}
                    />
                  ))}
                </FileUpload.List>
              </div>
            ) : null}
          </div>
          <div className="flex desktop:justify-end">
            <Button className="w-full desktop:w-fit" size={isMinDesktop ? 'md' : 'lg'} type="submit" color="vattjom" loading={postMessageMutation.isPending}>
              Skicka
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

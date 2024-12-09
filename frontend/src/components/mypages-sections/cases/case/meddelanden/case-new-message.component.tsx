import { Button, FileUpload, Textarea, UploadFile } from '@sk-web-gui/react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';

interface NewMessage {
  attachments: UploadFile[];
  message: string;
}

export default function CaseNewMessage() {
  const context = useForm<NewMessage>({
    defaultValues: { attachments: [], message: '' },
    mode: 'onChange',
  });
  const files = context.watch('attachments');

  const handleOnSubmit: SubmitHandler<NewMessage> = (values) => {
    // TODO:
    // Install latest @sk-web-gui/react and @sk-web-gui/core when FileUpload is released
    // Send message to server
    // Reset form
    // Fetch new messages
    console.log('handleOnSubmit', values);
  };

  return (
    <div className="self-stretch flex flex-col gap-y-24 mx-32">
      <FormProvider {...context}>
        <form className="flex flex-col gap-lg" onSubmit={context.handleSubmit(handleOnSubmit)}>
          <div className="flex flex-col gap-y-24">
            <div className="flex flex-col gap-y-16">
              <h2 className="sr-only">Skriv ett nytt meddelande</h2>
              <Textarea
                {...context.register('message')}
                placeholder="Skriv ett meddelande"
                className="w-full min-h-72"
              />
              <FileUpload.Button name="attachments" />
            </div>
            <div className="flex flex-col py-16 gap-y-16">
              <h3 className="text-large font-normal font-[Arial]">Uppladdade filer</h3>
              <FileUpload.List name="attachments" showBorder>
                {files?.map((file, i) => (
                  <FileUpload.ListItem key={`${file?.meta.name}-${i}`} index={i} actionsProps={{ showRemove: true }} />
                ))}
              </FileUpload.List>
            </div>
          </div>
          <div className="flex justify-end">
            <Button size="lg" type="submit" color="vattjom">
              Skicka
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

import { FileUploadContextWrapper } from '@components/file-upload/file-upload-context';
import FileUploadList from '@components/file-upload/file-upload-list';
import { FileUploadModal } from '@components/file-upload/file-upload-modal.component';
import FormLogic from '@components/form/form-logic.component';
import { CaseContext } from '@components/mypages-sections/cases/case/case-layout.component';
import { MessageRequest } from '@data-contracts/case-data/data-contracts';
import { useApi, useApiService } from '@services/api-service';
import { Button, Textarea, useSnackbar } from '@sk-web-gui/react';
import { useContext } from 'react';
import { useFormContext, UseFormReturn } from 'react-hook-form';

const emptyMessage: MessageRequest = {
  message: '',
};

export enum AttachmentLabels {
  'APPLICATION_SQUARE_PLACE' = 'Ansökan torgplats',
  'OEP_APPLICATION' = 'Ansökan',
  'RECEIVED_CONTRACT' = 'Avtal inkommit',
  'CONTRACT_DRAFT' = 'Avtalsutkast',
  'CORPORATE_TAX_CARD' = 'F-skattesedel',
  'LEASE_REQUEST' = 'Förfrågan arrende',
  'REQUEST_TO_BUY_SMALL_HOUSE_PLOT' = 'Förfrågan köpa småhustomt',
  'INQUIRY_LAND_SALE' = 'Förfrågan markförsäljning',
  'LAND_PURCHASE_REQUEST' = 'Förfrågan markköp',
  'ROAD_ALLOWANCE_APPROVAL' = 'Godkännande för vägbidrag',
  'RECEIVED_MAP' = 'Karta inkommen',
  'PROTOCOL' = 'Protokoll',
  'PREVIOUS_AGREEMENT' = 'Tidigare avtal',
  'TERMINATION_OF_HUNTING_RIGHTS' = 'Uppsägning jakträtt',
  'OTHER' = 'Övrigt',
}

function CaseNewMessage() {
  const { register, watch, formState } = useFormContext();

  console.log('formState.errors', formState.errors);
  // console.log('watch()', watch());

  return (
    <div className="self-stretch flex flex-col gap-y-24 mx-32">
      <div className="flex flex-col items-start gap-y-24">
        <Textarea {...register('message')} placeholder="Skriv ett meddelande" className="w-full min-h-72" />
        {/* <Button type="button" variant="tertiary" leftIcon={<Icon name="paperclip" />}>
          Bifoga fil
        </Button> */}
        <FileUploadContextWrapper>
          <FileUploadModal
            attachmentTypeLabels={AttachmentLabels}
            onUpload={function mockFileUpload() {
              // return Promise.resolve(true); // Simulate success
              return Promise.reject();
            }}
          />
          <FileUploadList className="w-full" />
        </FileUploadContextWrapper>
      </div>
      <div className="flex justify-end">
        <Button size="lg" type="submit" color="vattjom">
          Skicka
        </Button>
      </div>
    </div>
  );
}

export default function CaseMessagesForm() {
  const { caseData } = useContext(CaseContext);
  const queryClient = useApiService((s) => s.queryClient);
  const representingMutation = useApi<MessageRequest>({
    url: `/case-data/messages/${caseData?.caseId}`,
    method: 'post',
  });
  const snackBar = useSnackbar();

  const handleOnSubmit = async (values: MessageRequest, context: UseFormReturn<MessageRequest>): Promise<void> => {
    console.log('values', values);
    console.log('context', context);
    const res = await representingMutation.mutateAsync(values);
    console.log('res', res);
    if (!res.error) {
      queryClient.invalidateQueries({
        queryKey: [`/case-data/messages/${caseData?.caseId}`],
      });
      snackBar({
        message: 'Meddelandet skickades.',
        status: 'success',
      });
    } else {
      snackBar({
        message: 'Det gick inte att skicka meddelandet.',
        status: 'error',
      });
    }
  };

  return (
    <FormLogic<MessageRequest> formData={{ ...emptyMessage, errandNumber: caseData?.caseId }} onSubmit={handleOnSubmit}>
      <CaseNewMessage />
    </FormLogic>
  );
}

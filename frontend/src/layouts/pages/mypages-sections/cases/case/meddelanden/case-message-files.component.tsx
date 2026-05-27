import { AttachmentResponse } from '@data-contracts/case-data/data-contracts';
import { FrontendMessageResponse } from '@interfaces/case';
import { getCaseMessageAttachment } from '@services/case-service';
import { downloadBlob } from '@utils/download-blob';
import { Button } from '@sk-web-gui/react';
import { Download } from 'lucide-react';
import { useCallback, useContext } from 'react';
import { CaseContext } from '../case-layout.component';

export default function CaseMessageFiles(props: { message: FrontendMessageResponse }) {
  const { message } = props;
  const { caseData } = useContext(CaseContext);

  const handleOpenFile = useCallback(
    (file: NonNullable<AttachmentResponse>) => async () => {
      if (!caseData) return;
      let url;
      if (caseData.system === 'OPEN_E_PLATFORM' || caseData.system === 'BYGGR' || caseData.system === 'ECOS') {
        url = `/cases/${caseData?.caseId}/messages/attachments/${file.attachmentId}`;
      } else {
        url = `/cases/${caseData?.caseId}/conversations/${message.conversationId}/messages/${message.messageId}/attachments/${file.attachmentId}`;
      }

      const attachment = await getCaseMessageAttachment(url); // returns base64 string
      downloadBlob(attachment, file.contentType || 'application/octet-stream', file.name || 'download');
    },
    [caseData, message.conversationId, message.messageId]
  );

  if (!message || message.attachments?.length === 0) return null;

  return (
    <div className="flex gap-16 flex-col">
      {message.attachments?.map((file, index) => {
        return (
          <Button
            onClick={handleOpenFile(file)}
            rightIcon={<Download className="ml-10" size={18} />}
            className={'whitespace-normal break-all max-w-full'}
            variant="link"
            size="md"
            key={`${index}`}
          >{`${file.name}`}</Button>
        );
      })}
    </div>
  );
}

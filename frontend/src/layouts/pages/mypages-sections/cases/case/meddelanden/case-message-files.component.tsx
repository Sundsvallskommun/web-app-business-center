import { AttachmentResponse } from '@data-contracts/case-data/data-contracts';
import { FrontendMessageResponse } from '@interfaces/case';
import { getCaseMessageAttachment } from '@services/case-service';
import { Button, Icon } from '@sk-web-gui/react';
import { File, Image } from 'lucide-react';
import { useCallback, useContext } from 'react';
import { CaseContext } from '../case-layout.component';

export default function CaseMessageFiles(props: { message: FrontendMessageResponse }) {
  const { message } = props;
  const { caseData } = useContext(CaseContext);

  const handleOpenFile = useCallback(
    (file: NonNullable<AttachmentResponse>) => async () => {
      const url = `/cases/${caseData?.caseId}/conversations/${message.conversationId}/messages/${message.messageId}/attachments/${file.attachmentId}`;

      const attachment = await getCaseMessageAttachment(url); // returns base64 string

      const uri = `data:${file.contentType};base64, ${attachment}`;
      const link = document.createElement('a');
      link.href = uri;
      link.download = file.name || 'download';
      link.click();
    },
    [caseData?.caseId, message.conversationId, message.messageId]
  );

  if (!message || message.attachments?.length === 0) return null;

  return (
    <div className="flex gap-16 flex-wrap">
      {message.attachments?.map((file, index) => {
        // eslint-disable-next-line jsx-a11y/alt-text
        const iconType = file.contentType?.includes('image') ? <Image /> : <File />; // || <Image />; // FIXME: implement filetype check
        return (
          <Button
            onClick={handleOpenFile(file)}
            leftIcon={<Icon icon={iconType} />}
            className={'whitespace-normal break-all max-w-full'}
            variant="tertiary"
            size="md"
            key={`${index}`}
          >{`${file.name}`}</Button>
        );
      })}
    </div>
  );
}

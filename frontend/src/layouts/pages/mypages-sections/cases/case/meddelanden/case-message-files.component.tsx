import { AttachmentResponse } from '@data-contracts/backend/data-contracts';
import { FrontendMessageResponse } from '@interfaces/case';
import { getCaseMessageAttachment } from '@services/case-service';
import { downloadBlob } from '@utils/download-blob';
import { cx, Spinner } from '@sk-web-gui/react';
import { Download, Paperclip } from 'lucide-react';
import { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CaseContext } from '../case-layout.component';

export default function CaseMessageFiles(props: { message: FrontendMessageResponse; mine?: boolean }) {
  const { message, mine } = props;
  const { t } = useTranslation('cases');
  const { caseData } = useContext(CaseContext);
  const [downloadingId, setDownloadingId] = useState<string | undefined>(undefined);

  const handleOpenFile = useCallback(
    (file: NonNullable<AttachmentResponse>) => async () => {
      if (!caseData) return;
      let url;
      if (caseData.system === 'OPEN_E_PLATFORM' || caseData.system === 'BYGGR' || caseData.system === 'ECOS') {
        url = `/cases/${caseData?.caseId}/messages/attachments/${file.attachmentId}`;
      } else if (caseData.system === 'CARE_MANAGEMENT') {
        // caremanagement keeps attachments on the message itself (no conversation), keyed by errand id.
        url = `/cases/${caseData?.caseId}/messages/${message.messageId}/attachments/${file.attachmentId}`;
      } else {
        url = `/cases/${caseData?.caseId}/conversations/${message.conversationId}/messages/${message.messageId}/attachments/${file.attachmentId}`;
      }

      setDownloadingId(file.attachmentId);
      try {
        const attachment = await getCaseMessageAttachment(url); // returns base64 string
        downloadBlob(attachment, file.contentType || 'application/octet-stream', file.name || 'download');
      } finally {
        setDownloadingId(undefined);
      }
    },
    [caseData?.caseId, message.conversationId, message.messageId]
  );

  if (!message || !message.attachments?.length) return null;

  const count = message.attachments.length;

  return (
    <section
      className={cx(
        'flex flex-col gap-10 rounded-12 border-1 p-12 shadow-sm',
        mine
          ? 'border-vattjom-background-300 bg-background-content text-body'
          : 'border-divider bg-background-200 text-body'
      )}
      aria-label={t('cases:messages.attachments')}
    >
      <div className="flex items-center justify-between gap-12 text-small">
        <div className="flex items-center gap-8 font-bold">
          <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-vattjom-background-100 text-vattjom-surface-primary">
            <Paperclip size={15} />
          </span>
          <span>{t('cases:messages.attachments')}</span>
        </div>
        <span className="shrink-0 text-secondary">
          {t(count === 1 ? 'cases:messages.fileCountSingular' : 'cases:messages.fileCountPlural', { count })}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {message.attachments.map((file, index) => {
          const isDownloading = downloadingId === file.attachmentId;
          return (
            <button
              key={`${index}`}
              type="button"
              disabled={isDownloading}
              className={cx(
                'flex w-full min-w-0 items-center gap-8 rounded-8 border-1 px-10 py-8 text-small transition disabled:opacity-60',
                mine
                  ? 'border-divider bg-background-200 text-body hover:bg-background-100'
                  : 'border-divider bg-background-content text-body hover:bg-background-100'
              )}
              onClick={handleOpenFile(file)}
            >
              <span className="min-w-0 flex-1 truncate text-left">{file.name}</span>
              {isDownloading ? <Spinner size={2} className="shrink-0" /> : <Download size={18} className="shrink-0" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}

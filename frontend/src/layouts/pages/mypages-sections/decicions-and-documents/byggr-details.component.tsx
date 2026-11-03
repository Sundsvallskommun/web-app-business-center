'use client';

import { DecisionAttachment, DecisionItem, DocumentDetails } from '@data-contracts/backend/data-contracts';
import { formatAssetDate } from '@services/asset-service';
import { FileUpload, Icon, UploadFile } from '@sk-web-gui/react';
import { File } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AttachmentDownload } from './decision-card.component';

interface DecisionFile {
  decision: DecisionItem;
  attachment: DecisionAttachment;
}

// Every decision document on the errand as one flat list, in decision order: newest decision first.
const toFiles = (decisions: DecisionItem[]): DecisionFile[] =>
  decisions.flatMap((decision) => decision.attachments.map((attachment) => ({ decision, attachment })));

const NO_UPLOADS: UploadFile[] = [];

export default function ByggrDetails({ document }: { document: DocumentDetails }) {
  const { t } = useTranslation('decisions');
  const files = toFiles(document.decisions);

  // The decision's own heading, as named in byggR, and its date. The outcome is never shown.
  const describe = (decision: DecisionItem): string =>
    [decision.title || t('decisions:decision'), formatAssetDate(decision.decidedAt)].filter(Boolean).join(', ');

  return (
    <div className="flex flex-col gap-12">
      <div className="font-bold">{t('decisions:documents')}</div>
      {files.length > 0 ? (
        <FileUpload.List files={NO_UPLOADS} aria-label={t('decisions:documents')} data-cy="document-files">
          {files.map(({ decision, attachment }, index) => (
            <FileUpload.ListItem key={`${decision.id}-${attachment.id}`} index={index} data-cy="document-file">
              <FileUpload.ListItemIcon icon={<Icon icon={<File />} />} />
              <FileUpload.ListItemContent>
                <FileUpload.ListItemContentName heading={attachment.name} description={describe(decision)} />
              </FileUpload.ListItemContent>
              <FileUpload.ListItemActions
                extraActions={<AttachmentDownload decisionId={decision.id} attachment={attachment} showName={false} />}
              />
            </FileUpload.ListItem>
          ))}
        </FileUpload.List>
      ) : (
        <p className="my-0 text-dark-secondary" data-cy="document-no-files">
          {t('decisions:byggr.noDocuments')}
        </p>
      )}
    </div>
  );
}

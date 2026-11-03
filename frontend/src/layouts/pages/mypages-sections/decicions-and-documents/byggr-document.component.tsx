'use client';

import { Card } from '@components/cards/card.component';
import { DecisionAttachment, DecisionItem } from '@data-contracts/backend/data-contracts';
import { formatAssetDate, getAssetStatusProps } from '@services/asset-service';
import { Divider, FileUpload, Icon, Label, UploadFile } from '@sk-web-gui/react';
import { File, FileCheck2 } from 'lucide-react';
import { ReactNode, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AssetsContext } from './asset-layout.component';
import { AttachmentDownload } from './decision-card.component';

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col items-start gap-4">
    <div className="font-bold">{label}</div>
    <div>{children}</div>
  </div>
);

interface DecisionFile {
  decision: DecisionItem;
  attachment: DecisionAttachment;
}

// Every decision document on the errand as one flat list, in decision order: newest decision first.
const toFiles = (decisions: DecisionItem[]): DecisionFile[] =>
  decisions.flatMap((decision) => decision.attachments.map((attachment) => ({ decision, attachment })));

const NO_UPLOADS: UploadFile[] = [];

export default function ByggrDocument() {
  const { t } = useTranslation('decisions');
  const { document } = useContext(AssetsContext);
  const byggr = document?.byggr;
  const title = document?.title;
  const statusProps = getAssetStatusProps(document?.status);
  const issued = formatAssetDate(document?.issued);
  const files = toFiles(document?.decisions ?? []);

  // The decision's own heading, as named in byggR, and its date. The outcome is never shown.
  const describe = (decision: DecisionItem): string =>
    [decision.title || t('decisions:decision'), formatAssetDate(decision.decidedAt)].filter(Boolean).join(', ');

  return (
    <Card className="bg-gronsta-background-300">
      <div className="flex flex-col desktop:flex-row gap-x-24 gap-y-20 desktop:items-center">
        <div className="flex gap-x-8 desktop:gap-x-24">
          <div className="list-item-card-content-icon">
            <Icon icon={<FileCheck2 />} />
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="text-h2-sm desktop:text-h2-lg mb-0 break-word hyphens-auto">{title}</h1>
            {byggr?.caseNumber && byggr.caseNumber !== title ? (
              <span className="text-small text-dark-secondary">{byggr.caseNumber}</span>
            ) : null}
          </div>
        </div>
        {document?.status ? (
          <Label rounded inverted color={statusProps.color}>
            {t(statusProps.tKey)}
          </Label>
        ) : null}
      </div>
      <Divider className="my-0" />
      <div className="flex flex-col desktop:flex-row gap-24 desktop:gap-80 flex-wrap">
        {byggr?.caseNumber ? <Field label={t('decisions:byggr.caseNumber')}>{byggr.caseNumber}</Field> : null}
        {byggr?.propertyDesignation ? (
          <Field label={t('decisions:byggr.propertyDesignation')}>{byggr.propertyDesignation}</Field>
        ) : null}
        {issued ? <Field label={t('decisions:byggr.decided')}>{issued}</Field> : null}
      </div>
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
                  extraActions={
                    <AttachmentDownload decisionId={decision.id} attachment={attachment} showName={false} />
                  }
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
    </Card>
  );
}

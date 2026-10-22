import { useAppContext } from '@contexts/app.context';
import { DecisionItem } from '@data-contracts/backend/data-contracts';
import { getDecisionAttachment, getDecisionTitle } from '@services/document-service';
import { Button, Divider, Icon, useSnackbar, useThemeQueries } from '@sk-web-gui/react';
import { getCaseReference } from '@utils/case-reference';
import { downloadBlob } from '@utils/download-blob';
import { getRepresentingModeRoute } from '@utils/representingModeRoute';
import dayjs from 'dayjs';
import sv from 'dayjs/locale/sv';
import { Download, File } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

dayjs.locale(sv);

export const DecisionCard: React.FC<{ item: DecisionItem }> = ({ item }) => {
  const attachment = item.attachments[0];
  const { representingMode } = useAppContext();
  const { t } = useTranslation('decisions');
  const { isPhone } = useThemeQueries();
  const [isDownloading, setIsDownloading] = useState(false);
  const toastMessage = useSnackbar();

  const handleDownload = useCallback(async () => {
    if (!attachment) return;
    setIsDownloading(true);
    try {
      const base64 = await getDecisionAttachment(item.id, attachment.id);
      if (!base64) {
        toastMessage({
          position: 'bottom',
          closeable: false,
          message: t('decisions:downloadError'),
          status: 'error',
        });
        return;
      }
      const filename = attachment.name || `beslut.${attachment.extension || 'pdf'}`;
      downloadBlob(base64, attachment.mimeType || 'application/pdf', filename);
    } finally {
      setIsDownloading(false);
    }
  }, [attachment, item.id, t, toastMessage]);

  return (
    <div>
      <div className="flex items-center justify-between gap-16 w-full">
        <div className="flex items-center gap-16">
          <div className="list-item-card-content-icon bg-vattjom-surface-accent">
            <Icon icon={<File />} />
          </div>
          <div>
            <div className="list-item-card-content-title">{getDecisionTitle(item, t('decisions:decision'))}</div>
            <div className="flex gap-x-16">
              {item.decidedAt ? (
                <div className="list-item-card-content-subtitle">
                  {t('decisions:decidedAt', { date: dayjs(item.decidedAt).format('D MMMM YYYY') })}
                </div>
              ) : null}
              {item.errandNumber ? (
                <div className="text-small">
                  {t('decisions:case')}{' '}
                  <Link
                    href={`${getRepresentingModeRoute(representingMode)}/arenden/${getCaseReference({
                      errandNumber: item.errandNumber,
                      caseId: item.errandId?.toString(),
                    })}`}
                    className="text-secondary underline"
                  >
                    {item.errandNumber}
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        {attachment && (
          <Button
            iconButton={isPhone}
            rightIcon={<Icon icon={<Download />} />}
            variant="tertiary"
            size="sm"
            loading={isDownloading}
            disabled={isDownloading}
            onClick={handleDownload}
            aria-label={isPhone ? t('decisions:download') : undefined}
          >
            {!isPhone ? t('decisions:download') : null}
          </Button>
        )}
      </div>
      <Divider className="mt-12" />
    </div>
  );
};

export const DecisionList = ({ decisions, ...rest }: { decisions: DecisionItem[] } & React.ComponentProps<'ul'>) => {
  if (decisions.length === 0) return null;

  return (
    <ul className="flex flex-col gap-y-8" data-cy="document-decisions" {...rest}>
      {decisions.map((decision) => (
        <li key={decision.id}>
          <DecisionCard item={decision} />
        </li>
      ))}
    </ul>
  );
};

import { CardList } from '@components/cards/cards.component';
import { useApi } from '@services/api-service';
import { ClientDecision, getDecisionAttachment, getDecisionOutcomeLabel, sortDecisionsByDate } from '@services/decision-service';
import { getCaseReference } from '@utils/case-reference';
import { downloadBlob } from '@utils/download-blob';
import { Button, Icon, Spinner, useSnackbar, useThemeQueries } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import sv from 'dayjs/locale/sv';
import { Download, File } from 'lucide-react';
import { useCallback, useState } from 'react';
import Link from 'next/link';
import { getRepresentingModeRoute } from '@utils/representingModeRoute';
import { useAppContext } from '@contexts/app.context';

dayjs.locale(sv);

const DecisionCard: React.FC<{ item: ClientDecision }> = ({ item }) => {
  const attachment = item.attachments?.[0];
  const { representingMode } = useAppContext();
  const { isPhone } = useThemeQueries();
  const [isDownloading, setIsDownloading] = useState(false);
  const toastMessage = useSnackbar();

  const handleDownload = useCallback(async () => {
    if (!attachment || !item.id) return;
    setIsDownloading(true);
    try {
      const base64 = await getDecisionAttachment(item.id, attachment.id);
      if (!base64) {
        toastMessage({
          position: 'bottom',
          closeable: false,
          message: 'Det gick inte att hämta beslutet. Försök igen senare.',
          status: 'error',
        });
        return;
      }
      const filename = attachment.name || `beslut-${item.id}.${attachment.extension || 'pdf'}`;
      downloadBlob(base64, attachment.mimeType || 'application/pdf', filename);
    } finally {
      setIsDownloading(false);
    }
  }, [attachment, item.id, toastMessage]);

  return (
    <div className="list-item-card">
      <div className="list-item-card-content">
        <div className="flex items-center justify-between gap-16 w-full">
          <div className="flex items-center gap-16">
            <div className="list-item-card-content-icon bg-vattjom-surface-accent">
              <Icon icon={<File />} />
            </div>
            <div>
              <div className="list-item-card-content-title">
                Beslut {item.decisionOutcome ? ` - ${getDecisionOutcomeLabel(item.decisionOutcome)}` : ''}
              </div>
              <div className="list-item-card-content-subtitle">
                {item.decidedAt ? `Beslutad ${dayjs(item.decidedAt).format('D MMMM YYYY')}` : ''} {/* </span> */}
              </div>
              {item.errandNumber ? (
                <div className="list-item-card-content-subtitle">
                  Ärende{' '}
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
          {attachment && (
            <Button
              iconButton={isPhone}
              rightIcon={<Icon icon={<Download />} />}
              variant="tertiary"
              size="sm"
              loading={isDownloading}
              disabled={isDownloading}
              onClick={handleDownload}
            >
              {!isPhone ? 'Ladda ner' : null}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export const Decisions = () => {
  const { data: decisionsData, isFetching: isFetchingDecisions } = useApi<ClientDecision[]>({
    url: '/decisions',
    method: 'get',
  });

  const sortedDecisions = decisionsData ? sortDecisionsByDate(decisionsData) : [];

  if (isFetchingDecisions) {
    return (
      <section className="mb-40">
        <div className="flex items-center">
          <p className="text-secondary">Laddar beslut</p>
          <Spinner className="ml-10" size={2} />
        </div>
      </section>
    );
  }

  if (!sortedDecisions.length) {
    return null;
  }

  return (
    <section className="mb-40">
      <h2 className="text-h3-sm md:text-h3-md xl:text-h3-lg mb-16">Beslut i dina ärenden</h2>
      <CardList
        aria-label="Beslut i ärenden"
        data={sortedDecisions}
        Card={DecisionCard}
        amountDisplayed={5}
        showMoreText="Visa fler"
        showLessText="Visa färre"
      />
    </section>
  );
};

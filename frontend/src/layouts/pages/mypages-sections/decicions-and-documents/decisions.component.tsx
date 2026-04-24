import { CardList } from '@components/cards/cards.component';
import { useApi } from '@services/api-service';
import { ClientDecision, sortDecisionsByDate } from '@services/decision-service';
import { downloadBlob } from '@utils/download-blob';
import { Button, Icon, Spinner } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import sv from 'dayjs/locale/sv';
import { File } from 'lucide-react';
import { useCallback, useMemo } from 'react';

dayjs.locale(sv);

const formatFileSize = (base64: string): string => {
  const bytes = base64.length * 3 / 4;
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
};

const DecisionCard: React.FC<{ item: ClientDecision }> = ({ item }) => {
  const attachment = item.attachments?.[0];

  const handleDownload = useCallback(() => {
    if (!attachment?.file) return;
    const filename = attachment.name || `beslut-${item.id}.pdf`;
    downloadBlob(attachment.file, 'application/pdf', filename);
  }, [attachment, item.id]);

  const fileSize = useMemo(() => (attachment?.file ? formatFileSize(attachment.file) : null), [attachment?.file]);

  return (
    <div className="list-item-card">
      <div className="list-item-card-content">
        <div className="flex items-center justify-between gap-16 w-full">
          <div className="flex items-center gap-16">
            <div className="list-item-card-content-icon bg-vattjom-surface-accent">
              <Icon icon={<File />} />
            </div>
            <div>
              <div className="list-item-card-content-title">{`Beslut${fileSize ? ` (pdf, ${fileSize})` : ''}`}</div>
              <div className="list-item-card-content-subtitle">
                {item.decidedAt ? `Beslutad ${dayjs(item.decidedAt).format('D MMMM YYYY')}` : ''}
              </div>
            </div>
          </div>
          {attachment?.file && (
            <Button variant="tertiary" size="sm" onClick={handleDownload}>
              Ladda ner
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
      <div className="flex items-center">
        <p className="text-secondary">Laddar beslut</p>
        <Spinner className="ml-10" size={2} />
      </div>
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

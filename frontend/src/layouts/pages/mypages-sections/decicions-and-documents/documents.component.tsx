import { CardList } from '@components/cards/cards.component';
import { useAppContext } from '@contexts/app.context';
import { DocumentItem } from '@data-contracts/backend/data-contracts';
import { formatAssetValidity, getAssetStatusProps } from '@services/asset-service';
import { Button, Icon, Label } from '@sk-web-gui/react';
import { getRepresentingModeRoute } from '@utils/representingModeRoute';
import { ChevronRight, FileCheck2 } from 'lucide-react';
import NextLink from 'next/link';
import { useTranslation } from 'react-i18next';

const DocumentCard: React.FC<{ item: DocumentItem }> = ({ item }) => {
  const { representingMode } = useAppContext();
  const { t } = useTranslation('decisions');
  const statusProps = getAssetStatusProps(item.status);
  const validity = formatAssetValidity(item, t);

  return (
    <NextLink
      href={`${getRepresentingModeRoute(representingMode)}/beslut-och-dokument/${item.id}`}
      aria-label={`Visa ${item.title}`}
      className="list-item-card-link"
    >
      <div className="list-item-card">
        <div className="list-item-card-content">
          <div className="flex items-center gap-16">
            <div className="list-item-card-content-icon">
              <Icon icon={<FileCheck2 />} />
            </div>
            <div>
              <div className="list-item-card-content-title">{item.title}</div>
              <div className="list-item-card-content-subtitle">{validity}</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-16">
          <Label rounded inverted color={statusProps.color}>
            {t(statusProps.tKey)}
          </Label>
          <div className="list-item-card-button">
            <Button
              as="span"
              variant="tertiary"
              showBackground={false}
              iconButton
              aria-label={t('decisions:goToDecisions')}
            >
              <Icon icon={<ChevronRight />} />
            </Button>
          </div>
        </div>
      </div>
    </NextLink>
  );
};

export const Documents = ({ documents }: { documents: DocumentItem[] }) => {
  const { t } = useTranslation('decisions');

  if (documents.length === 0) return null;

  return (
    <section className="mb-40">
      <h2 className="text-h3-sm md:text-h3-md xl:text-h3-lg mb-16">{t('decisions:documents')}</h2>
      <CardList aria-label={t('decisions:documents')} data={documents} Card={DocumentCard} amountDisplayed={5} />
    </section>
  );
};
